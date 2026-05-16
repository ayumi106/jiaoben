(function(){
  var _0x1 = new Date('2026-12-31'), _0x2 = new Date();
  if (_0x2 > _0x1) throw new Error('已过期，请联系作者更新');

  var _0x3 = function(){
    var _0x4 = location.hostname;
    if (_0x4 === 'www.itextbook.cn') return _0x7();
    if (_0x4 === 'www.iresearchbook.cn') return _0x8();
    return null;
  };

  var _0x5 = function(_0x6){
    if (_0x6 === undefined || _0x6 === null) return '';
    return String(_0x6).replace(/[<>:"/\\|?*\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
  };

  var _0x7 = function(){
    var _0x9 = document.querySelector('.book-img a[href*="goCdf"]');
    if (!_0x9) return null;
    var _0xa = new URL(_0x9.href, location.origin);
    var _0xb = _0xa.searchParams.get('cdf');
    if (!_0xb) return null;
    var _0xc = '';
    var _0xd = document.querySelector('.book-title a.book_name');
    if (_0xd) _0xc = (_0xd.getAttribute('title') || _0xd.textContent || '').replace(/\s+/g, ' ').trim();
    var _0xe = '';
    var _0xf = document.querySelector('.book-hint a');
    if (_0xf) _0xe = _0xf.textContent.trim();
    var _0x10 = _0x5(_0xc) + (_0xe ? ' ' + _0x5(_0xe) : '') + '.pdf';
    var _0x11 = 'https://www.itextbook.cn/f/cdf/file?file=' + encodeURIComponent(_0xb);
    return { downloadUrl: _0x11, filename: _0x10 };
  };

  var _0x8 = function(){
    if (typeof bookStorePath === 'undefined' || typeof bookId === 'undefined') return null;
    var _0x12 = bookStorePath;
    if (!_0x12) return null;
    var _0x13 = '', _0x14 = '', _0x15 = '', _0x16 = '', _0x17 = '';
    if (typeof ebook !== 'undefined') {
      _0x13 = ebook.name || '';
      _0x14 = ebook.nameENG || '';
      _0x15 = ebook.author || '';
      _0x16 = ebook.publishYear || '';
      _0x17 = ebook.eisbn || '';
    }
    if (!_0x13) { var _0x18 = document.querySelector('.ebook-detail-content .title p'); if (_0x18) _0x13 = _0x18.textContent.trim(); }
    if (!_0x14) { var _0x19 = document.getElementById('nameEngId'); if (_0x19) _0x14 = _0x19.textContent.replace(/\s+/g, ' ').trim(); }
    if (!_0x15) { var _0x1a = document.getElementById('authorTextCon'); if (_0x1a) _0x15 = _0x1a.textContent.replace('— ', '').trim(); }
    if (!_0x16) { var _0x1b = document.body.innerHTML.match(/出版信息[^0-9]*(\d{4})/); if (_0x1b) _0x16 = _0x1b[1]; }
    if (!_0x17) { var _0x1c = document.getElementById('book_eisbn'); if (_0x1c) _0x17 = _0x1c.textContent.trim(); }
    var _0x1d = [_0x13, _0x14, _0x15, _0x16, _0x17].map(_0x5).filter(Boolean);
    var _0x1e = (_0x1d.join(' ') || '教材') + '.pdf';
    var _0x1f = 'https://www.iresearchbook.cn/f/cdf/file?file=' + encodeURIComponent(_0x12) + '&bookId=' + bookId + '&officeName=null&oId=null';
    return { downloadUrl: _0x1f, filename: _0x1e };
  };

  var _0x20 = function(_0x21){
    if (typeof PDFLib === 'undefined') throw new Error('pdf-lib 库未加载');
    var _0x22 = PDFLib.PDFDocument, _0x23 = PDFLib.PDFName, _0x24 = PDFLib.PDFDict;
    return _0x22.load(_0x21, { ignoreEncryption: true }).then(function(_0x25){
      var _0x26 = _0x25.getPages();
      var _0x27 = 0;
      for (var _0x28 = 0; _0x28 < _0x26.length; _0x28++) {
        var _0x29 = _0x26[_0x28].node.Resources();
        if (!_0x29) continue;
        var _0x2a = _0x29.lookup(_0x23.of('XObject'), _0x24);
        if (!_0x2a) continue;
        var _0x2b = [];
        var _0x2c = Array.from(_0x2a.dict.entries());
        for (var _0x2d = 0; _0x2d < _0x2c.length; _0x2d++) {
          var _0x2e = _0x2c[_0x2d][0], _0x2f = _0x2c[_0x2d][1];
          var _0x30 = (_0x2e.encodedName || _0x2e.value).replace(/^\//, '');
          if (/^Xi\d+$/.test(_0x30)) {
            _0x2b.push(_0x2e);
            var _0x31 = _0x25.context.lookup(_0x2f);
            if (_0x31 && _0x31.dict) {
              var _0x32 = _0x31.dict.get(_0x23.of('SMask'));
              if (_0x32) { try { _0x25.context.delete(_0x32); } catch(e){} }
            }
          }
        }
        _0x2b.forEach(function(_0x33){ _0x2a.dict.delete(_0x33); });
        _0x27 += _0x2b.length;
        if (_0x2a.dict.size === 0) _0x29.dict.delete(_0x23.of('XObject'));
      }
      console.log('[去水印] 已删除 ' + _0x27 + ' 个对象');
      return _0x25.save({ useObjectStreams: false, addDefaultPage: false, objectsPerTick: 100, updateFieldAppearances: false });
    }).catch(function(_0x34){
      console.log('[去水印] 未发现水印');
      return _0x21;
    });
  };

  var _0x35 = function(_0x36, _0x37, _0x38){
    _0x38('📥 正在连接...', 0, '⏳', true);
    fetch(_0x36, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Referer': location.href, 'Accept': 'application/pdf, */*' }
    }).then(function(_0x39){
      if (!_0x39.ok) throw new Error('服务器返回 ' + _0x39.status);
      var _0x3a = +_0x39.headers.get('Content-Length') || 0;
      if (!_0x3a) {
        _0x38('📥 下载中 (大小未知)', 50, '⏳', true);
        return _0x39.blob().then(function(_0x3b){ return _0x40(_0x3b, _0x37, _0x38); });
      }
      var _0x3c = _0x39.body.getReader();
      var _0x3d = [], _0x3e = 0;
      return _0x3c.read().then(function _0x3f(_0x41){
        if (_0x41.done) {
          var _0x42 = new Blob(_0x3d, { type: 'application/pdf' });
          _0x38('📥 下载完成', 100, '🔧 去水印中...', true);
          return _0x40(_0x42, _0x37, _0x38);
        }
        _0x3d.push(_0x41.value);
        _0x3e += _0x41.value.length;
        var _0x43 = Math.round((_0x3e / _0x3a) * 100);
        var _0x44 = (_0x3e / 1048576).toFixed(1);
        _0x38('📥 下载中 ' + _0x44 + 'MB / ' + (_0x3a/1048576).toFixed(1) + 'MB', _0x43, '⏳', true);
        return _0x3c.read().then(_0x3f);
      });
    }).catch(function(_0x45){
      console.error(_0x45);
      _0x38('❌ ' + _0x45.message, 0, '⬇️ 重试', false);
      setTimeout(function(){ _0x38('点击下方按钮下载', 0, '⬇️ 下载 PDF', false); }, 3000);
    });
  };

  var _0x40 = function(_0x46, _0x47, _0x48){
    _0x48('🔧 正在去除水印...', 100, '🔧', true);
    return _0x46.arrayBuffer().then(function(_0x49){
      return _0x20(_0x49);
    }).then(function(_0x4a){
      var _0x4b = new Blob([_0x4a], { type: 'application/pdf' });
      var _0x4c = URL.createObjectURL(_0x4b);
      var _0x4d = document.createElement('a');
      _0x4d.href = _0x4c;
      _0x4d.download = _0x47;
      document.body.appendChild(_0x4d);
      _0x4d.click();
      document.body.removeChild(_0x4d);
      setTimeout(function(){ URL.revokeObjectURL(_0x4c); }, 1000);
      _0x48('✅ 下载完成，水印已清除', 100, '⬇️ 再次下载', false);
      setTimeout(function(){ _0x48('点击下方按钮下载', 0, '⬇️ 下载 PDF', false); }, 4000);
    }).catch(function(_0x4e){
      console.error(_0x4e);
      _0x48('❌ ' + _0x4e.message, 0, '⬇️ 重试', false);
    });
  };

  window.itextbookDownloader = {
    getBookInfo: _0x3,
    downloadAndCleanPDF: _0x35,
    removeWatermarkByName: _0x20
  };
})();
