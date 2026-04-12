// ==UserScript==
// @name         清华论文下载器配置库
// @version      1.0.0
// @description  配置文件 - 清华论文PDF下载器
// @author       Your Name
// ==/UserScript==

(function() {
    'use strict';
    
    // 导出配置对象到全局
    window.TsinghuaPDFConfig = {
        // UI 配置
        ui: {
            appName: '清华论文PDF下载器（纯手动确认版）',
            version: '26.0',
            windowTitle: '保存论文PDF',
            confirmButtonText: '确认保存',
            cancelButtonText: '取消',
            fileNameLabel: '文件名',
            descriptionText: '检测到PDF文件，请设置文件名后保存',
            previewLabel: '保存为',
            placeholderText: '请输入文件名'
        },
        
        // 文件名配置
        fileName: {
            defaultFormat: '清华论文_{recordId}_{fileId}',
            maxLength: 200,
            illegalChars: /[<>:"/\\|?*\x00-\x1f\x7f]/g,
            fallbackName: '清华论文'
        },
        
        // 消息配置
        messages: {
            ready: '📚 清华论文PDF下载器已就绪（纯手动确认版）',
            detected: '📥 检测到PDF，请点击"确认保存"按钮',
            processing: '🔄 正在去除水印，请稍候...',
            processingPage: '🔄 正在去除水印... ({current}/{total} 页)',
            success: '✅ 成功！删除 {count} 个水印\n📄 保存为: {filename}.pdf',
            error: '❌ 处理失败: {message}',
            cancelled: '❌ 已取消保存',
            autoClose: '🚪 5秒后自动关闭标签页...',
            confirmStart: '✅ 开始处理PDF...',
            invalidChars: '⚠️ 已自动移除非法字符',
            emptyName: '❌ 文件名不能为空'
        },
        
        // 样式配置
        styles: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            successColor: '#4caf50',
            warningColor: '#ff9800',
            errorColor: '#f44336',
            infoColor: '#2196f3',
            borderRadius: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        
        // 行为配置
        behavior: {
            autoCloseDelay: 5000,
            messageDuration: 3000,
            maxMessages: 5,
            confirmOnEnter: true,
            closeOnEscape: true,
            draggableWindow: true,
            selectTextOnFocus: true
        },
        
        // 水印检测配置
        watermark: {
            detectionPattern: '0.70711',
            skipLinesCount: 3
        },
        
        // 依赖库配置
        dependencies: {
            pdfLib: 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js',
            pako: 'https://unpkg.com/pako@2.1.0/dist/pako.min.js'
        },
        
        // 域名配置
        domains: {
            matches: [
                'https://newetds.lib.tsinghua.edu.cn/qh/file/getFileStremByToken*',
                'https://newetds.lib.tsinghua.edu.cn/pdf/generic/web/viewer.html*'
            ],
            icon: 'https://www.tsinghua.edu.cn/favicon.ico'
        }
    };
    
    console.log('清华论文下载器配置已加载');
})();
