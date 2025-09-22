/**
 * 友喬環境監測系統 - Word 套版工具
 * 簡化版本，專門用於友喬系統的報表生成
 */
class YochaioWordGenerator {
    constructor() {
        this.generator = new WordTemplateGenerator();
    }

    /**
     * 生成客戶報表
     * @param {Object} clientData - 客戶資料
     * @param {string} templateName - 樣板檔案名稱
     */
    async generateClientReport(clientData, templateName = 'client_report.docx') {
        try {
            await this.generator.loadTemplate(templateName);
            
            const variables = {
                // 基本資訊
                CompanyName: '友喬環境監測股份有限公司',
                ReportDate: new Date(),
                
                // 客戶資訊
                ClientName: clientData.name || '',
                ClientContact: clientData.contact || '',
                ClientPhone: clientData.phone || '',
                ClientEmail: clientData.email || '',
                ClientAddress: clientData.address || '',
                
                // 專案資訊
                ProjectName: clientData.projectName || '',
                ProjectType: clientData.projectType || '',
                MonitoringDate: clientData.monitoringDate ? new Date(clientData.monitoringDate) : new Date(),
                
                // 監測項目
                MonitoringItems: clientData.monitoringItems || [],
                
                // 採樣資料
                SamplingData: clientData.samplingData || [],
                
                // 報告摘要
                ExecutiveSummary: clientData.executiveSummary || '',
                Recommendations: clientData.recommendations || [],
                
                // 附加資訊
                Notes: clientData.notes || ''
            };

            const filename = `${clientData.name || '客戶'}_監測報告_${this.formatDate(new Date())}.docx`;
            
            return await this.generator.generateAndDownload(variables, filename);
        } catch (error) {
            console.error('生成客戶報表失敗:', error);
            throw error;
        }
    }

    /**
     * 生成專案報表
     * @param {Object} projectData - 專案資料
     * @param {string} templateName - 樣板檔案名稱
     */
    async generateProjectReport(projectData, templateName = 'project_report.docx') {
        try {
            await this.generator.loadTemplate(templateName);
            
            const variables = {
                // 基本資訊
                CompanyName: '友喬環境監測股份有限公司',
                ReportDate: new Date(),
                
                // 專案資訊
                ProjectID: projectData.id || '',
                ProjectName: projectData.projectName || '',
                ProjectType: projectData.projectType || '',
                ProjectStatus: projectData.status || '',
                StartDate: projectData.startDate ? new Date(projectData.startDate) : null,
                EndDate: projectData.endDate ? new Date(projectData.endDate) : null,
                
                // 客戶資訊
                ClientName: projectData.clientName || '',
                ClientContact: projectData.clientContact || '',
                
                // 監測資料
                MonitoringPlan: projectData.monitoringPlan || '',
                MonitoringItems: projectData.monitoringItems || [],
                SamplingLocations: projectData.samplingLocations || [],
                TestResults: projectData.testResults || [],
                
                // 時程表
                MonitoringSchedule: projectData.schedule || [],
                
                // 結論與建議
                Conclusions: projectData.conclusions || '',
                Recommendations: projectData.recommendations || [],
                
                // 附件清單
                Attachments: projectData.attachments || []
            };

            const filename = `${projectData.projectName || '專案'}_報告_${this.formatDate(new Date())}.docx`;
            
            return await this.generator.generateAndDownload(variables, filename);
        } catch (error) {
            console.error('生成專案報表失敗:', error);
            throw error;
        }
    }

    /**
     * 生成採樣記錄表
     * @param {Object} samplingData - 採樣資料
     * @param {string} templateName - 樣板檔案名稱
     */
    async generateSamplingRecord(samplingData, templateName = 'sampling_record.docx') {
        try {
            await this.generator.loadTemplate(templateName);
            
            const variables = {
                // 基本資訊
                CompanyName: '友喬環境監測股份有限公司',
                RecordDate: new Date(),
                
                // 採樣基本資訊
                SamplingID: samplingData.id || '',
                ProjectName: samplingData.projectName || '',
                ClientName: samplingData.clientName || '',
                SamplingDate: samplingData.samplingDate ? new Date(samplingData.samplingDate) : new Date(),
                
                // 採樣地點
                SamplingLocation: samplingData.location || '',
                LocationDescription: samplingData.locationDescription || '',
                Coordinates: samplingData.coordinates || '',
                
                // 天氣條件
                WeatherConditions: samplingData.weather || '',
                Temperature: samplingData.temperature || '',
                Humidity: samplingData.humidity || '',
                WindDirection: samplingData.windDirection || '',
                WindSpeed: samplingData.windSpeed || '',
                
                // 採樣人員
                SamplingTeam: samplingData.team || [],
                ResponsiblePerson: samplingData.responsiblePerson || '',
                
                // 採樣項目
                SamplingItems: samplingData.items || [],
                SamplingMethods: samplingData.methods || [],
                
                // 現場觀察
                FieldObservations: samplingData.observations || '',
                Photos: samplingData.photos || [],
                
                // 品保品管
                QualityControl: samplingData.qualityControl || '',
                ChainOfCustody: samplingData.chainOfCustody || '',
                
                // 備註
                Notes: samplingData.notes || ''
            };

            const filename = `採樣記錄_${samplingData.projectName || '專案'}_${this.formatDate(new Date())}.docx`;
            
            return await this.generator.generateAndDownload(variables, filename);
        } catch (error) {
            console.error('生成採樣記錄失敗:', error);
            throw error;
        }
    }

