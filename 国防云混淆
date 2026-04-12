// ==UserScript==
// @name         国防云图书馆配置库 (混淆版)
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  配置库 - 混淆版本
// @author       Your Name
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function(_0xdeadbeef, _0xcafebabe) {
    'use strict';

    // 字符串表 - 十六进制编码
    const _0x$_ = [
        'CONFIG', 'SELECTORS',
        'URL_CONFIG', 'UI_CONFIG',
        'ADVANCED_CONFIG', 'HELPERS',
        'minDelay', 'maxDelay',
        'pageLoadTimeout', 'A4_WIDTH',
        'A4_HEIGHT', 'maxRetries',
        'imageQuality', 'autoDownload',
        'notifyOnComplete', 'title',
        'menuList', 'contentArea',
        'nextPageFunction', 'imageUrlPatterns',
        'position', 'size', 'theme', 'texts',
        'debug', 'logLevel', 'errorHandling',
        'retryOnFail', 'skipOnFail',
        'get', 'set', 'reset', 'export',
        'import', 'log', 'MenuList',
        'q-OnlineReading_body',
        'Press.Next', 'nextPage',
        'aliyuncs.com', 'oss', 'GFY_CONFIG'
    ];

    // 配置构建
    const _0x1a2b = {};
    _0x1a2b[_0x$_[6]] = 0x3e8;
    _0x1a2b[_0x$_[7]] = 0xbb8;
    _0x1a2b[_0x$_[8]] = 0x1f40;
    _0x1a2b[_0x$_[9]] = 0xd2;
    _0x1a2b[_0x$_[10]] = 0x129;
    _0x1a2b[_0x$_[11]] = 0x3;
    _0x1a2b[_0x$_[12]] = 0x3ff;
    _0x1a2b[_0x$_[13]] = ![] + [];
    _0x1a2b[_0x$_[14]] = ![] + [];

    const _0x2b3c = {};
    _0x2b3c[_0x$_[15]] = _0x$_[15];
    _0x2b3c[_0x$_[16]] = '#' + _0x$_[35];
    _0x2b3c[_0x$_[18]] = ['.' + _0x$_[36], _0x$_[37]];
    _0x2b3c[_0x$_[17]] = '.' + _0x$_[38];

    const _0x3c4d = {};
    _0x3c4d[_0x$_[19]] = [_0x$_[39], _0x$_[40]];

    const _0x4d5e = {
        [_0x$_[20]]: { bottom: '20px', right: '20px' },
        [_0x$_[21]]: { width: '300px' },
        [_0x$_[22]]: {
            primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            success: '#4caf50',
            danger: '#f44336',
            text: '#ffffff',
            accent: '#ffd700'
        },
        [_0x$_[23]]: {
            title: '国防云图书馆翻页下载工具',
            startBtn: '▶ 开始翻页下载',
            stopBtn: '⏹ 停止',
            minimizeBtn: '−',
            closeBtn: '×',
            bookTitleLabel: '书名：',
            totalPagesLabel: '总页数：',
            currentPageLabel: '当前页：',
            capturedLabel: '已捕获：',
            loadingText: '加载中...'
        }
    };

    const _0x5f6a = {
        [_0x$_[24]]: !![] + [],
        [_0x$_[25]]: 0x3,
        [_0x$_[26]]: {
            [_0x$_[27]]: !![],
            [_0x$_[28]]: ![]
        }
    };

    // 辅助函数
    const _0x6b7c = {};

    _0x6b7c[_0x$_[29]] = function(_0xpath) {
        let _0xparts = _0xpath.split('.');
        let _0xcurr = _0x9m0n[_0x$_[41]];
        for (const _0xpart of _0xparts) {
            if (_0xcurr && typeof _0xcurr === 'object' && _0xpart in _0xcurr) {
                _0xcurr = _0xcurr[_0xpart];
            } else {
                return undefined;
            }
        }
        return _0xcurr;
    };

    _0x6b7c[_0x$_[30]] = function(_0xpath, _0xval) {
        let _0xparts = _0xpath.split('.');
        let _0xlast = _0xparts.pop();
        let _0xcurr = _0x9m0n[_0x$_[41]];
        for (const _0xpart of _0xparts) {
            if (!(_0xpart in _0xcurr)) {
                _0xcurr[_0xpart] = {};
            }
            _0xcurr = _0xcurr[_0xpart];
        }
        _0xcurr[_0xlast] = _0xval;
    };

    _0x6b7c[_0x$_[31]] = function() {
        _0x9m0n[_0x$_[41]] = {
            [_0x$_[0]]: { ..._0x1a2b },
            [_0x$_[1]]: { ..._0x2b3c },
            [_0x$_[2]]: { ..._0x3c4d },
            [_0x$_[3]]: { ..._0x4d5e },
            [_0x$_[4]]: { ..._0x5f6a },
            [_0x$_[5]]: { ..._0x6b7c }
        };
    };

    _0x6b7c[_0x$_[32]] = function() {
        let _0xcopy = { ..._0x9m0n[_0x$_[41]] };
        delete _0xcopy[_0x$_[5]];
        return JSON.stringify(_0xcopy, null, 0x2);
    };

    _0x6b7c[_0x$_[33]] = function(_0xdata) {
        try {
            let _0xparsed = JSON.parse(_0xdata);
            Object.assign(_0x9m0n[_0x$_[41]], _0xparsed);
            return !![] + [];
        } catch (_0xerr) {
            console.error('配置库：导入失败', _0xerr);
            return ![];
        }
    };

    _0x6b7c[_0x$_[34]] = function(_0xlevel, ..._0xargs) {
        let _0xcfg = _0x9m0n[_0x$_[41]];
        if (!_0xcfg[_0x$_[4]][_0x$_[24]]) return;
        let _0xmax = _0xcfg[_0x$_[4]][_0x$_[25]];
        let _0xlevels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
        if (_0xlevel <= _0xmax) {
            let _0xprefix = '[GFY-' + _0xlevels[_0xlevel] + ']';
            switch(_0xlevel) {
                case 0x0: console.error(_0xprefix, ..._0xargs); break;
                case 0x1: console.warn(_0xprefix, ..._0xargs); break;
                case 0x2: console.info(_0xprefix, ..._0xargs); break;
                case 0x3: console.log(_0xprefix, ..._0xargs); break;
                default: console.log(_0xprefix, ..._0xargs);
            }
        }
    };

    // 获取全局对象
    const _0x9m0n = (function() {
        try { return window; } catch(e) {}
        try { return globalThis; } catch(e) {}
        try { return self; } catch(e) {}
        return this;
    })();

    // 【关键修复】立即初始化，不延迟
    _0x6b7c[_0x$_[31]]();

    // 立即输出日志
    _0x6b7c[_0x$_[34]](0x2, '配置库已加载 (混淆版 v3.1)');

})({}, {});
