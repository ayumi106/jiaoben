(function(){
  var _d = new Date('2026-06-30');  // 截止日期
  var _now = new Date();
  if (_now > _d) throw new Error('已过期，请联系作者更新');

  function getBookInfo() {
    var host = location.hostname;
    if (host === 'www.itextbook.cn') return getIText();
    if (host === 'www.iresearchbook.cn') return getIRes();
    return null;
  }

  function cleanFilename(name) {
    if (name === undefined || name === null) return '';
    return String(name).replace(/[<>:"/\\|?*\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function getIText() {
    var a = document.querySelector('.book-img a[href*="goCdf"]');
    if (!a) return null;
    var url = new URL(a.href, location.origin);
    var cdf = url.searchParams.get('cdf');
    if (!cdf) return null;
    var en = '';
    var enEl = document.querySelector('.book-title a.book_name');
    if (enEl) en = (enEl.getAttribute('title') || enEl.textContent || '').replace(/\s+/g, ' ').trim();
    var zh = '';
    var zhEl = document.querySelector('.book-hint a');
    if (zhEl) zh = zhEl.textContent.trim();
    var filename = cleanFilename(en) + (zh ? ' ' + cleanFilename(zh) : '') + '.pdf';
    var dl = 'https://www.itextbook.cn/f/cdf/file?file=' + encodeURIComponent(cdf);
    return { downloadUrl: dl, filename: filename };
  }

  function getIRes() {
    if (typeof bookStorePath === 'undefined' || typeof bookId === 'undefined') return null;
    var cdf = bookStorePath;
    if (!cdf) return null;
    var name = '', nameENG = '', author = '', year = '', isbn = '';
    if (typeof ebook !== 'undefined') {
      name = ebook.name || '';
      nameENG = ebook.nameENG || '';
      author = ebook.author || '';
      year = ebook.publishYear || '';
      isbn = ebook.eisbn || '';
    }
    if (!name) { var t = document.querySelector('.ebook-detail-content .title p'); if (t) name = t.textContent.trim(); }
    if (!nameENG) { var e = document.getElementById('nameEngId'); if (e) nameENG = e.textContent.replace(/\s+/g, ' ').trim(); }
    if (!author) { var a = document.getElementById('authorTextCon'); if (a) author = a.textContent.replace('— ', '').trim(); }
    if (!year) { var m = document.body.innerHTML.match(/出版信息[^0-9]*(\d{4})/); if (m) year = m[1]; }
    if (!isbn) { var i = document.getElementById('book_eisbn'); if (i) isbn = i.textContent.trim(); }
    var parts = [name, nameENG, author, year, isbn].map(cleanFilename).filter(Boolean);
    var filename = (parts.join(' ') || '教材') + '.pdf';
    var dl = 'https://www.iresearchbook.cn/f/cdf/file?file=' + encodeURIComponent(cdf) + '&bookId=' + bookId + '&officeName=null&oId=null';
    return { downloadUrl: dl, filename: filename };
  }

  function removeWatermarkByName(pdfBytes) {
    if (typeof PDFLib === 'undefined') throw new Error('pdf-lib 未加载');
    return PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true }).then(function(pdfDoc) {
      var pages = pdfDoc.getPages();
      var total = 0;
      for (var i = 0; i < pages.length; i++) {
        var res = pages[i].node.Resources();
        if (!res) continue;
        var xos = res.lookup(PDFLib.PDFName.of('XObject'), PDFLib.PDFDict);
        if (!xos) continue;
        var toDel = [];
        for (var _i = 0, _arr = Array.from(xos.dict.entries()); _i < _arr.length; _i++) {
          var entry = _arr[_i];
          var k = entry[0], v = entry[1];
          var n = (k.encodedName || k.value).replace(/^\//, '');
          if (/^Xi\d+$/.test(n)) {
            toDel.push(k);
            var xo = pdfDoc.context.lookup(v);
            if (xo && xo.dict) {
              var sm = xo.dict.get(PDFLib.PDFName.of('SMask'));
              if (sm) { try { pdfDoc.context.delete(sm); } catch(e){} }
            }
          }
        }
        toDel.forEach(function(k) { xos.dict.delete(k); });
        total += toDel.length;
        if (xos.dict.size === 0) res.dict.delete(PDFLib.PDFName.of('XObject'));
      }
      console.log('[去水印] 删除 ' + total + ' 个对象');
      return pdfDoc.save({ useObjectStreams: false, addDefaultPage: false, objectsPerTick: 100, updateFieldAppearances: false });
    });
  }

  function downloadAndCleanPDF(downloadUrl, filename, setUI) {
    setUI('📥 正在连接...', 0, '⏳', true);
    fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Referer': location.href, 'Accept': 'application/pdf, */*' }
    }).then(function(response) {
      if (!response.ok) throw new Error('状态码 ' + response.status);
      var contentLength = +response.headers.get('Content-Length') || 0;
      if (!contentLength) {
        setUI('📥 下载中 (大小未知)', 50, '⏳', true);
        return response.blob().then(function(blob) { return handleBlob(blob, filename, setUI); });
      }
      var reader = response.body.getReader();
      var chunks = [], received = 0;
      return reader.read().then(function processResult(result) {
        if (result.done) {
          var blob = new Blob(chunks, { type: 'application/pdf' });
          setUI('📥 下载完成', 100, '🔧 去水印中...', true);
          return handleBlob(blob, filename, setUI);
        }
        chunks.push(result.value);
        received += result.value.length;
        var pct = Math.round((received / contentLength) * 100);
        var sizeMB = (received / 1048576).toFixed(1);
        setUI('📥 下载中 ' + sizeMB + 'MB / ' + (contentLength/1048576).toFixed(1) + 'MB', pct, '⏳', true);
        return reader.read().then(processResult);
      });
    }).catch(function(err) {
      console.error(err);
      setUI('❌ ' + err.message, 0, '⬇️ 重试', false);
      setTimeout(function() { setUI('点击下方按钮下载', 0, '⬇️ 下载 PDF', false); }, 3000);
    });
  }

  function handleBlob(blob, filename, setUI) {
    setUI('🔧 正在去除水印...', 100, '🔧', true);
    return blob.arrayBuffer().then(function(buf) {
      return removeWatermarkByName(buf);
    }).then(function(cleaned) {
      var finalBlob = new Blob([cleaned], { type: 'application/pdf' });
      var url = URL.createObjectURL(finalBlob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
      setUI('✅ 下载完成，水印已清除', 100, '⬇️ 再次下载', false);
      setTimeout(function() { setUI('点击下方按钮下载', 0, '⬇️ 下载 PDF', false); }, 4000);
    }).catch(function(err) {
      console.error(err);
      setUI('❌ ' + err.message, 0, '⬇️ 重试', false);
    });
  }

  // 暴露接口
  window.itextbookDownloader = {
    getBookInfo: getBookInfo,
    downloadAndCleanPDF: downloadAndCleanPDF,
    removeWatermarkByName: removeWatermarkByName
  };
})();
