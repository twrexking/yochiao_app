// 現場採樣專用JavaScript

const Sampling = {
    currentProject: null,
    currentPoint: null,
    currentPointIndex: 0,
    samplingData: {},
    monitoringPoints: [],

    // 初始化採樣頁面
    init: function() {
        this.loadProjectOptions();
    },

    // 載入專案選項
    loadProjectOptions: function() {
        const projectSelect = document.getElementById('projectSelect');
        const projects = DataManager.getProjects();
        
        // 清空現有選項，保留預設選項
        projectSelect.innerHTML = '<option value="">請選擇專案</option>';
        
        projects.forEach(project => {
            const clientName = this.getClientName(project.clientId);
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.id} ${clientName} - ${project.projectName}`;
            projectSelect.appendChild(option);
        });
    },

    // 取得客戶名稱
    getClientName: function(clientId) {
        const client = DataManager.getClientById(clientId);
        if (client) {
            return client.companyName.replace('股份有限公司', '');
        }
        return '未知客戶';
    },

    // 載入採樣點位
    loadSamplingPoints: function() {
        const projectSelect = document.getElementById('projectSelect');
        const selectedProject = projectSelect.value;
        
        if (!selectedProject) {
            document.getElementById('samplingDetail').style.display = 'none';
            return;
        }
        
        this.currentProject = selectedProject;
        this.loadProjectPoints();
        this.initializeSamplingData();
        
        document.getElementById('samplingDetail').style.display = 'block';
        
        // 設定當天日期
        document.getElementById('samplingDate').value = new Date().toISOString().split('T')[0];
    },

    // 載入專案點位
    loadProjectPoints: function() {
        const projectData = DataManager.getProjectById(this.currentProject);
        
        if (!projectData || !projectData.samplingPoints) {
            this.monitoringPoints = [];
            Common.showNotification('專案沒有設定監測點位', 'error');
            return;
        }
        
        this.monitoringPoints = projectData.samplingPoints;
        this.renderPointsGrid();
    },

    // 渲染點位網格
    renderPointsGrid: function() {
        const container = document.getElementById('pointsGrid');
        
        container.innerHTML = this.monitoringPoints.map((point, index) => `
            <div class="point-card" data-point-id="${point.id}" onclick="Sampling.selectPoint('${point.id}', ${index})">
                <strong>${point.name}</strong>
                <p>${point.items.length} 個監測項目</p>
                <small>${point.description}</small>
                <div class="sampling-status" data-status="未開始">未開始</div>
            </div>
        `).join('');
    },

    // 選擇點位
    selectPoint: function(pointId, pointIndex) {
        // 移除其他點位的選中狀態
        document.querySelectorAll('.point-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // 選中當前點位
        const selectedCard = document.querySelector(`[data-point-id="${pointId}"]`);
        selectedCard.classList.add('selected');
        
        this.currentPoint = pointId;
        this.currentPointIndex = pointIndex;
        
        // 啟用開始採樣按鈕
        document.getElementById('startSamplingBtn').disabled = false;
    },

    // 開始採樣
    startSampling: function() {
        if (!this.currentPoint) {
            Common.showNotification('請先選擇監測點位', 'error');
            return;
        }
        
        // 切換到採樣表單頁面
        Common.switchTab(null, 'form', '#samplingDetail');
        document.querySelectorAll('#samplingDetail .tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('#samplingDetail .tab')[1].classList.add('active');
        
        // 載入當前點位的表單
        this.loadPointForm();
    },

    // 載入點位表單
    loadPointForm: function() {
        const point = this.monitoringPoints[this.currentPointIndex];
        
        // 更新標題
        document.getElementById('currentPointTitle').textContent = `${point.name} - 採樣記錄`;
        
        // 生成監測項目表單
        this.generateMonitoringItemsForm(point.items);
        
        // 載入已儲存的資料（如果有）
        this.loadSavedData();
    },

    // 生成監測項目表單
    generateMonitoringItemsForm: function(items) {
        const container = document.getElementById('monitoringItemsForm');
        
        container.innerHTML = `
            <h4>監測項目</h4>
            <div class="monitoring-items-grid">
                ${items.map(item => `
                    <div class="monitoring-item">
                        <label>${item}</label>
                        <div class="item-inputs">
                            <input type="number" 
                                   placeholder="量測值" 
                                   step="0.001" 
                                   data-item="${item}" 
                                   data-type="value">
                            <select data-item="${item}" data-type="unit">
                                <option value="">單位</option>
                                <option value="ppm">ppm</option>
                                <option value="mg/m³">mg/m³</option>
                                <option value="µg/m³">µg/m³</option>
                                <option value="dB">dB</option>
                                <option value="lux">lux</option>
                                <option value="°C">°C</option>
                                <option value="%">%</option>
                                <option value="m/s">m/s</option>
                                <option value="CFU/m³">CFU/m³</option>
                            </select>
                            <textarea placeholder="備註" 
                                     data-item="${item}" 
                                     data-type="note" 
                                     rows="1"></textarea>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // 初始化採樣資料
    initializeSamplingData: function() {
        if (!this.samplingData[this.currentProject]) {
            this.samplingData[this.currentProject] = {};
        }
    },

    // 載入已儲存的資料
    loadSavedData: function() {
        const projectData = this.samplingData[this.currentProject];
        const pointData = projectData ? projectData[this.currentPoint] : null;
        
        if (pointData) {
            // 載入環境資料
            Object.keys(pointData.environment || {}).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.value = pointData.environment[key];
                }
            });
            
            // 載入監測項目資料
            Object.keys(pointData.items || {}).forEach(item => {
                const itemData = pointData.items[item];
                ['value', 'unit', 'note'].forEach(type => {
                    const element = document.querySelector(`[data-item="${item}"][data-type="${type}"]`);
                    if (element && itemData[type]) {
                        element.value = itemData[type];
                    }
                });
            });
        }
    },

    // 儲存採樣資料
    saveSamplingData: function() {
        const formData = this.collectFormData();
        
        if (!this.samplingData[this.currentProject]) {
            this.samplingData[this.currentProject] = {};
        }
        
        this.samplingData[this.currentProject][this.currentPoint] = formData;
        
        // 儲存到 DataManager
        const allSamplingData = DataManager.getFromLocal('samplingRecords') || [];
        const recordIndex = allSamplingData.findIndex(record => 
            record.projectId === this.currentProject && record.pointId === this.currentPoint
        );
        
        const record = {
            projectId: this.currentProject,
            pointId: this.currentPoint,
            pointName: this.monitoringPoints[this.currentPointIndex].name,
            data: formData,
            timestamp: new Date().toISOString(),
            status: '已完成'
        };
        
        if (recordIndex >= 0) {
            allSamplingData[recordIndex] = record;
        } else {
            allSamplingData.push(record);
        }
        
        DataManager.saveToLocal('samplingRecords', allSamplingData);
        
        // 更新點位狀態
        this.updatePointStatus(this.currentPoint, '已完成');
        
        Common.showNotification('採樣資料儲存成功！', 'success');
    },

    // 收集表單資料
    collectFormData: function() {
        const data = {
            environment: {},
            items: {}
        };
        
        // 收集環境資料
        ['samplingDate', 'weather', 'temperature', 'humidity', 'windSpeed'].forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                data.environment[field] = element.value;
            }
        });
        
        // 收集監測項目資料
        document.querySelectorAll('[data-item]').forEach(element => {
            const item = element.getAttribute('data-item');
            const type = element.getAttribute('data-type');
            
            if (!data.items[item]) {
                data.items[item] = {};
            }
            
            data.items[item][type] = element.value;
        });
        
        return data;
    },

    // 更新點位狀態
    updatePointStatus: function(pointId, status) {
        const pointCard = document.querySelector(`[data-point-id="${pointId}"]`);
        if (pointCard) {
            const statusElement = pointCard.querySelector('.sampling-status');
            statusElement.textContent = status;
            statusElement.setAttribute('data-status', status);
        }
    },

    // 下一個點位
    nextPoint: function() {
        const nextIndex = this.currentPointIndex + 1;
        if (nextIndex < this.monitoringPoints.length) {
            const nextPoint = this.monitoringPoints[nextIndex];
            this.selectPoint(nextPoint.id, nextIndex);
            this.loadPointForm();
        } else {
            Common.showNotification('已是最後一個點位', 'info');
        }
    },

    // 上一個點位
    previousPoint: function() {
        const prevIndex = this.currentPointIndex - 1;
        if (prevIndex >= 0) {
            const prevPoint = this.monitoringPoints[prevIndex];
            this.selectPoint(prevPoint.id, prevIndex);
            this.loadPointForm();
        } else {
            Common.showNotification('已是第一個點位', 'info');
        }
    },

    // 載入檢視資料
    loadReviewData: function() {
        const tbody = document.querySelector('#samplingDataTable tbody');
        const projectData = this.samplingData[this.currentProject] || {};
        
        let tableContent = '';
        
        this.monitoringPoints.forEach(point => {
            const pointData = projectData[point.id];
            if (pointData) {
                point.items.forEach(item => {
                    const itemData = pointData.items[item] || {};
                    tableContent += `
                        <tr>
                            <td>${point.name}</td>
                            <td>${item}</td>
                            <td>${itemData.value || '-'}</td>
                            <td>${itemData.unit || '-'}</td>
                            <td>${itemData.note || '-'}</td>
                            <td>${pointData.environment.samplingDate || '-'}</td>
                        </tr>
                    `;
                });
            }
        });
        
        if (tableContent) {
            tbody.innerHTML = tableContent;
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">尚無採樣資料</td></tr>';
        }
    },

    // 儀器校正
    calibrateInstrument: function(instrumentType) {
        // 開啟校正模態框
        document.getElementById('instrumentId').value = instrumentType + '_' + Date.now();
        document.getElementById('calibrationModal').classList.add('active');
    },

    // 儲存校正資料
    saveCalibration: function() {
        const calibrationData = {
            instrumentId: document.getElementById('instrumentId').value,
            beforeCalibration: document.getElementById('beforeCalibration').value,
            standardConcentration: document.getElementById('standardConcentration').value,
            afterCalibration: document.getElementById('afterCalibration').value,
            calibrationFactor: document.getElementById('calibrationFactor').value,
            notes: document.getElementById('calibrationNotes').value,
            timestamp: new Date().toISOString(),
            projectId: this.currentProject,
            operator: '系統用戶'
        };
        
        const calibrationRecords = DataManager.getFromLocal('calibrationRecords') || [];
        calibrationRecords.push(calibrationData);
        DataManager.saveToLocal('calibrationRecords', calibrationRecords);
        
        Common.showNotification('儀器校正記錄已儲存', 'success');
        Common.closeModal();
    },

    // 品管樣本
    qcSample: function() {
        document.getElementById('qcSampleModal').classList.add('active');
    },

    // 儲存品管樣本
    saveQCSample: function() {
        // 收集各個標籤頁的資料
        const qcData = {
            projectId: this.currentProject,
            pointId: this.currentPoint,
            timestamp: new Date().toISOString(),
            blankSample: {
                sampleId: document.querySelector('#blankSample input[placeholder="樣本編號"]')?.value || '',
                description: document.querySelector('#blankSample textarea')?.value || ''
            },
            duplicateSample: {
                originalSampleId: document.querySelector('#duplicateSample input[placeholder="原樣本編號"]')?.value || '',
                description: document.querySelector('#duplicateSample textarea')?.value || ''
            },
            spikedSample: {
                sampleId: document.querySelector('#spikedSample input[placeholder="樣本編號"]')?.value || '',
                description: document.querySelector('#spikedSample textarea')?.value || ''
            }
        };
        
        const qcRecords = DataManager.getFromLocal('qcSampleRecords') || [];
        qcRecords.push(qcData);
        DataManager.saveToLocal('qcSampleRecords', qcRecords);
        
        Common.showNotification('品管樣本記錄已儲存', 'success');
        Common.closeModal();
    },

    // 匯出採樣資料
    exportSamplingData: function() {
        const projectData = this.samplingData[this.currentProject] || {};
        const exportData = {
            projectId: this.currentProject,
            projectName: DataManager.getProjectById(this.currentProject)?.projectName || '',
            exportDate: new Date().toISOString(),
            samplingData: projectData
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `sampling_data_${this.currentProject}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        Common.showNotification('採樣資料已匯出', 'success');
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待資料初始化完成後再載入採樣系統
    setTimeout(() => {
        Sampling.init();
    }, 100);
});

// 暴露給全域使用
window.Sampling = Sampling;