// ==UserScript==
// @name         通用论文平台配置库
// @description  为论文下载工具提供各平台配置支持（北师大/北大/复旦/人大/武大/法大/北科大/上交大）
// @version      1.0
// @author       xiaotianxt
// @license      GNU GPLv3
// @namespace    https://scriptcat.org/users/你的用户名
// @grant        none
// ==/UserScript==

// 将配置挂载到 window 对象，供主脚本调用
window.ThesisConfig = (function() {
    "use strict";

    // ========== 去除URL中的watermark参数 ==========
    function removeWatermarkFromUrl(url) {
        if (!url) return url;
        if (!url.includes('watermark=')) return url;

        let cleanedUrl = url;
        cleanedUrl = cleanedUrl.replace(/\?watermark=[^&]*&?/, '?');
        cleanedUrl = cleanedUrl.replace(/&watermark=[^&]*/, '');
        cleanedUrl = cleanedUrl.replace(/\?&/, '?');
        cleanedUrl = cleanedUrl.replace(/\?$/, '');
        cleanedUrl = cleanedUrl.replace(/&$/, '');

        return cleanedUrl;
    }

    // ========== 检查URL是否有水印 ==========
    function hasWatermarkInUrl(url) {
        return url && url.includes('watermark=');
    }

    // ==================== 平台配置 ====================
    const PLATFORMS = {
        BNU: {
            name: '北京师范大学',
            match: (url) => url.includes('etdlib.bnu.edu.cn'),
            getJumpUrl: (fid, fileId, page) => {
                return `https://etdlib.bnu.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=undefined`;
            },
            processImageUrl: (src) => {
                return removeWatermarkFromUrl(src.replace(/watermark=[^&]+$/, "watermark="));
            },
            getParams: () => {
                return {
                    fid: $("#fid").val(),
                    totalPage: parseInt($("#totalPages").html().replace(/ \/ /, "")),
                    fileId: $("#fileName").val()
                };
            },
            chunksPerPage: 3
        },
        PKU: {
            name: '北京大学',
            match: (url) => url.includes('drm.lib.pku.edu.cn'),
            getJumpUrl: (fid, fileId, page) => {
                return `https://drm.lib.pku.edu.cn/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
            },
            processImageUrl: (src) => {
                let fullUrl = src;
                if (src.startsWith('/')) {
                    fullUrl = `https://drm.lib.pku.edu.cn${src}`;
                }
                return fullUrl;
            },
            getParams: () => {
                let fid = $("#fid").val();
                if (!fid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                let totalPage = parseInt($("#totalPages").html().replace(/ \/ /, ""));
                if (isNaN(totalPage)) {
                    const totalPagesElem = $(".total-pages, #totalPage, .page-count").first();
                    if (totalPagesElem.length) {
                        totalPage = parseInt(totalPagesElem.text().replace(/[^0-9]/g, ''));
                    }
                }

                let fileId = $("#fileName").val();
                if (!fileId) {
                    fileId = document.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
                }

                return { fid, totalPage, fileId };
            },
            chunksPerPage: 3
        },
        FDU: {
            name: '复旦大学',
            match: (url) => url.includes('drm.fudan.edu.cn'),
            getJumpUrl: (fid, fileId, page) => {
                return `https://drm.fudan.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
            },
            processImageUrl: (src) => {
                let fullUrl = src;
                if (src.startsWith('/')) {
                    fullUrl = `https://drm.fudan.edu.cn${src}`;
                }
                return removeWatermarkFromUrl(fullUrl);
            },
            getParams: () => {
                let fid = $("#fid").val();
                if (!fid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                let totalPage = parseInt($("#totalPages").html().replace(/ \/ /, ""));
                if (isNaN(totalPage)) {
                    const totalPagesElem = $(".total-pages, #totalPage, .page-count").first();
                    if (totalPagesElem.length) {
                        totalPage = parseInt(totalPagesElem.text().replace(/[^0-9]/g, ''));
                    }
                }

                let fileId = $("#fileName").val();
                if (!fileId) {
                    fileId = document.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
                }

                return { fid, totalPage, fileId };
            },
            chunksPerPage: 3
        },
        RUC: {
            name: '中国人民大学',
            match: (url) => url.includes('bklib.ruc.edu.cn'),
            getJumpUrl: (fid, fileId, page) => {
                return `https://bklib.ruc.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
            },
            processImageUrl: (src) => {
                let fullUrl = src;
                if (src.startsWith('/')) {
                    fullUrl = `https://bklib.ruc.edu.cn${src}`;
                }
                return removeWatermarkFromUrl(fullUrl);
            },
            getParams: () => {
                let fid = $("#fid").val();
                if (!fid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                let totalPage = parseInt($("#totalPages").html().replace(/ \/ /, ""));
                if (isNaN(totalPage)) {
                    const totalPagesElem = $(".total-pages, #totalPage, .page-count").first();
                    if (totalPagesElem.length) {
                        totalPage = parseInt(totalPagesElem.text().replace(/[^0-9]/g, ''));
                    }
                }

                let fileId = $("#fileName").val();
                if (!fileId) {
                    fileId = document.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
                }

                return { fid, totalPage, fileId };
            },
            chunksPerPage: 3
        },
        RUC_PROXY: {
            name: '中国人民大学(代理)',
            match: (url) => url.includes('libproxy.ruc.edu.cn'),
            getJumpUrl: (fid, fileId, page) => {
                const currentUrl = new URL(window.location.href);
                const proxyBase = `${currentUrl.protocol}//${currentUrl.hostname}`;
                return `${proxyBase}/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
            },
            processImageUrl: (src) => {
                return removeWatermarkFromUrl(src);
            },
            getParams: () => {
                let fid = $("#fid").val();
                if (!fid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                let totalPage = parseInt($("#totalPages").html().replace(/ \/ /, ""));
                if (isNaN(totalPage)) {
                    const totalPagesElem = $(".total-pages, #totalPage, .page-count").first();
                    if (totalPagesElem.length) {
                        totalPage = parseInt(totalPagesElem.text().replace(/[^0-9]/g, ''));
                    }
                }

                let fileId = $("#fileName").val();
                if (!fileId) {
                    fileId = document.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
                }

                return { fid, totalPage, fileId };
            },
            chunksPerPage: 3
        },
        WHU: {
            name: '武汉大学',
            match: (url) => url.includes('paperright.lib.whu.edu.cn'),
            getJumpUrl: (fid, fileId, page) => {
                return `https://paperright.lib.whu.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}`;
            },
            processImageUrl: (src) => {
                let fullUrl = src;
                if (src.startsWith('/')) {
                    fullUrl = `https://paperright.lib.whu.edu.cn${src}`;
                }
                return removeWatermarkFromUrl(fullUrl);
            },
            getParams: () => {
                let fid = $("#fid").val();
                if (!fid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                let totalPage = parseInt($("#totalPages").html().replace(/ \/ /, ""));
                if (isNaN(totalPage)) {
                    const totalPagesElem = $(".total-pages, #totalPage, .page-count").first();
                    if (totalPagesElem.length) {
                        totalPage = parseInt(totalPagesElem.text().replace(/[^0-9]/g, ''));
                    }
                }

                let fileId = $("#fileName").val();
                if (!fileId) {
                    fileId = document.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
                }

                return { fid, totalPage, fileId };
            },
            chunksPerPage: 3
        },
        CUPL: {
            name: '中国政法大学',
            match: (url) => url.includes('vpn.cupl.edu.cn') || url.includes('paper.cupl.edu.cn'),
            getJumpUrl: (fid, fileId, page) => {
                const currentUrl = window.location.href;
                const vpnBaseMatch = currentUrl.match(/(https:\/\/vpn\.cupl\.edu\.cn\/https\/[a-f0-9]+)/);
                const vpnBase = vpnBaseMatch ? vpnBaseMatch[1] : 'https://vpn.cupl.edu.cn/https/77726476706e69737468656265737421e0f65199357e6b456e04c7a99c406d3670';
                return `${vpnBase}/read/jumpServlet?vpn-12-o2-paper.cupl.edu.cn&page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
            },
            processImageUrl: (src, vpnBase = null) => {
                if (!vpnBase) {
                    const currentUrl = window.location.href;
                    const vpnBaseMatch = currentUrl.match(/(https:\/\/vpn\.cupl\.edu\.cn\/https\/[a-f0-9]+)/);
                    vpnBase = vpnBaseMatch ? vpnBaseMatch[1] : 'https://vpn.cupl.edu.cn/https/77726476706e69737468656265737421e6e74fd22425785c300d8db9d6562d';
                }

                let processedSrc = src;
                
                if (src && src.includes('paper.cupl.edu.cn')) {
                    const pageMatch = src.match(/page=([A-F0-9]+)/);
                    if (pageMatch) {
                        const pageParam = pageMatch[1];
                        processedSrc = `${vpnBase}/read/pdfboxServlet?vpn-1&vpn-1&page=${pageParam}`;
                    } else {
                        const pathMatch = src.match(/\/read\/[^?]*\??.*/);
                        if (pathMatch) {
                            let path = pathMatch[0];
                            if (path.includes('?')) {
                                path = path.replace('?', '?vpn-1&vpn-1&');
                            } else {
                                path = path + '?vpn-1&vpn-1';
                            }
                            processedSrc = `${vpnBase}${path}`;
                        }
                    }
                } else if (src && (src.includes('vpn.cupl.edu.cn') || src.startsWith('/read/'))) {
                    const pageMatch = src.match(/page=([A-F0-9]+)/);
                    if (pageMatch) {
                        const pageParam = pageMatch[1];
                        processedSrc = `${vpnBase}/read/pdfboxServlet?vpn-1&vpn-1&page=${pageParam}`;
                    } else if (src.startsWith('/read/')) {
                        processedSrc = `${vpnBase}${src}?vpn-1&vpn-1`;
                    } else {
                        processedSrc = src;
                    }
                }
                
                return removeWatermarkFromUrl(processedSrc);
            },
            getParams: () => {
                let fid = $("#fid").val();
                if (!fid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                let totalPage = parseInt($("#totalPages").html().replace(/ \/ /, ""));
                if (isNaN(totalPage)) {
                    const totalPagesElem = $(".total-pages, #totalPage, .page-count").first();
                    if (totalPagesElem.length) {
                        totalPage = parseInt(totalPagesElem.text().replace(/[^0-9]/g, ''));
                    }
                }

                let fileId = $("#fileName").val();
                if (!fileId) {
                    fileId = document.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
                }

                return { fid, totalPage, fileId };
            },
            chunksPerPage: 3,
            getVpnBase: () => {
                const currentUrl = window.location.href;
                const vpnBaseMatch = currentUrl.match(/(https:\/\/vpn\.cupl\.edu\.cn\/https\/[a-f0-9]+)/);
                return vpnBaseMatch ? vpnBaseMatch[1] : 'https://vpn.cupl.edu.cn/https/77726476706e69737468656265737421e0f65199357e6b456e04c7a99c406d3670';
            }
        },
        USTB: {
            name: '北京科技大学',
            match: (url) => url.includes('elib.ustb.edu.cn'),
            getJumpUrl: (fid, fileId, page) => {
                const currentUrl = window.location.href;
                const vpnBaseMatch = currentUrl.match(/(https:\/\/elib\.ustb\.edu\.cn\/https\/[a-f0-9]+)/);
                let vpnBase = vpnBaseMatch ? vpnBaseMatch[1] : 'https://elib.ustb.edu.cn';
                return `${vpnBase}/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
            },
            processImageUrl: (src, vpnBase = null) => {
                if (!vpnBase) {
                    const currentUrl = window.location.href;
                    const vpnBaseMatch = currentUrl.match(/(https:\/\/elib\.ustb\.edu\.cn\/https\/[a-f0-9]+)/);
                    vpnBase = vpnBaseMatch ? vpnBaseMatch[1] : 'https://elib.ustb.edu.cn';
                }

                let imagePath = src;
                if (src.includes('thesis.ustb.edu.cn')) {
                    const pathMatch = src.match(/\/read\/pdfboxServlet\?.*/);
                    if (pathMatch) {
                        imagePath = pathMatch[0];
                    }
                }

                if (imagePath.startsWith('/read/') || imagePath.includes('pdfboxServlet')) {
                    if (!imagePath.startsWith('/')) {
                        imagePath = '/' + imagePath;
                    }
                    return removeWatermarkFromUrl(`${vpnBase}${imagePath}`);
                }
                return removeWatermarkFromUrl(src);
            },
            getParams: () => {
                let fid = $("#fid").val();
                if (!fid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                if (!fid && window.location.href.includes('jumpServlet')) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                let totalPage = 0;
                const totalPagesElem = $("#totalPages");
                if (totalPagesElem.length) {
                    totalPage = parseInt(totalPagesElem.html().replace(/ \/ /, ""));
                }

                if (isNaN(totalPage) || totalPage === 0) {
                    const altTotalPagesElem = $(".total-pages, #totalPage, .page-count, .total-pages-num").first();
                    if (altTotalPagesElem.length) {
                        totalPage = parseInt(altTotalPagesElem.text().replace(/[^0-9]/g, ''));
                    }
                }

                let fileId = $("#fileName").val();
                if (!fileId) {
                    fileId = document.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
                    fileId = fileId.replace(/论文|系统|平台|下载|在线阅读/g, '');
                }

                if (!fileId || fileId.length === 0) {
                    fileId = `thesis_${new Date().getTime()}`;
                }

                return { fid, totalPage, fileId };
            },
            chunksPerPage: 3,
            getVpnBase: () => {
                const currentUrl = window.location.href;
                const vpnBaseMatch = currentUrl.match(/(https:\/\/elib\.ustb\.edu\.cn\/https\/[a-f0-9]+)/);
                return vpnBaseMatch ? vpnBaseMatch[1] : 'https://elib.ustb.edu.cn';
            },
            isDirectImageResponse: true
        },
        SJTU: {
            name: '上海交通大学',
            match: (url) => url.includes('thesis.lib.sjtu.edu.cn:8443'),
            getJumpUrl: (fid, fileId, page) => {
                return `http://thesis.lib.sjtu.edu.cn:8443/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
            },
            processImageUrl: (src) => {
                let fullUrl = src;
                if (src && !src.startsWith('http')) {
                    const cleanSrc = src.startsWith('/') ? src.substring(1) : src;
                    fullUrl = `http://thesis.lib.sjtu.edu.cn:8443/read/${cleanSrc}`;
                }
                return removeWatermarkFromUrl(fullUrl);
            },
            getParams: () => {
                let fid = $("#fid").val();
                if (!fid) {
                    const urlParams = new URLSearchParams(window.location.search);
                    fid = urlParams.get('fid');
                }

                if (!fid) {
                    const fidElement = document.querySelector('input[name="fid"], #fid, [data-fid]');
                    if (fidElement) {
                        fid = fidElement.value || fidElement.getAttribute('data-fid');
                    }
                }

                let totalPage = 0;
                const totalPagesElem = $("#totalPages");
                if (totalPagesElem.length) {
                    const totalText = totalPagesElem.html();
                    const match = totalText.match(/(\d+)/);
                    if (match) {
                        totalPage = parseInt(match[1]);
                    }
                }

                if (isNaN(totalPage) || totalPage === 0) {
                    const altSelectors = ['.total-pages', '#totalPage', '.page-count', '.total-pages-num', '[data-total-pages]'];
                    for (const selector of altSelectors) {
                        const elem = $(selector);
                        if (elem.length) {
                            const text = elem.text();
                            const match = text.match(/(\d+)/);
                            if (match) {
                                totalPage = parseInt(match[1]);
                                if (totalPage > 0) break;
                            }
                        }
                    }
                }

                let fileId = $("#fileName").val();
                if (!fileId) {
                    fileId = document.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
                    fileId = fileId.replace(/论文|系统|平台|下载|在线阅读|上海交通大学/g, '');
                }

                if (!fileId || fileId.length === 0) {
                    fileId = `sjtu_thesis_${fid || new Date().getTime()}`;
                }

                return { fid, totalPage, fileId };
            },
            chunksPerPage: 3
        }
    };

    // 自动检测当前平台
    function detectPlatform(url) {
        for (const key in PLATFORMS) {
            if (PLATFORMS[key].match(url)) {
                return PLATFORMS[key];
            }
        }
        return null;
    }

    // 暴露公共API
    return {
        PLATFORMS: PLATFORMS,
        detectPlatform: detectPlatform,
        hasWatermarkInUrl: hasWatermarkInUrl,
        removeWatermarkFromUrl: removeWatermarkFromUrl
    };
})();