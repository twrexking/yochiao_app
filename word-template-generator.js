/**
 * Word 套版輸出工具程式庫
 * 基於 docx-templates 和 FileSaver.js
 * 用於生成和下載 Word 文檔
 */
class WordTemplateGenerator {
    constructor() {
        this.templateBuffer = null;
        this.isLibrariesLoaded = false;
        this.loadPromise = this.loadLibraries();
    }

    /**
     * 載入必要的外部函式庫
     */
    async loadLibraries() {
        if (this.isLibrariesLoaded) {
            return;
        }

        try {
            // 載入 FileSaver.js
            if (!window.saveAs) {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
            }

            // 載入 docx-templates (ES6 模組)
            if (!window.docxTemplates) {
                const module = await import('https://unpkg.com/docx-templates/lib/browser.js');
                window.docxTemplates = module;
            }

            this.isLibrariesLoaded = true;
            console.log('Word 套版函式庫載入完成');
        } catch (error) {
            console.error('載入函式庫失敗:', error);
            throw new Error('載入 Word 套版函式庫失敗，請檢查網路連線');
        }
    }

    /**
     * 載入外部腳本
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * 從指定路徑載入樣板檔案
     * @param {string} templatePath - 樣板檔案路徑 (相對於 template 目錄)
     * @returns {Promise<void>}
     */
    async loadTemplate(templatePath) {
        await this.loadPromise; // 確保函式庫已載入

        try {
            // 構建完整的樣板路徑
            const fullPath = templatePath.startsWith('template/') ? 
                templatePath : `template/${templatePath}`;

            const response = await fetch(fullPath);
            
            if (!response.ok) {
                throw new Error(`樣板檔案載入失敗: ${response.status} ${response.statusText}`);
            }

            this.templateBuffer = await response.arrayBuffer();
            console.log(`樣板載入成功: ${templatePath}`);
            
            return {
                success: true,
                message: `樣板載入成功: ${templatePath}`,
                size: this.templateBuffer.byteLength
            };
        } catch (error) {
            console.error('載入樣板失敗:', error);
            throw new Error(`載入樣板失敗: ${error.message}`);
        }
    }

    /**
     * 從 File 物件載入樣板
     * @param {File} file - 樣板檔案物件
     * @returns {Promise<void>}
     */
    async loadTemplateFromFile(file) {
        await this.loadPromise; // 確保函式庫已載入

        try {
            if (!file.name.endsWith('.docx')) {
                throw new Error('只支援 .docx 格式的檔案');
            }

            this.templateBuffer = await file.arrayBuffer();
            console.log(`樣板載入成功: ${file.name}`);
            
            return {
                success: true,
                message: `樣板載入成功: ${file.name}`,
                size: this.templateBuffer.byteLength,
                name: file.name
            };
        } catch (error) {
            console.error('載入樣板失敗:', error);
            throw new Error(`載入樣板失敗: ${error.message}`);
        }
    }

    /**
     * 生成 Word 文檔
     * @param {Object} variables - 套版變數物件
     * @param {Object} options - 選項設定
     * @returns {Promise<ArrayBuffer>} 生成的文檔 buffer
     */
    async generateDocument(variables = {}, options = {}) {
        await this.loadPromise; // 確保函式庫已載入

        if (!this.templateBuffer) {
            throw new Error('請先載入樣板檔案');
        }

        try {
            // 預處理變數
            const processedVariables = this.preprocessVariables(variables);
            
            // 設定預設選項
            const defaultOptions = {
                template: this.templateBuffer,
                data: processedVariables,
                cmdDelimiter: ['{{', '}}'],
                additionalJsContext: {
                    // 提供額外的 JavaScript 上下文
                    formatDate: (date) => {
                        if (!date) return '';
                        const d = new Date(date);
                        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
                    },
                    formatNumber: (num, decimals = 0) => {
                        if (typeof num !== 'number') return num;
                        return num.toFixed(decimals);
                    }
                },
                ...options
            };

            console.log('開始生成文檔，使用變數:', processedVariables);

            // 使用 docx-templates 生成文檔
            const buffer = await window.docxTemplates.createReport(defaultOptions);
            
            console.log('文檔生成成功');
            return buffer;
        } catch (error) {
            console.error('生成文檔失敗:', error);
            throw new Error(`生成文檔失敗: ${error.message}`);
        }
    }

