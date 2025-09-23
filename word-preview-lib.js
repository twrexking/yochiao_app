// 友喬環境監測系統 - Word 文件預覽函式庫
// 基於 docx-preview.js 的 Word 文件預覽功能

const WordPreviewLib = {
    // 檢查是否已載入必要的函式庫
    isLibraryLoaded: false,
    
    // 初始化函式庫
    init: async function() {
        if (this.isLibraryLoaded) {
            return true;
        }
        
        try {
            // 檢查是否已載入 JSZip
            if (typeof JSZip === 'undefined') {
                await this.loadScript('https://unpkg.com/jszip@3.10.1/dist/jszip.min.js');
            }
            
            // 檢查是否已載入 docx-preview
            if (typeof docx === 'undefined') {
                await this.loadScript('https://cdn.jsdelivr.net/npm/docx-preview@0.3.5/dist/docx-preview.js');
            }
            
            this.isLibraryLoaded = true;
            console.log('Word 預覽函式庫初始化完成');
            return true;
        } catch (error) {
            console.error('Word 預覽函式庫初始化失敗:', error);
            return false;
        }
    },
    
    // 動態載入腳本
    loadScript: function(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    // 預覽 Word 文件 - 主要入口函數
    previewDocument: async function(source, containerId, options = {}) {
        try {
            // 確保函式庫已載入
            if (!await this.init()) {
                throw new Error('函式庫載入失敗');
            }
            
            const container = this.getContainer(containerId);
            if (!container) {
                throw new Error(`找不到容器元素: ${containerId}`);
            }
            
            // 顯示載入中狀態
            this.showLoadingState(container);
            
            let docData;
            
            // 根據 source 類型處理不同的輸入
            if (source instanceof File) {
                docData = await this.readFileAsArrayBuffer(source);
            } else if (source instanceof Blob) {
                docData = await this.readBlobAsArrayBuffer(source);
            } else if (typeof source === 'string') {
                // 假設是檔案路徑或 URL
                docData = await this.fetchDocumentAsArrayBuffer(source);
            } else if (source instanceof ArrayBuffer) {
                docData = source;
            } else {
                throw new Error('不支援的檔案類型');
            }
            
            // 渲染文件
            await this.renderDocument(docData, container, options);
            
        } catch (error) {
            console.error('Word 文件預覽失敗:', error);
            this.showErrorState(containerId, error.message);
        }
    },
    
    // 從檔案讀取 ArrayBuffer
    readFileAsArrayBuffer: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },
    
    // 從 Blob 讀取 ArrayBuffer
    readBlobAsArrayBuffer: function(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    },
    
    // 從 URL 或檔案路徑獲取文件
    fetchDocumentAsArrayBuffer: async function(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`檔案載入失敗: ${response.status}`);
            }
            return await response.arrayBuffer();
        } catch (error) {
            throw new Error(`無法載入檔案: ${url}`);
        }
    },
    
    // 渲染文件到容器
    renderDocument: async function(docData, container, options) {
        const defaultOptions = {
            className: 'docx-preview',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            experimental: false,
            trimXmlDeclaration: true,
            useBase64URL: false,
            useMathMLPolyfill: false,
            renderChanges: false,
            renderComments: false,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            debug: false,
            ...options
        };
        
        try {
            const result = await docx.renderAsync(docData, container, null, defaultOptions);
            this.applyCustomStyles(container);
            console.log('Word 文件渲染完成', result);
            return result;
        } catch (error) {
            throw new Error(`文件渲染失敗: ${error.message}`);
        }
    },
    
    // 取得容器元素
    getContainer: function(containerId) {
        if (typeof containerId === 'string') {
            return document.getElementById(containerId) || document.querySelector(containerId);
        }
        return containerId;
    },
    
    // 顯示載入中狀態
    showLoadingState: function(container) {
        container.innerHTML = `
            <div class="word-preview-loading" style="
                text-align: center; 
                padding: 40px; 
                color: #666;
                font-size: 14px;
            ">
                <div style="margin-bottom: 10px;">
                    <span style="
                        display: inline-block;
                        width: 20px;
                        height: 20px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #333;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></span>
                </div>
                載入中，請稍候...
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    },
    
    // 顯示錯誤狀態
    showErrorState: function(containerId, errorMessage) {
        const container = this.getContainer(containerId);
        if (container) {
            container.innerHTML = `
                <div class="word-preview-error" style="
                    text-align: center; 
                    padding: 40px; 
                    color: #d32f2f;
                    background: #ffeaea;
                    border: 1px solid #ffcaca;
                    border-radius: 4px;
                    font-size: 14px;
                ">
                    <div style="margin-bottom: 10px; font-weight: bold;">
                        📄 文件預覽失敗
                    </div>
                    <div style="color: #666;">
                        ${errorMessage}
                    </div>
                </div>
            `;
        }
    },
    
    // 套用自訂樣式
    applyCustomStyles: function(container) {
        // 添加一些基本的樣式改善
        const style = document.createElement('style');
        style.textContent = `
            .docx-preview {
                max-width: 100%;
                margin: 0 auto;
                background: white;
                box-shadow: none;
                border-radius: 0;
                overflow: visible;
                padding: 20px;
            }
            .docx-preview table {
                border-collapse: collapse;
                width: 100%;
                margin: 10px 0;
            }
            .docx-preview table td, .docx-preview table th {
                border: 1px solid #ddd;
                padding: 8px;
            }
            .docx-preview img {
                max-width: 100%;
                height: auto;
            }
            .docx-preview p {
                margin: 0.5em 0;
                line-height: 1.6;
            }
            .docx-preview h1, .docx-preview h2, .docx-preview h3 {
                margin: 1em 0 0.5em 0;
                color: #333;
            }
            /* 針對預覽模態框的特殊調整 */
            #documentPreviewContainer .docx-preview {
                min-height: calc(100vh - 200px);
                padding: 30px;
            }
            /* 提升文字可讀性 */
            .docx-preview {
                font-size: 14px;
                color: #333;
                line-height: 1.8;
            }
        `;
        
        if (!document.querySelector('#word-preview-styles')) {
            style.id = 'word-preview-styles';
            document.head.appendChild(style);
        }
    },
    
    // 清除預覽內容
    clearPreview: function(containerId) {
        const container = this.getContainer(containerId);
        if (container) {
            container.innerHTML = '';
        }
    },
    
    // 建立文件預覽器 UI
    createPreviewUI: function(containerId, options = {}) {
        const container = this.getContainer(containerId);
        if (!container) {
            console.error(`找不到容器: ${containerId}`);
            return;
        }
        
        const defaultOptions = {
            showFileInput: true,
            allowDrop: true,
            title: 'Word 文件預覽',
            ...options
        };
        
        let html = `
            <div class="word-preview-ui" style="border: 1px solid #ddd; border-radius: 4px; padding: 20px;">
                <h3 style="margin-top: 0;">${defaultOptions.title}</h3>
        `;
        
        if (defaultOptions.showFileInput) {
            html += `
                <div class="file-input-section" style="margin-bottom: 20px;">
                    <input type="file" accept=".docx" class="word-file-input" style="margin-bottom: 10px;">
                    <p style="font-size: 0.9em; color: #666; margin: 0;">
                        選擇一個Word文檔(.docx)文件進行預覽
                    </p>
                </div>
            `;
        }
        
        html += `
                <div class="preview-container" style="
                    min-height: 200px; 
                    border: 1px solid #eee; 
                    border-radius: 4px; 
                    padding: 10px;
                    background: #fafafa;
                ">
                    <div style="text-align: center; color: #999; padding: 40px;">
                        等待選擇文件...
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // 綁定事件
        if (defaultOptions.showFileInput) {
            const fileInput = container.querySelector('.word-file-input');
            const previewContainer = container.querySelector('.preview-container');
            
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    this.previewDocument(file, previewContainer);
                }
            });
            
            // 拖拽功能
            if (defaultOptions.allowDrop) {
                this.setupDragAndDrop(container.querySelector('.word-preview-ui'), previewContainer);
            }
        }
        
        return container.querySelector('.preview-container');
    },
    
    // 設定拖拽功能
    setupDragAndDrop: function(dropZone, previewContainer) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.backgroundColor = '#f0f8ff';
            dropZone.style.borderColor = '#007acc';
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.backgroundColor = '';
            dropZone.style.borderColor = '#ddd';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.backgroundColor = '';
            dropZone.style.borderColor = '#ddd';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.name.endsWith('.docx')) {
                    this.previewDocument(file, previewContainer);
                } else {
                    this.showErrorState(previewContainer, '請選擇 .docx 格式的文件');
                }
            }
        });
    }
};

// 暴露到全域
window.WordPreviewLib = WordPreviewLib;