// thesis-processor.js
// 论文图片处理与PDF合成核心库
// 依赖：jsPDF库
// 修复：下载队列空值防御，杜绝政法大学等平台出现的 undefined 错误

;(function (global) {
    'use strict';

    // ==================== 配置 ====================
    const DEFAULT_CONFIG = {
        brightness: 10,
        contrast: 20,
        shadow: 150,
        highlight: 250,
        jpegQuality: 0.9,
        pdfDpi: 72,
        concurrencyLimit: 3,
        requestDelayMs: 200
    };

    // ==================== LUT查找表 ====================
    let cachedLUT = null;
    let cachedParams = null;

    function precomputeLUT(brightness, contrast, shadow, highlight) {
        const cacheKey = `${brightness}_${contrast}_${shadow}_${highlight}`;
        if (cachedLUT && cachedParams === cacheKey) return cachedLUT;

        const lut = new Uint8ClampedArray(256);
        const bFactor = (brightness / 100) * 255;
        const cFactor = (contrast + 100) / 100;
        const range = highlight - shadow;

        for (let v = 0; v < 256; v++) {
            let val = (v - 128) * cFactor + 128 + bFactor;
            val = val < 0 ? 0 : (val > 255 ? 255 : val);
            val = val <= shadow ? 0 : (val >= highlight ? 255 : ((val - shadow) / range) * 255);
            lut[v] = Math.round(val);
        }

        cachedLUT = lut;
        cachedParams = cacheKey;
        return lut;
    }

    // ==================== 工具函数 ====================
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    function getImageDimensions(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.width, h: img.height, landscape: img.width > img.height });
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    function pixelsToMM(pixels, dpi) {
        return (pixels / dpi) * 25.4;
    }

    // ==================== 图片增强 ====================
    async function enhanceImage(dataUrl, enhanceParams) {
        const { brightness, contrast, shadow, highlight, jpegQuality } = enhanceParams;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const lut = precomputeLUT(brightness, contrast, shadow, highlight);

                for (let i = 0; i < data.length; i += 4) {
                    data[i] = lut[data[i]];
                    data[i + 1] = lut[data[i + 1]];
                    data[i + 2] = lut[data[i + 2]];
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', jpegQuality));
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }

    // ==================== 图片下载（防御强化） ====================
    async function downloadImages(imageInfos, enhanceParams, onProgress) {
        const { brightness, contrast, shadow, highlight, jpegQuality } = enhanceParams;
        const config = window.ThesisProcessorConfig || DEFAULT_CONFIG;
        const results = [];
        let finished = 0;

        // 防御：过滤掉所有无效元素，并补齐缺失字段
        const cleanedInfos = imageInfos
            .filter(info => info != null && typeof info === 'object' && typeof info.src === 'string' && info.src.length > 0)
            .map((info, idx) => ({
                src: info.src,
                logicalPage: info.logicalPage != null ? info.logicalPage : idx,
                chunkId: info.chunkId != null ? info.chunkId : idx,
                hasWatermark: Boolean(info.hasWatermark),
                enhance: info.enhance !== false
            }));

        if (cleanedInfos.length === 0) {
            throw new Error('没有可用的图片地址，请确认页面已完全加载且网络正常');
        }

        console.log(`[ThesisProcessor] 有效图片块: ${cleanedInfos.length} / ${imageInfos.length}`);

        const total = cleanedInfos.length;
        const queue = [...cleanedInfos];
        let lastRequestTime = 0;

        async function downloadSingle(info) {
            // 二次防御
            if (!info || !info.src) {
                throw new Error('无效的图片信息对象');
            }
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const response = await fetch(info.src);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const blob = await response.blob();
                    let dataUrl = await blobToDataURL(blob);

                    // 图片增强
                    if (!info.hasWatermark && info.enhance !== false) {
                        dataUrl = await enhanceImage(dataUrl, enhanceParams);
                    }

                    const dims = await getImageDimensions(dataUrl);
                    return {
                        page: info.logicalPage,
                        chunk: info.chunkId,
                        data: dataUrl,
                        w: dims.w,
                        h: dims.h,
                        landscape: dims.landscape
                    };
                } catch (err) {
                    if (attempt < 3) await delay(1000 * attempt);
                    else throw err;
                }
            }
        }

        async function worker() {
            while (queue.length > 0) {
                const now = Date.now();
                const wait = config.requestDelayMs - (now - lastRequestTime);
                if (wait > 0) await delay(wait);

                const info = queue.shift();
                // 防御：取出后再次检查（尤其并发环境）
                if (!info || !info.src) {
                    console.warn('[ThesisProcessor] 跳过空图片项');
                    finished++;
                    if (onProgress) onProgress(finished, total, results.length);
                    continue;
                }

                lastRequestTime = Date.now();

                try {
                    const result = await downloadSingle(info);
                    results.push(result);
                } catch (err) {
                    console.error('下载失败:', info.logicalPage, err);
                    results.push({ ...info, data: null, error: true });
                }

                finished++;
                if (onProgress) {
                    onProgress(finished, total, results.length);
                }
            }
        }

        const workers = [];
        const workerCount = Math.min(config.concurrencyLimit, queue.length);
        for (let i = 0; i < workerCount; i++) {
            workers.push(worker());
        }
        await Promise.all(workers);

        // 排序并过滤
        return results
            .filter(r => r.data !== null && !r.error)
            .sort((a, b) => a.page !== b.page ? a.page - b.page : a.chunk - b.chunk);
    }

    // ==================== PDF合成 ====================
    async function generatePDF(chunks, fileName, onProgress) {
        const { jsPDF } = jspdf;
        const dpi = (window.ThesisProcessorConfig || DEFAULT_CONFIG).pdfDpi;

        // 按页分组
        const pageMap = new Map();
        for (const c of chunks) {
            if (!pageMap.has(c.page)) pageMap.set(c.page, []);
            pageMap.get(c.page).push(c);
        }

        const pages = Array.from(pageMap.keys()).sort((a, b) => a - b);
        let doc = null;

        for (let i = 0; i < pages.length; i++) {
            const pageNum = pages[i];
            const pageChunks = pageMap.get(pageNum).sort((a, b) => a.chunk - b.chunk);

            if (onProgress) onProgress(i + 1, pages.length, pageNum);

            const totalH = pageChunks.reduce((s, c) => s + c.h, 0);
            const maxW = Math.max(...pageChunks.map(c => c.w));
            const orientation = maxW > totalH ? 'landscape' : 'portrait';
            const wMM = pixelsToMM(maxW, dpi);
            const hMM = pixelsToMM(totalH, dpi);

            if (!doc) {
                doc = new jsPDF({ unit: 'mm', format: [wMM, hMM], orientation, compress: false, hotfixes: ['px_scaling'] });
            } else {
                doc.addPage([wMM, hMM], orientation);
            }

            let y = 0;
            for (const c of pageChunks) {
                doc.addImage(c.data, 'JPEG', 0, y, wMM, pixelsToMM(c.h, dpi), undefined, 'MEDIUM');
                y += pixelsToMM(c.h, dpi);
            }
        }

        if (!doc) throw new Error('没有有效页面数据');

        let finalName = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';
        doc.save(finalName);
        return pages.length;
    }

    // ==================== 导出API ====================
    const ThesisProcessor = {
        enhanceImage,
        downloadImages,
        generatePDF,
        precomputeLUT,
        getConfig: () => window.ThesisProcessorConfig || DEFAULT_CONFIG,
        setConfig: (cfg) => { window.ThesisProcessorConfig = { ...DEFAULT_CONFIG, ...cfg }; }
    };

    global.ThesisProcessor = ThesisProcessor;

})(typeof window !== 'undefined' ? window : this);