    /**
     * 生成並下載 Word 文檔
     * @param {Object} variables - 套版變數物件
     * @param {string} filename - 下載檔案名稱
     * @param {Object} options - 選項設定
     */
    async generateAndDownload(variables = {}, filename = null, options = {}) {
        try {
            const buffer = await this.generateDocument(variables, options);
            
            // 生成檔案名稱
            const finalFilename = filename || this.generateFilename(variables);
            
            // 使用 FileSaver 下載檔案
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            
            window.saveAs(blob, finalFilename);
            
            console.log(`文檔下載完成: ${finalFilename}`);
            return {
                success: true,
                filename: finalFilename,
                size: buffer.byteLength
            };
        } catch (error) {
            console.error('下載文檔失敗:', error);
            throw error;
        }
    }

    /**
     * 生成 Word 文檔並回傳 Blob
     * @param {Object} variables - 套版變數物件
     * @param {Object} options - 選項設定
     * @returns {Promise<Blob>} 生成的文檔 Blob
     */
    async generateDocumentBlob(variables = {}, options = {}) {
        try {
            const buffer = await this.generateDocument(variables, options);
            
            // 建立 Blob
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            
            console.log('文檔 Blob 生成成功');
            return blob;
        } catch (error) {
            console.error('生成文檔 Blob 失敗:', error);
            throw error;
        }
    }

    /**
     * 預處理變數，確保格式正確
     * @param {Object} variables - 原始變數物件
     * @returns {Object} 處理後的變數物件
     */
    preprocessVariables(variables) {
        const processed = { ...variables };

        // 處理各種資料類型
        Object.keys(processed).forEach(key => {
            const value = processed[key];



            // 處理日期
            if (value instanceof Date) {
                processed[key] = this.formatDate(value);
            }

            // 處理空值
            if (value === null || value === undefined) {
                processed[key] = '';
            }
        });

        return processed;
    }

    /**
     * 生成預設檔案名稱
     * @param {Object} variables - 變數物件
     * @returns {string} 檔案名稱
     */
    generateFilename(variables) {
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        
        // 嘗試從變數中提取有意義的名稱
        const possibleNames = [
            variables.ProjectName,
            variables.ClientName,
            variables.CompanyName,
            variables.Name,
            variables.Title
        ].filter(name => name && typeof name === 'string');

        const baseName = possibleNames.length > 0 ? 
            possibleNames[0].replace(/[^\w\u4e00-\u9fff]/g, '_') : '文檔';

        return `${baseName}_${dateStr}_${timeStr}.docx`;
    }

    /**
     * 格式化日期
     * @param {Date} date - 日期物件
     * @returns {string} 格式化後的日期字串
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}年${month}月${day}日`;
    }

    /**
     * 取得樣板變數建議
     * @param {Object} variables - 變數物件
     * @returns {Object} 變數使用建議
     */
    getVariablesSuggestions(variables) {
        const suggestions = {
            simple: [], // 簡單變數: {{變數名}}
            arrays: [], // 陣列: {{FOR item IN 陣列名}} {{item}} {{END-FOR item}}
            objects: [] // 物件陣列: {{FOR row IN 陣列名}} {{row.欄位}} {{END-FOR row}}
        };

        Object.entries(variables).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                    // 物件陣列
                    const fields = Object.keys(value[0]);
                    suggestions.objects.push({
                        name: key,
                        syntax: `{{FOR row IN ${key}}} {{row.${fields.join('}} {{row.')}}} {{END-FOR row}}`,
                        fields: fields
                    });
                } else {
                    // 簡單陣列
                    suggestions.arrays.push({
                        name: key,
                        syntax: `{{FOR item IN ${key}}} {{item}} {{END-FOR item}}`
                    });
                }
            } else {
                // 簡單變數
                suggestions.simple.push({
                    name: key,
                    syntax: `{{${key}}}`
                });
            }
        });

        return suggestions;
    }
}

// 暴露全域變數
window.WordTemplateGenerator = WordTemplateGenerator;

// 建立預設實例
window.wordTemplateGenerator = new WordTemplateGenerator();

// 匯出模組 (如果在模組環境中)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordTemplateGenerator;
}