// 報表輸出專用JavaScript

const Reports = {
    currentGenerationId: null,
    generationCancelled: false,
    
    // 載入專案資料
    loadProjectData: function() {
        const projectSelect = document.getElementById('projectSelect');
        const selectedProject = projectSelect.value;
        
        if (selectedProject) {
            // 可以在這裡載入專案特定的資料，用於自動填入其他欄位
            console.log('已選擇專案:', selectedProject);
        }
    },

    // 產生快速報表
    generateQuickReport: function() {
        const form = document.getElementById('quickReportForm');
        const formData = new FormData(form);
        
        if (!Common.validateForm('#quickReportForm')) {
            Common.showNotification('請填寫所有必填欄位', 'error');
            return;
        }
        
        const reportConfig = {
            projectId: formData.get('projectId'),
            reportType: formData.get('reportType'),
            outputFormat: formData.get('outputFormat'),
            generationTime: new Date().toISOString()
        };
        
        this.startReportGeneration(reportConfig);
    },

    // 開始報表產生流程
    startReportGeneration: function(config) {
        this.currentGenerationId = 'report_' + Date.now();
        this.generationCancelled = false;
        
        // 顯示進度模態框
        document.getElementById('progressModal').classList.add('active');
        
        // 重設進度
        this.updateProgress(0, '開始產生報表...');
        
        // 模擬報表產生過程
        this.simulateReportGeneration(config);
    },

    // 模擬報表產生過程
    simulateReportGeneration: function(config) {
        const steps = [
            { progress: 10, text: '正在收集專案資料...', delay: 500 },
            { progress: 25, text: '正在處理監測數據...', delay: 800 },
            { progress: 50, text: '正在進行法規比對...', delay: 600 },
            { progress: 70, text: '正在生成圖表...', delay: 900 },
            { progress: 85, text: '正在產生報表文件...', delay: 700 },
            { progress: 95, text: '正在完成最後處理...', delay: 400 },
            { progress: 100, text: '報表產生完成！', delay: 300 }
        ];
        
        let currentStep = 0;
        
        const processStep = () => {
            if (this.generationCancelled) {
                Common.closeModal();
                return;
            }
            
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                this.updateProgress(step.progress, step.text);
                
                setTimeout(() => {
                    currentStep++;
                    processStep();
                }, step.delay);
            } else {
                // 完成報表產生
                this.completeReportGeneration(config);
            }
        };
        
        processStep();
    },

    // 更新進度
    updateProgress: function(progress, text) {
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressText').textContent = text;
        
        // 更新詳細步驟
        const details = document.getElementById('progressDetails');
        const steps = details.querySelectorAll('p');
        
        if (progress >= 10) steps[0].style.color = '#28a745';
        if (progress >= 25) steps[1].style.color = '#28a745';
        if (progress >= 50) steps[2].style.color = '#28a745';
        if (progress >= 85) steps[3].style.color = '#28a745';
    },

    // 完成報表產生
    completeReportGeneration: function(config) {
        // 創建報表記錄
        const reportRecord = {
            id: this.currentGenerationId,
            name: this.generateReportName(config),
            projectId: config.projectId,
            reportType: this.getReportTypeName(config.reportType),
            outputFormat: config.outputFormat.toUpperCase(),
            fileSize: this.generateRandomFileSize(),
            generationTime: new Date().toISOString(),
            status: '完成'
        };
        
        // 儲存到歷史記錄
        this.saveReportHistory(reportRecord);
        
        // 新增到表格
        this.addReportToHistory(reportRecord);
        
        // 關閉進度模態框
        Common.closeModal();
        
        // 顯示完成通知
        Common.showNotification('報表產生完成！', 'success');
        
        // 清空表單
        document.getElementById('quickReportForm').reset();
    },

    // 生成報表名稱
    generateReportName: function(config) {
        const projectNames = {
            'YOC114-001': '味全食品114年Q1',
            'YOC114-002': '葡萄王生技龍潭廠區',
            'YOC113-015': '統一企業永康廠區年度'
        };
        
        const typeNames = {
            'monitoring_summary': '監測總表',
            'analysis_report': '分析報告',
            'plan_document': '計畫書',
            'compliance_report': '法規符合性報告',
            'calibration_report': '校正報告'
        };
        
        const projectName = projectNames[config.projectId] || config.projectId;
        const typeName = typeNames[config.reportType] || config.reportType;
        
        return `${projectName}${typeName}`;
    },

    // 取得報表類型名稱
    getReportTypeName: function(type) {
        const typeNames = {
            'monitoring_summary': '監測總表',
            'analysis_report': '分析報告',
            'plan_document': '計畫書',
            'compliance_report': '法規符合性報告',
            'calibration_report': '校正報告'
        };
        
        return typeNames[type] || type;
    },

    // 生成隨機檔案大小
    generateRandomFileSize: function() {
        const sizes = ['1.2 MB', '1.8 MB', '2.5 MB', '3.1 MB', '4.2 MB', '5.6 MB'];
        return sizes[Math.floor(Math.random() * sizes.length)];
    },

    // 儲存報表歷史
    saveReportHistory: function(reportRecord) {
        const history = DataManager.getFromLocal('reportHistory') || [];
        history.unshift(reportRecord); // 新的記錄放在最前面
        
        // 限制歷史記錄數量
        if (history.length > 50) {
            history.splice(50);
        }
        
        DataManager.saveToLocal('reportHistory', history);
    },

    // 新增報表到歷史表格
    addReportToHistory: function(reportRecord) {
        const tbody = document.querySelector('#reportHistoryTable tbody');
        const row = document.createElement('tr');
        
        const generationTime = new Date(reportRecord.generationTime);
        const timeString = generationTime.toLocaleString('zh-TW').replace(/\//g, '/');
        
        row.innerHTML = `
            <td>${timeString}</td>
            <td>${reportRecord.name}</td>
            <td>${reportRecord.projectId}</td>
            <td>${reportRecord.reportType}</td>
            <td>${reportRecord.outputFormat}</td>
            <td>${reportRecord.fileSize}</td>
            <td><span class="status-badge">${reportRecord.status}</span></td>
            <td>
                <button class="btn" onclick="Reports.downloadReport('${reportRecord.id}')">下載</button>
                <button class="btn" onclick="Reports.previewReport('${reportRecord.id}')">預覽</button>
                <button class="btn" onclick="Reports.deleteReport('${reportRecord.id}')">刪除</button>
            </td>
        `;
        
        // 插入到表格最前面
        tbody.insertBefore(row, tbody.firstChild);
    },

    // 取消報表產生
    cancelGeneration: function() {
        this.generationCancelled = true;
        Common.closeModal();
        Common.showNotification('報表產生已取消', 'info');
    },

    // 產生批次報表
    generateBatchReports: function() {
        const startDate = document.getElementById('batchStartDate').value;
        const endDate = document.getElementById('batchEndDate').value;
        
        if (!startDate || !endDate) {
            Common.showNotification('請選擇日期範圍', 'error');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            Common.showNotification('開始日期不能晚於結束日期', 'error');
            return;
        }
        
        Common.showNotification('開始批次產生報表...', 'info');
        
        // 模擬批次處理
        setTimeout(() => {
            Common.showNotification('批次報表產生完成！', 'success');
        }, 3000);
    },

    // 搜尋歷史記錄
    searchHistory: function() {
        const searchTerm = document.getElementById('historySearch').value.toLowerCase();
        const rows = document.querySelectorAll('#reportHistoryTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // 清除歷史記錄
    clearHistory: function() {
        Common.confirm('確定要清除所有報表歷史記錄嗎？', () => {
            DataManager.removeFromLocal('reportHistory');
            
            const tbody = document.querySelector('#reportHistoryTable tbody');
            tbody.innerHTML = '';
            
            Common.showNotification('歷史記錄已清除', 'success');
        });
    },

    // 建立自訂報表
    createCustomReport: function() {
        const reportName = document.getElementById('customReportName').value.trim();
        
        if (!reportName) {
            Common.showNotification('請輸入報表名稱', 'error');
            return;
        }

        // 收集選中的欄位
        const checkboxes = document.querySelectorAll('.checkbox-container input[type="checkbox"]:checked');
        const selectedFields = Array.from(checkboxes).map(cb => ({
            value: cb.value,
            text: cb.nextElementSibling.textContent
        }));

        if (selectedFields.length === 0) {
            Common.showNotification('請至少選擇一個包含欄位', 'error');
            return;
        }

        // 建立自訂報表配置
        const customConfig = {
            customName: reportName,
            selectedFields: selectedFields,
            reportType: 'custom_report',
            outputFormat: 'pdf', // 預設為 PDF
            generationTime: new Date().toISOString()
        };

        // 顯示確認對話框
        const fieldNames = selectedFields.map(f => f.text).join('、');
        const confirmMessage = `確定要建立自訂報表嗎？\n\n報表名稱：${reportName}\n包含欄位：${fieldNames}`;
        
        if (confirm(confirmMessage)) {
            this.startReportGeneration(customConfig);
            
            // 清除表單
            document.getElementById('customReportName').value = '';
            // 重設 checkbox 為預設狀態
            document.querySelectorAll('.checkbox-container input[type="checkbox"]').forEach(cb => {
                cb.checked = ['project_info', 'client_info', 'sampling_data'].includes(cb.value);
            });
        }
    },

    // 切換 checkbox 狀態
    toggleCheckbox: function(element) {
        const checkbox = element.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.checked = !checkbox.checked;
        }
    },

    // 下載報表
    downloadReport: function(reportId) {
        Common.showNotification('開始下載報表...', 'info');
        
        // 模擬下載過程
        setTimeout(() => {
            Common.showNotification('報表下載完成！', 'success');
        }, 1500);
    },

    // 預覽報表
    previewReport: function(reportId) {
        // 載入報表資料
        const reportData = this.getReportData(reportId);
        
        if (reportData) {
            document.getElementById('previewTitle').textContent = `報表預覽 - ${reportData.name}`;
            
            // 生成預覽內容
            const previewContent = this.generatePreviewContent(reportData);
            document.getElementById('previewContent').innerHTML = previewContent;
            
            document.getElementById('reportPreviewModal').classList.add('active');
        }
    },

    // 取得報表資料
    getReportData: function(reportId) {
        const history = DataManager.getFromLocal('reportHistory') || [];
        return history.find(report => report.id === reportId);
    },

    // 生成預覽內容
    generatePreviewContent: function(reportData) {
        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1>友喬環境監測系統</h1>
                <h2>${reportData.name}</h2>
                <p>報表產生日期：${new Date(reportData.generationTime).toLocaleDateString('zh-TW')}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>專案基本資訊</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9;"><strong>專案編號</strong></td>
                        <td style="border: 1px solid #ccc; padding: 8px;">${reportData.projectId}</td>
                        <td style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9;"><strong>客戶名稱</strong></td>
                        <td style="border: 1px solid #ccc; padding: 8px;">味全食品工業股份有限公司</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9;"><strong>監測日期</strong></td>
                        <td style="border: 1px solid #ccc; padding: 8px;">2025/03/20</td>
                        <td style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9;"><strong>監測人員</strong></td>
                        <td style="border: 1px solid #ccc; padding: 8px;">張技師、李技師</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>監測結果摘要</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="border: 1px solid #ccc; padding: 8px;">監測點位</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">監測項目</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">測定值</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">標準值</th>
                            <th style="border: 1px solid #ccc; padding: 8px;">判定結果</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">A棟1F大廳</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">甲醛</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">0.05 ppm</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">0.08 ppm</td>
                            <td style="border: 1px solid #ccc; padding: 8px; color: green;">✓ 合格</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">A棟1F大廳</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">CO2</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">650 ppm</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">1000 ppm</td>
                            <td style="border: 1px solid #ccc; padding: 8px; color: green;">✓ 合格</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ccc; padding: 8px;">B1F停車場</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">CO</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">3.2 ppm</td>
                            <td style="border: 1px solid #ccc; padding: 8px;">9 ppm</td>
                            <td style="border: 1px solid #ccc; padding: 8px; color: green;">✓ 合格</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>結論與建議</h3>
                <p>根據本次監測結果，所有監測項目均符合相關法規標準要求。建議持續進行定期監測，以確保室內空氣品質維持良好狀態。</p>
            </div>
            
            <div style="text-align: right; margin-top: 40px;">
                <p>監測單位：友喬環境工程顧問有限公司</p>
                <p>報告日期：${new Date().toLocaleDateString('zh-TW')}</p>
            </div>
        `;
    },

    // 列印預覽
    printPreview: function() {
        const previewContent = document.getElementById('previewContent').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>報表列印</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1, h2, h3 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background-color: #f0f0f0; }
                    </style>
                </head>
                <body>
                    ${previewContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    // 下載當前預覽
    downloadCurrentPreview: function() {
        Common.showNotification('開始下載報表...', 'info');
        
        setTimeout(() => {
            Common.showNotification('報表下載完成！', 'success');
        }, 1500);
    },

    // 刪除報表
    deleteReport: function(reportId) {
        Common.confirm('確定要刪除這份報表嗎？', () => {
            // 從本地儲存移除
            const history = DataManager.getFromLocal('reportHistory') || [];
            const updatedHistory = history.filter(report => report.id !== reportId);
            DataManager.saveToLocal('reportHistory', updatedHistory);
            
            // 從表格移除
            const rows = document.querySelectorAll('#reportHistoryTable tbody tr');
            rows.forEach(row => {
                const downloadBtn = row.querySelector('button[onclick*="' + reportId + '"]');
                if (downloadBtn) {
                    row.remove();
                }
            });
            
            Common.showNotification('報表已刪除', 'success');
        });
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 載入報表歷史
    const history = DataManager.getFromLocal('reportHistory') || [];
    history.forEach(report => {
        Reports.addReportToHistory(report);
    });
    
    // 設定日期預設值
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    document.getElementById('batchStartDate').value = oneMonthAgo.toISOString().split('T')[0];
    document.getElementById('batchEndDate').value = today.toISOString().split('T')[0];
});

// 暴露給全域使用
window.Reports = Reports;