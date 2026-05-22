// ==UserScript==
// @name         通用论文配置库
// @description  为论文下载脚本提供各平台参数提取与图片地址生成逻辑
// @version      1.0
// @license      GNU GPLv3
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 工具函数：去除图片URL中的水印参数（可根据实际情况增强）
    function removeWatermarkFromUrl(url) {
        if (!url) return url;
        // 常见的水印参数：watermark, wm, stamp 等，可在此移除
        return url.replace(/[?&](watermark|wm|stamp)=[^&]*/gi, '')
                  .replace(/&&/g, '&')
                  .replace(/[?&]$/, '');
    }

    const PLATFORMS = {
        // 北京师范大学
        BNU: {
            name: '北京师范大学',
            match: (url) => url.includes('etdlib.bnu.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                const fid = url.searchParams.get('fid') || '';
                const totalPage = parseInt(url.searchParams.get('totalPage') || '0', 10);
                const fileId = url.searchParams.get('fileId') || '';
                return { fid, totalPage, fileId };
            },
            getJumpUrl: function (fid, fileId, page) {
                return `https://etdlib.bnu.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                // BNU 通常直接返回可访问的图片地址
                return src;
            }
        },

        // 复旦大学（兼容 thesis.fudan 和 drm.fudan）
        FUDAN: {
            name: '复旦大学',
            match: (url) => url.includes('thesis.fudan.edu.cn') || url.includes('drm.fudan.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                const fid = url.searchParams.get('fid') || '';
                const totalPage = parseInt(url.searchParams.get('totalPage') || '0', 10);
                const fileId = url.searchParams.get('fileId') || '';
                return { fid, totalPage, fileId };
            },
            getJumpUrl: function (fid, fileId, page) {
                const base = window.location.origin;
                return `${base}/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // 北京大学
        PKU: {
            name: '北京大学',
            match: (url) => url.includes('drm.lib.pku.edu.cn'),
            chunksPerPage: 1,
            getParams: function () {
                const url = new URL(window.location.href);
                const fid = url.searchParams.get('fid') || '';
                const totalPage = parseInt(url.searchParams.get('totalPage') || '0', 10);
                const fileId = url.searchParams.get('fileId') || '';
                return { fid, totalPage, fileId };
            },
            getJumpUrl: function (fid, fileId, page) {
                return `https://drm.lib.pku.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // 中国人民大学（兼容 bklib 和 libproxy）
        RUC: {
            name: '中国人民大学',
            match: (url) => url.includes('bklib.ruc.edu.cn') || url.includes('.libproxy.ruc.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                const fid = url.searchParams.get('fid') || '';
                const totalPage = parseInt(url.searchParams.get('totalPage') || '0', 10);
                const fileId = url.searchParams.get('fileId') || '';
                return { fid, totalPage, fileId };
            },
            getJumpUrl: function (fid, fileId, page) {
                const base = window.location.origin;
                return `${base}/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // 中国政法大学（兼容 paper.cupl, vpn.cupl, wxvpn.cupl）
        CUPL: {
            name: '中国政法大学',
            match: (url) => url.includes('paper.cupl.edu.cn') ||
                           url.includes('vpn.cupl.edu.cn') ||
                           url.includes('wxvpn.cupl.edu.cn'),
            chunksPerPage: 3,
            // 通用提取 VPN 基础路径
            getVpnBase: function () {
                const currentUrl = window.location.href;
                // 尝试匹配新 wxvpn
                let match = currentUrl.match(/(https:\/\/wxvpn\.cupl\.edu\.cn\/https\/[a-f0-9]+)/);
                if (match) return match[1];
                // 尝试匹配旧 vpn
                match = currentUrl.match(/(https:\/\/vpn\.cupl\.edu\.cn\/https\/[a-f0-9]+)/);
                if (match) return match[1];
                // 都不是，返回 paper 直连地址（一般不需要 vpnBase）
                return 'https://paper.cupl.edu.cn';
            },
            getParams: function () {
                const url = new URL(window.location.href);
                const fid = url.searchParams.get('fid') || '';
                const totalPage = parseInt(url.searchParams.get('totalPage') || '0', 10);
                const fileId = url.searchParams.get('filename') || url.searchParams.get('fileId') || '';
                return { fid, totalPage, fileId };
            },
            getJumpUrl: function (fid, fileId, page) {
                const vpnBase = this.getVpnBase();
                // 判断当前是否为 VPN 模式
                const isVpn = vpnBase.includes('vpn.cupl.edu.cn') || vpnBase.includes('wxvpn.cupl.edu.cn');
                let vpnParam = '';
                if (isVpn) {
                    // 新老 VPN 使用不同参数，这里根据域名动态拼接
                    vpnParam = vpnBase.includes('wxvpn.cupl.edu.cn')
                        ? 'vpn-12-o2-wxvpn.cupl.edu.cn'
                        : 'vpn-12-o2-paper.cupl.edu.cn';
                    return `${vpnBase}/read/jumpServlet?${vpnParam}&page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
                } else {
                    // 直连模式
                    return `https://paper.cupl.edu.cn/read/jumpServlet?page=${page}&fid=${fid}&userid=&filename=${fileId}&visitid=`;
                }
            },
            processImageUrl: function (src) {
                const vpnBase = this.getVpnBase();
                const isVpn = vpnBase.includes('vpn.cupl.edu.cn') || vpnBase.includes('wxvpn.cupl.edu.cn');
                if (!isVpn) {
                    // 直连，无需处理
                    return removeWatermarkFromUrl(src);
                }
                // VPN 模式下需要将图片地址代理到 VPN 路径下
                let processedSrc = src;
                // 如果 src 是相对路径或已包含 vpn 特征，则直接拼接
                if (src && (src.startsWith('/read/') || src.includes('vpn.cupl.edu.cn') || src.includes('wxvpn.cupl.edu.cn'))) {
                    const pageMatch = src.match(/page=([A-F0-9]+)/i);
                    if (pageMatch) {
                        processedSrc = `${vpnBase}/read/pdfboxServlet?vpn-1&vpn-1&page=${pageMatch[1]}`;
                    } else {
                        processedSrc = `${vpnBase}${src}?vpn-1&vpn-1`;
                    }
                } else if (src && src.includes('paper.cupl.edu.cn')) {
                    // 替换域名为 VPN 代理
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
                return removeWatermarkFromUrl(processedSrc);
            }
        },

        // 北京科技大学（VPN 代理模式）
        USTB: {
            name: '北京科技大学',
            match: (url) => url.includes('elib.ustb.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                const fid = url.searchParams.get('fid') || '';
                const totalPage = parseInt(url.searchParams.get('totalPage') || '0', 10);
                const fileId = url.searchParams.get('fileId') || '';
                return { fid, totalPage, fileId };
            },
            getJumpUrl: function (fid, fileId, page) {
                const base = window.location.origin;
                return `${base}/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // 上海交通大学（特殊端口）
        SJTU: {
            name: '上海交通大学',
            match: (url) => url.includes('thesis.lib.sjtu.edu.cn'),
            chunksPerPage: 3,
            getParams: function () {
                const url = new URL(window.location.href);
                const fid = url.searchParams.get('fid') || '';
                const totalPage = parseInt(url.searchParams.get('totalPage') || '0', 10);
                const fileId = url.searchParams.get('fileId') || '';
                return { fid, totalPage, fileId };
            },
            getJumpUrl: function (fid, fileId, page) {
                return `http://thesis.lib.sjtu.edu.cn:8443/read/jumpServlet?page=${page}&fid=${fid}&fileId=${fileId}`;
            },
            processImageUrl: function (src) {
                return src;
            }
        },

        // 南开大学（webvpn 特殊模式）
        NANKAI: {
            name: '南开大学',
            match: (url) => url.includes('webvpn.nankai.edu.cn'),
            chunksPerPage: 1,
            getParams: function () {
                const url = new URL(window.location.href);
                const fid = url.searchParams.get('fid') || '';
                const totalPage = parseInt(url.searchParams.get('totalPage') || '0', 10);
                const fileId = url.searchParams.get('fileId') || '';
                return { fid, totalPage, fileId };
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

    // 挂载到 window 供主脚本使用
    window.ThesisConfig = {
        PLATFORMS: PLATFORMS,
        detectPlatform: detectPlatform,
        removeWatermarkFromUrl: removeWatermarkFromUrl
    };

})();
