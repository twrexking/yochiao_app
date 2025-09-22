// 資料庫管理專用JavaScript

const Database = {
    currentTab: 'chemicals',
    
    // 切換資料庫標籤頁
    switchDbTab: function(event, tabName) {
        this.currentTab = tabName;
        
        // 隱藏所有標籤內容
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        
        // 顯示選中的標籤內容
        document.getElementById(tabName).classList.add('active');
        
        // 更新標籤樣式
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
    },

    // 搜尋化學品
    searchChemicals: function() {
        const searchTerm = document.getElementById('chemicalSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#chemicalsTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // 儲存化學品
    saveChemical: function() {
        const form = document.getElementById('chemicalForm');
        const formData = new FormData(form);
        
        if (!Common.validateForm('#chemicalForm')) {
            Common.showNotification('請填寫所有必填欄位', 'error');
            return;
        }
        
        // 驗證CAS號碼格式
        const casNumber = formData.get('casNumber');
        if (!/^[0-9]{2,7}-[0-9]{2}-[0-9]$/.test(casNumber)) {
            Common.showNotification('CAS編號格式不正確', 'error');
            return;
        }
        
        // 建立化學品資料
        const chemicalData = {
            name: formData.get('chemicalName'),
            casNumber: formData.get('casNumber'),
            molecularFormula: formData.get('molecularFormula'),
            twa: formData.get('twa'),
            stel: formData.get('stel'),
            ceiling: formData.get('ceiling'),
            samplingMethod: formData.get('samplingMethod'),
            physicalProperties: formData.get('physicalProperties'),
            healthHazards: formData.get('healthHazards'),
            createdDate: new Date().toISOString()
        };
        
        // 儲存到本地
        const chemicals = DataManager.getFromLocal('chemicals') || [];
        chemicals.push(chemicalData);
        DataManager.saveToLocal('chemicals', chemicals);
        
        // 新增到表格
        this.addChemicalToTable(chemicalData);
        
        Common.showNotification('化學品新增成功！', 'success');
        Common.closeModal();
        form.reset();
    },

    // 新增化學品到表格
    addChemicalToTable: function(chemicalData) {
        const tbody = document.querySelector('#chemicalsTable tbody');
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${chemicalData.name}</td>
            <td>${chemicalData.casNumber}</td>
            <td>${chemicalData.molecularFormula}</td>
            <td>${chemicalData.twa || '-'}</td>
            <td>${chemicalData.stel || '-'}</td>
            <td>${chemicalData.ceiling || '-'}</td>
            <td>${chemicalData.samplingMethod}</td>
            <td>
                <button class="btn" onclick="Database.editChemical('${chemicalData.casNumber}')">編輯</button>
                <button class="btn" onclick="Database.deleteChemical('${chemicalData.casNumber}')">刪除</button>
            </td>
        `;
        
        tbody.appendChild(row);
    },

    // 編輯化學品
    editChemical: function(casNumber) {
        Common.showNotification('編輯化學品功能開發中...', 'info');
    },

    // 刪除化學品
    deleteChemical: function(casNumber) {
        Common.confirm('確定要刪除這個化學品資料嗎？', () => {
            // 從本地儲存移除
            const chemicals = DataManager.getFromLocal('chemicals') || [];
            const updatedChemicals = chemicals.filter(chem => chem.casNumber !== casNumber);
            DataManager.saveToLocal('chemicals', updatedChemicals);
            
            // 從表格移除
            const rows = document.querySelectorAll('#chemicalsTable tbody tr');
            rows.forEach(row => {
                if (row.cells[1].textContent === casNumber) {
                    row.remove();
                }
            });
            
            Common.showNotification('化學品已刪除', 'success');
        });
    },

    // 更新法規標準
    updateStandards: function() {
        Common.showNotification('正在更新法規標準...', 'info');
        
        // 模擬更新過程
        setTimeout(() => {
            Common.showNotification('法規標準更新完成！', 'success');
        }, 2000);
    },

    // 匯出法規標準
    exportStandards: function() {
        const standards = this.getStandardsData();
        const csvContent = this.convertToCSV(standards);
        this.downloadCSV(csvContent, 'standards.csv');
        Common.showNotification('法規標準匯出完成', 'success');
    },

    // 取得法規標準資料
    getStandardsData: function() {
        return [
            {
                category: '室內空氣品質',
                pollutant: '甲醛',
                value: '0.08',
                unit: 'ppm',
                averageTime: '1小時',
                regulation: '室內空氣品質管理法',
                effectiveDate: '2012/11/23'
            }
            // 可以新增更多標準
        ];
    },

    // 轉換為CSV格式
    convertToCSV: function(data) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        return csvContent;
    },

    // 下載CSV檔案
    downloadCSV: function(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // 編輯法規標準
    editStandard: function(standardId) {
        Common.showNotification('編輯法規標準功能開發中...', 'info');
    },

    // 儲存儀器
    saveInstrument: function() {
        const form = document.getElementById('instrumentForm');
        const formData = new FormData(form);
        
        if (!Common.validateForm('#instrumentForm')) {
            Common.showNotification('請填寫所有必填欄位', 'error');
            return;
        }
        
        // 處理多選項目
        const applicableItems = Array.from(form.querySelector('[name="applicableItems"]').selectedOptions)
                                     .map(option => option.value);
        
        // 建立儀器資料
        const instrumentData = {
            id: formData.get('instrumentId'),
            model: formData.get('model'),
            manufacturer: formData.get('manufacturer'),
            serialNumber: formData.get('serialNumber'),
            purchaseDate: formData.get('purchaseDate'),
            applicableItems: applicableItems,
            calibrationInterval: parseInt(formData.get('calibrationInterval')),
            status: formData.get('status'),
            notes: formData.get('notes'),
            createdDate: new Date().toISOString()
        };
        
        // 計算下次校正日期
        const purchaseDate = new Date(instrumentData.purchaseDate);
        const nextCalibration = new Date(purchaseDate);
        nextCalibration.setMonth(nextCalibration.getMonth() + instrumentData.calibrationInterval);
        instrumentData.nextCalibration = nextCalibration.toISOString().split('T')[0];
        
        // 儲存到本地
        const instruments = DataManager.getFromLocal('instruments') || [];
        instruments.push(instrumentData);
        DataManager.saveToLocal('instruments', instruments);
        
        // 新增到表格
        this.addInstrumentToTable(instrumentData);
        
        Common.showNotification('儀器新增成功！', 'success');
        Common.closeModal();
        form.reset();
    },

    // 新增儀器到表格
    addInstrumentToTable: function(instrumentData) {
        const tbody = document.querySelector('#instrumentsTable tbody');
        const row = document.createElement('tr');
        row.setAttribute('data-status', instrumentData.status);
        
        row.innerHTML = `
            <td>${instrumentData.id}</td>
            <td>${instrumentData.model}</td>
            <td>${instrumentData.manufacturer}</td>
            <td>${Common.formatDate(instrumentData.purchaseDate)}</td>
            <td>-</td>
            <td>${Common.formatDate(instrumentData.nextCalibration)}</td>
            <td><span class="status-badge">${instrumentData.status}</span></td>
            <td>
                <button class="btn" onclick="Database.showInstrumentDetail('${instrumentData.id}')">詳情</button>
                <button class="btn" onclick="Database.scheduleCalibration('${instrumentData.id}')">校正</button>
            </td>
        `;
        
        tbody.appendChild(row);
    },

    // 顯示儀器詳情
    showInstrumentDetail: function(instrumentId) {
        const instrumentData = this.getInstrumentData(instrumentId);
        
        if (instrumentData) {
            // 填入基本資料
            document.getElementById('instrumentDetailTitle').textContent = `${instrumentData.model} - 儀器詳細資訊`;
            document.getElementById('detailInstrumentId').textContent = instrumentData.id;
            document.getElementById('detailModel').textContent = instrumentData.model;
            document.getElementById('detailManufacturer').textContent = instrumentData.manufacturer;
            document.getElementById('detailSerialNumber').textContent = instrumentData.serialNumber || '-';
            document.getElementById('detailPurchaseDate').textContent = Common.formatDate(instrumentData.purchaseDate);
            document.getElementById('detailCalibrationInterval').textContent = `${instrumentData.calibrationInterval} 個月`;
            document.getElementById('detailStatus').textContent = instrumentData.status;
            document.getElementById('detailApplicableItems').textContent = instrumentData.applicableItems?.join(', ') || '-';
            
            // 載入校正記錄
            this.loadCalibrationHistory(instrumentId);
            
            // 載入維護記錄
            this.loadMaintenanceHistory(instrumentId);
            
            // 載入使用記錄
            this.loadUsageHistory(instrumentId);
            
            document.getElementById('instrumentDetailModal').classList.add('active');
        }
    },

    // 取得儀器資料
    getInstrumentData: function(instrumentId) {
        // 模擬儀器資料
        const mockData = {
            'TSI-7515': {
                id: 'TSI-7515',
                model: 'Q-Trak 7515',
                manufacturer: 'TSI',
                serialNumber: 'QT7515001',
                purchaseDate: '2023-01-15',
                calibrationInterval: 6,
                status: '可用',
                applicableItems: ['甲醛', 'CO', 'CO2', '溫濕度']
            },
            'TSI-7525': {
                id: 'TSI-7525',
                model: 'Q-Trak 7525',
                manufacturer: 'TSI',
                serialNumber: 'QT7525002',
                purchaseDate: '2023-03-20',
                calibrationInterval: 6,
                status: '校正中',
                applicableItems: ['CO', 'CO2', '溫濕度']
            }
        };
        
        return mockData[instrumentId];
    },

    // 載入校正記錄
    loadCalibrationHistory: function(instrumentId) {
        const tbody = document.getElementById('calibrationHistoryTable');
        const mockHistory = [
            {
                date: '2024/12/15',
                technician: '張技師',
                result: '合格',
                validUntil: '2025/06/15',
                notes: '儀器功能正常'
            },
            {
                date: '2024/06/15',
                technician: '李技師',
                result: '合格',
                validUntil: '2024/12/15',
                notes: '校正參數微調'
            }
        ];
        
        tbody.innerHTML = mockHistory.map(record => `
            <tr>
                <td>${record.date}</td>
                <td>${record.technician}</td>
                <td>${record.result}</td>
                <td>${record.validUntil}</td>
                <td>${record.notes}</td>
            </tr>
        `).join('');
    },

    // 載入維護記錄
    loadMaintenanceHistory: function(instrumentId) {
        const tbody = document.getElementById('maintenanceHistoryTable');
        const mockHistory = [
            {
                date: '2024/11/20',
                type: '定期保養',
                content: '清潔感測器，更換濾網',
                technician: '王技師',
                cost: 'NT$ 2,500'
            },
            {
                date: '2024/08/10',
                type: '故障維修',
                content: '更換顯示螢幕',
                technician: '陳技師',
                cost: 'NT$ 8,000'
            }
        ];
        
        tbody.innerHTML = mockHistory.map(record => `
            <tr>
                <td>${record.date}</td>
                <td>${record.type}</td>
                <td>${record.content}</td>
                <td>${record.technician}</td>
                <td>${record.cost}</td>
            </tr>
        `).join('');
    },

    // 載入使用記錄
    loadUsageHistory: function(instrumentId) {
        const tbody = document.getElementById('usageHistoryTable');
        const mockHistory = [
            {
                date: '2025/03/20',
                project: 'YOC114-001 味全食品',
                user: '張技師',
                duration: '8 小時',
                notes: '室內空氣品質監測'
            },
            {
                date: '2025/03/15',
                project: 'YOC114-002 葡萄王生技',
                user: '李技師',
                duration: '6 小時',
                notes: '作業環境監測'
            }
        ];
        
        tbody.innerHTML = mockHistory.map(record => `
            <tr>
                <td>${record.date}</td>
                <td>${record.project}</td>
                <td>${record.user}</td>
                <td>${record.duration}</td>
                <td>${record.notes}</td>
            </tr>
        `).join('');
    },

    // 安排校正
    scheduleCalibration: function(instrumentId) {
        Common.showNotification('校正排程功能開發中...', 'info');
    },

    // 生成校正排程
    generateCalibrationSchedule: function() {
        Common.showNotification('正在生成校正排程...', 'info');
        
        setTimeout(() => {
            Common.showNotification('校正排程已生成！', 'success');
        }, 1500);
    },

    // 編輯儀器
    editInstrument: function() {
        Common.showNotification('編輯儀器功能開發中...', 'info');
    },

    // 上傳模板
    uploadTemplate: function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.docx,.doc,.pdf';
        input.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                Common.showNotification(`正在上傳模板: ${file.name}`, 'info');
                
                // 模擬上傳過程
                setTimeout(() => {
                    Common.showNotification('模板上傳成功！', 'success');
                }, 2000);
            }
        };
        input.click();
    },

    // 匯出模板
    exportTemplates: function() {
        Common.showNotification('正在匯出所有模板...', 'info');
        
        setTimeout(() => {
            Common.showNotification('模板匯出完成！', 'success');
        }, 2000);
    },

    // 預覽模板
    previewTemplate: function(templateId) {
        Common.showNotification('開啟模板預覽...', 'info');
    },

    // 編輯模板
    editTemplate: function(templateId) {
        Common.showNotification('開啟模板編輯器...', 'info');
    },

    // 下載模板
    downloadTemplate: function(templateId) {
        Common.showNotification('開始下載模板...', 'info');
        
        // 模擬下載
        setTimeout(() => {
            Common.showNotification('模板下載完成！', 'success');
        }, 1500);
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 載入本地化學品資料
    const localChemicals = DataManager.getFromLocal('chemicals') || [];
    localChemicals.forEach(chemical => {
        Database.addChemicalToTable(chemical);
    });
    
    // 載入本地儀器資料
    const localInstruments = DataManager.getFromLocal('instruments') || [];
    localInstruments.forEach(instrument => {
        Database.addInstrumentToTable(instrument);
    });
});

// 暴露給全域使用
window.Database = Database;