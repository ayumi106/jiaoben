// ==UserScript==
// @name         通用论文配置库
// @description  为论文下载脚本提供各平台参数提取与图片地址生成逻辑
// @version      1.0.1
// @license      GNU GPLv3
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 工具函数：去除图片URL中的常见水印参数
    function removeWatermarkFromUrl(url) {
        if (!url) return url;
        return url.replace(/[?&](watermark|wm|stamp)=[^&]*/gi, '')
                  .replace(/&&/g, '&')
                  .replace(/[?&]$/, '');
    }

    const PLATFORMS = {

        // ========== 北京师范大学 ==========
        BNU: {
            name: '北京师范大学',
            match: (url) => url.includes('etdlib.bnu.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                return {
                    fid: url.searchParams.get('fid') || '',
                    totalPage: parseInt(url.searchParams.get('totalPage') || '0', 10),
                    fileId: url.searchParams.get('fileId') || ''
                };
            },
            getJumpUrl: function (fid, fileId, page) {
                return `https://etdlib.bnu.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // ========== 复旦大学 ==========
        FUDAN: {
            name: '复旦大学',
            match: (url) => url.includes('thesis.fudan.edu.cn') || url.includes('drm.fudan.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                return {
                    fid: url.searchParams.get('fid') || '',
                    totalPage: parseInt(url.searchParams.get('totalPage') || '0', 10),
                    fileId: url.searchParams.get('fileId') || ''
                };
            },
            getJumpUrl: function (fid, fileId, page) {
                const base = window.location.origin;
                return `${base}/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // ========== 北京大学（已修正） ==========
        PKU: {
            name: '北京大学',
            match: (url) => url.includes('drm.lib.pku.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                return {
                    fid: url.searchParams.get('fid') || '',
                    totalPage: parseInt(url.searchParams.get('totalPage') || '0', 10),
                    // 北大使用 filename 参数
                    fileId: url.searchParams.get('filename') || ''
                };
            },
            getJumpUrl: function (fid, fileId, page) {
                // 正确路径：没有 /read
                return `https://drm.lib.pku.edu.cn/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // ========== 中国人民大学 ==========
        RUC: {
            name: '中国人民大学',
            match: (url) => url.includes('bklib.ruc.edu.cn') || url.includes('.libproxy.ruc.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                return {
                    fid: url.searchParams.get('fid') || '',
                    totalPage: parseInt(url.searchParams.get('totalPage') || '0', 10),
                    fileId: url.searchParams.get('fileId') || ''
                };
            },
            getJumpUrl: function (fid, fileId, page) {
                const base = window.location.origin;
                return `${base}/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // ========== 中国政法大学（兼容 paper / vpn / wxvpn） ==========
        CUPL: {
            name: '中国政法大学',
            match: (url) => url.includes('paper.cupl.edu.cn') ||
                           url.includes('vpn.cupl.edu.cn') ||
                           url.includes('wxvpn.cupl.edu.cn'),
            chunksPerPage: 3,
            // 提取 VPN 基础路径（兼容新旧 VPN）
            getVpnBase: function () {
                const currentUrl = window.location.href;
                let match = currentUrl.match(/(https:\/\/wxvpn\.cupl\.edu\.cn\/https\/[a-f0-9]+)/);
                if (match) return match[1];
                match = currentUrl.match(/(https:\/\/vpn\.cupl\.edu\.cn\/https\/[a-f0-9]+)/);
                if (match) return match[1];
                return 'https://paper.cupl.edu.cn';
            },
            getParams: function () {
                const url = new URL(window.location.href);
                return {
                    fid: url.searchParams.get('fid') || '',
                    totalPage: parseInt(url.searchParams.get('totalPage') || '0', 10),
                    fileId: url.searchParams.get('filename') || url.searchParams.get('fileId') || ''
                };
            },
            getJumpUrl: function (fid, fileId, page) {
                const vpnBase = this.getVpnBase();
                const isVpn = vpnBase.includes('vpn.cupl.edu.cn') || vpnBase.includes('wxvpn.cupl.edu.cn');
                if (isVpn) {
                    const vpnParam = vpnBase.includes('wxvpn.cupl.edu.cn')
                        ? 'vpn-12-o2-wxvpn.cupl.edu.cn'
                        : 'vpn-12-o2-paper.cupl.edu.cn';
                    return `${vpnBase}/read/jumpServlet?${vpnParam}&page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
                } else {
                    return `https://paper.cupl.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
                }
            },
            processImageUrl: function (src) {
                const vpnBase = this.getVpnBase();
                const isVpn = vpnBase.includes('vpn.cupl.edu.cn') || vpnBase.includes('wxvpn.cupl.edu.cn');
                if (!isVpn) return removeWatermarkFromUrl(src);

                let processedSrc = src;
                if (src && (src.startsWith('/read/') || src.includes('vpn.cupl.edu.cn') || src.includes('wxvpn.cupl.edu.cn'))) {
                    const pageMatch = src.match(/page=([A-F0-9]+)/i);
                    if (pageMatch) {
                        processedSrc = `${vpnBase}/read/pdfboxServlet?vpn-1&vpn-1&page=${pageMatch[1]}`;
                    } else {
                        processedSrc = `${vpnBase}${src}?vpn-1&vpn-1`;
                    }
                } else if (src && src.includes('paper.cupl.edu.cn')) {
                    const pathMatch = src.match(/\/read\/[^?]*\??.*/);
                    if (pathMatch) {
                        let path = pathMatch[0];
                        path = path.includes('?') ? path.replace('?', '?vpn-1&vpn-1&') : path + '?vpn-1&vpn-1';
                        processedSrc = `${vpnBase}${path}`;
                    }
                }
                return removeWatermarkFromUrl(processedSrc);
            }
        },

        // ========== 北京科技大学 ==========
        USTB: {
            name: '北京科技大学',
            match: (url) => url.includes('elib.ustb.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                return {
                    fid: url.searchParams.get('fid') || '',
                    totalPage: parseInt(url.searchParams.get('totalPage') || '0', 10),
                    fileId: url.searchParams.get('fileId') || ''
                };
            },
            getJumpUrl: function (fid, fileId, page) {
                const base = window.location.origin;
                return `${base}/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // ========== 上海交通大学 ==========
        SJTU: {
            name: '上海交通大学',
            match: (url) => url.includes('thesis.lib.sjtu.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                return {
                    fid: url.searchParams.get('fid') || '',
                    totalPage: parseInt(url.searchParams.get('totalPage') || '0', 10),
                    fileId: url.searchParams.get('fileId') || ''
                };
            },
            getJumpUrl: function (fid, fileId, page) {
                return `http://thesis.lib.sjtu.edu.cn:8443/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // ========== 南开大学 ==========
        NANKAI: {
            name: '南开大学',
            match: (url) => url.includes('webvpn.nankai.edu.cn'),
            chunksPerPage: 1,
            getParams: function () {
                const url = new URL(window.location.href);
                return {
                    fid: url.searchParams.get('fid') || '',
                    totalPage: parseInt(url.searchParams.get('totalPage') || '0', 10),
                    fileId: url.searchParams.get('fileId') || ''
                };
            },
            getJumpUrl: function (fid, fileId, page) {
                return `https://webvpn.nankai.edu.cn/https/*/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        }
    };

    // 平台检测函数
    function detectPlatform(url) {
        for (const key in PLATFORMS) {
            if (PLATFORMS.hasOwnProperty(key)) {
                const platform = PLATFORMS[key];
                if (typeof platform.match === 'function' && platform.match(url)) {
                    return platform;
                }
            }
        }
        return null;
    }

    // 挂载到全局供主脚本调用
    window.ThesisConfig = {
        PLATFORMS: PLATFORMS,
        detectPlatform: detectPlatform,
        removeWatermarkFromUrl: removeWatermarkFromUrl
    };

})();