    /**
     * 生成快速報表 (使用當前頁面資料)
     * @param {string} reportType - 報表類型 ('client', 'project', 'sampling')
     * @param {string} templateName - 樣板檔案名稱
     */
    async generateQuickReport(reportType, templateName = null) {
        try {
            let data = {};
            
            // 根據當前頁面收集資料
            switch (reportType) {
                case 'client':
                    if (window.Clients && typeof window.Clients.getCurrentClientData === 'function') {
                        data = window.Clients.getCurrentClientData();
                    }
                    templateName = templateName || 'client_report.docx';
                    return await this.generateClientReport(data, templateName);
                    
                case 'project':
                    if (window.Projects && typeof window.Projects.getCurrentProjectData === 'function') {
                        data = window.Projects.getCurrentProjectData();
                    }
                    templateName = templateName || 'project_report.docx';
                    return await this.generateProjectReport(data, templateName);
                    
                case 'sampling':
                    if (window.Sampling && typeof window.Sampling.getCurrentSamplingData === 'function') {
                        data = window.Sampling.getCurrentSamplingData();
                    }
                    templateName = templateName || 'sampling_record.docx';
                    return await this.generateSamplingRecord(data, templateName);
                    
                default:
                    throw new Error('不支援的報表類型: ' + reportType);
            }
        } catch (error) {
            console.error('生成快速報表失敗:', error);
            throw error;
        }
    }

    /**
     * 生成自訂報表
     * @param {Object} customData - 自訂資料
     * @param {string} templateName - 樣板檔案名稱
     * @param {string} filename - 檔案名稱
     */
    async generateCustomReport(customData, templateName, filename = null) {
        try {
            await this.generator.loadTemplate(templateName);
            
            // 加入公司基本資訊
            const variables = {
                CompanyName: '友喬環境監測股份有限公司',
                CompanyAddress: '台北市內湖區民權東路六段123號',
                CompanyPhone: '(02) 2792-8080',
                CompanyEmail: 'info@yoqiao.com.tw',
                ReportDate: new Date(),
                ...customData
            };

            const finalFilename = filename || `自訂報表_${this.formatDate(new Date())}.docx`;
            
            return await this.generator.generateAndDownload(variables, finalFilename);
        } catch (error) {
            console.error('生成自訂報表失敗:', error);
            throw error;
        }
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
        return `${year}${month}${day}`;
    }

    /**
     * 取得可用的樣板清單
     * @returns {Array} 樣板清單
     */
    getAvailableTemplates() {
        return [
            { name: 'client_report.docx', description: '客戶報表樣板' },
            { name: 'project_report.docx', description: '專案報表樣板' },
            { name: 'sampling_record.docx', description: '採樣記錄樣板' },
            { name: 'monitoring_plan.docx', description: '監測計畫樣板' },
            { name: 'test_results.docx', description: '檢測結果樣板' },
            { name: 'environmental_assessment.docx', description: '環境評估樣板' }
        ];
    }

    /**
     * 驗證資料完整性
     * @param {Object} data - 要驗證的資料
     * @param {Array} requiredFields - 必要欄位清單
     * @returns {Object} 驗證結果
     */
    validateData(data, requiredFields = []) {
        const missing = requiredFields.filter(field => !data[field] || data[field] === '');
        
        return {
            isValid: missing.length === 0,
            missingFields: missing,
            message: missing.length > 0 ? `缺少必要欄位: ${missing.join(', ')}` : '資料驗證通過'
        };
    }
}

// 暴露全域變數
window.YochaioWordGenerator = YochaioWordGenerator;

// 建立預設實例
window.yochaioWordGenerator = new YochaioWordGenerator();

// 匯出模組 (如果在模組環境中)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YochaioWordGenerator;
}