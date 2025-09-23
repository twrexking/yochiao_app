// 專案管理專用JavaScript

const Projects = {
    currentStep: 1,
    currentProjectId: null,
    projectFormData: {},

    // 初始化專案頁面
    init: function() {
        this.loadProjectsTable();
        this.loadClientOptions();
    },

    // 載入專案表格
    loadProjectsTable: function() {
        const tbody = document.querySelector('#projectsTable tbody');
        const projects = DataManager.getProjects();
        
        tbody.innerHTML = '';
        
        projects.forEach(project => {
            this.addProjectToTable(project);
        });
    },

    // 載入客戶選項
    loadClientOptions: function() {
        const clientSelect = document.getElementById('clientSelect');
        const clients = DataManager.getClients();
        
        // 清空現有選項，保留預設選項
        clientSelect.innerHTML = '<option value="">請選擇客戶</option>';
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.companyName;
            clientSelect.appendChild(option);
        });
    },

    // 搜尋專案
    searchProjects: function() {
        const searchTerm = document.getElementById('projectSearch').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const rows = document.querySelectorAll('#projectsTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const status = row.getAttribute('data-status');
            
            const matchesSearch = text.includes(searchTerm);
            const matchesStatus = !statusFilter || status === statusFilter;
            
            if (matchesSearch && matchesStatus) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // 篩選專案
    filterProjects: function() {
        this.searchProjects();
    },

    // 新增專案 - 下一步
    nextStep: function() {
        if (this.validateCurrentStep()) {
            this.saveStepData();
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateStepIndicators();
            this.updateButtons();
        }
    },

    // 新增專案 - 上一步
    prevStep: function() {
        this.currentStep--;
        this.showStep(this.currentStep);
        this.updateStepIndicators();
        this.updateButtons();
    },

    // 驗證當前步驟
    validateCurrentStep: function() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        const form = currentStepElement.querySelector('form');
        
        if (form) {
            return Common.validateForm(`#step${this.currentStep} form`);
        }
        
        return true;
    },

    // 儲存步驟資料
    saveStepData: function() {
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        const form = currentStepElement.querySelector('form');
        
        if (form) {
            const formData = new FormData(form);
            formData.forEach((value, key) => {
                this.projectFormData[key] = value;
            });
        }
    },

    // 顯示指定步驟
    showStep: function(stepNumber) {
        // 隱藏所有步驟
        document.querySelectorAll('.step-content').forEach(step => {
            step.style.display = 'none';
        });
        
        // 顯示指定步驟
        document.getElementById(`step${stepNumber}`).style.display = 'block';
        
        // 特殊處理
        if (stepNumber === 2) {
            // 先生成監測點位，讓選擇監測類型的變更也會觸發重新生成
            this.generateMonitoringPoints();
        } else if (stepNumber === 4) {
            this.generateProjectSummary();
        }
    },

    // 更新步驟指示器
    updateStepIndicators: function() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });
    },

    // 更新按鈕狀態
    updateButtons: function() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const createBtn = document.getElementById('createBtn');
        
        prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = this.currentStep < 4 ? 'inline-block' : 'none';
        createBtn.style.display = this.currentStep === 4 ? 'inline-block' : 'none';
    },

    // 生成監測點位
    generateMonitoringPoints: function() {
        const pointsCount = parseInt(document.getElementById('monitoringPoints').value) || 1;
        const container = document.getElementById('monitoringPointsList');
        const monitoringType = document.getElementById('monitoringType').value;
        
        // 從 DataManager 取得監測項目資料
        const allMonitoringItems = DataManager.getFromLocal('monitoringItems') || {};
        const availableItems = allMonitoringItems[monitoringType] || [];
        
        container.innerHTML = '';
        
        for (let i = 1; i <= pointsCount; i++) {
            const pointDiv = document.createElement('div');
            pointDiv.className = 'sampling-form';
            pointDiv.innerHTML = `
                <h4>監測點位 ${i}</h4>
                <div class="grid-2col">
                    <div class="form-group">
                        <label>點位名稱</label>
                        <input type="text" name="point${i}_name" placeholder="例：A棟1F大廳" required>
                    </div>
                    <div class="form-group">
                        <label>點位類型</label>
                        <select name="point${i}_type">
                            <option>室內點位</option>
                            <option>室外點位</option>
                            <option>排放口</option>
                            <option>背景點位</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>點位描述</label>
                    <input type="text" name="point${i}_description" placeholder="詳細位置描述">
                </div>
                <div class="form-group">
                    <label>監測項目</label>
                    <div class="monitoring-items-grid" id="point${i}_items">
                        ${availableItems.map(item => `
                            <label style="display: block; margin: 5px 0;">
                                <input type="checkbox" name="point${i}_items" value="${item}" checked> ${item}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
            container.appendChild(pointDiv);
        }
    },

    // 生成專案摘要
    generateProjectSummary: function() {
        const container = document.getElementById('projectSummary');
        const clientSelect = document.querySelector('select[name="clientId"]');
        const selectedClientId = clientSelect.value;
        const clientName = selectedClientId ? this.getClientName(selectedClientId) : '未選擇';
        
        // 計算總監測項目數量
        const totalItems = this.calculateTotalMonitoringItems();
        
        container.innerHTML = `
            <div class="grid-2col">
                <div>
                    <h4>基本資訊</h4>
                    <p><strong>客戶：</strong>${clientName}</p>
                    <p><strong>專案名稱：</strong>${this.projectFormData.projectName || ''}</p>
                    <p><strong>監測日期：</strong>${this.projectFormData.monitoringDate || ''}</p>
                    <p><strong>監測天數：</strong>${this.projectFormData.monitoringDays || ''} 天</p>
                </div>
                <div>
                    <h4>監測規劃</h4>
                    <p><strong>監測類型：</strong>${document.getElementById('monitoringType').value}</p>
                    <p><strong>監測點位：</strong>${document.getElementById('monitoringPoints').value} 個</p>
                    <p><strong>總監測項目：</strong>${totalItems} 項</p>
                </div>
            </div>
            <div class="form-group" style="margin-top: 20px;">
                <h4>預計費用估算</h4>
                <p>基本監測費用：NT$ 50,000</p>
                <p>額外項目費用：NT$ 15,000</p>
                <p style="font-weight: bold; font-size: 18px;">總計：NT$ 65,000</p>
            </div>
        `;
    },

    // 計算總監測項目數量
    calculateTotalMonitoringItems: function() {
        const pointsCount = parseInt(document.getElementById('monitoringPoints').value) || 1;
        let totalItems = 0;
        
        for (let i = 1; i <= pointsCount; i++) {
            const checkedItems = document.querySelectorAll(`input[name="point${i}_items"]:checked`);
            totalItems += checkedItems.length;
        }
        
        return totalItems;
    },

    // 建立或更新專案
    createProject: function() {
        if (!this.validateCurrentStep()) {
            Common.showNotification('請確認所有資訊正確', 'error');
            return;
        }
        
        // 判斷是新增還是編輯模式
        const isEditMode = !!this.editingProjectId;
        const projectId = isEditMode ? this.editingProjectId : DataInit.generateProjectId();
        
        // 收集採樣點位資料
        const samplingPoints = this.collectSamplingPoints();
        
        // 建立專案資料
        const projectData = {
            id: projectId,
            ...this.projectFormData,
            status: isEditMode ? this.getExistingStatus() : '報價中',
            progress: isEditMode ? this.getExistingProgress() : '專案建立',
            createdDate: isEditMode ? this.getExistingCreatedDate() : new Date().toISOString(),
            monitoringType: document.getElementById('monitoringType').value,
            monitoringPoints: parseInt(document.getElementById('monitoringPoints').value),
            samplingPoints: samplingPoints
        };
        
        // 使用 DataManager 儲存或更新專案
        let success = false;
        if (isEditMode) {
            success = DataManager.updateProject(projectId, projectData);
            if (success) {
                Common.showNotification('專案更新成功！', 'success');
                // 重新載入表格
                this.loadProjectsTable();
            } else {
                Common.showNotification('專案更新失敗', 'error');
                return;
            }
        } else {
            success = DataManager.addProject(projectData);
            if (success) {
                this.addProjectToTable(projectData);
                Common.showNotification('專案建立成功！', 'success');
            } else {
                Common.showNotification('專案建立失敗', 'error');
                return;
            }
        }
        
        // 清理編輯模式標記
        this.editingProjectId = null;
        
        Common.closeModal();
        this.resetForm();
    },

    // 收集採樣點位資料
    collectSamplingPoints: function() {
        const samplingPoints = [];
        const pointsCount = parseInt(document.getElementById('monitoringPoints').value) || 1;
        
        for (let i = 1; i <= pointsCount; i++) {
            const name = document.querySelector(`input[name="point${i}_name"]`)?.value || '';
            const type = document.querySelector(`select[name="point${i}_type"]`)?.value || '';
            const description = document.querySelector(`input[name="point${i}_description"]`)?.value || '';
            const items = Array.from(document.querySelectorAll(`input[name="point${i}_items"]:checked`)).map(cb => cb.value);
            
            if (name) {
                samplingPoints.push({
                    id: `P${i.toString().padStart(3, '0')}`,
                    name: name,
                    type: type,
                    description: description,
                    items: items
                });
            }
        }
        
        return samplingPoints;
    },

    // 取得現有專案狀態（編輯模式用）
    getExistingStatus: function() {
        const existingProject = DataManager.getProjectById(this.editingProjectId);
        return existingProject ? existingProject.status : '報價中';
    },
    
    // 取得現有專案進度（編輯模式用）
    getExistingProgress: function() {
        const existingProject = DataManager.getProjectById(this.editingProjectId);
        return existingProject ? existingProject.progress : '專案建立';
    },
    
    // 取得現有專案建立日期（編輯模式用）
    getExistingCreatedDate: function() {
        const existingProject = DataManager.getProjectById(this.editingProjectId);
        return existingProject ? existingProject.createdDate : new Date().toISOString();
    },

    // 重設表單
    resetForm: function() {
        this.currentStep = 1;
        this.projectFormData = {};
        this.editingProjectId = null; // 清除編輯模式標記
        this.showStep(1);
        this.updateStepIndicators();
        this.updateButtons();
        
        // 清空所有表單
        document.querySelectorAll('#newProjectModal form').forEach(form => {
            form.reset();
        });
        
        // 重設監測項目為預設值
        this.updateMonitoringItems();
        this.generateMonitoringPoints();
    },

    // 新增專案到表格
    addProjectToTable: function(projectData) {
        const tbody = document.querySelector('#projectsTable tbody');
        const row = document.createElement('tr');
        row.setAttribute('data-status', projectData.status);
        
        row.innerHTML = `
            <td>${projectData.id}</td>
            <td>${this.getClientName(projectData.clientId)}</td>
            <td>${projectData.projectName}</td>
            <td>${Common.formatDate(projectData.monitoringDate)}</td>
            <td><span class="status-badge">${projectData.status}</span></td>
            <td>${projectData.progress}</td>
            <td>
                <button class="btn" onclick="Projects.showProjectDetail('${projectData.id}')">管理</button>
                <button class="btn" onclick="Projects.showProjectPlan('${projectData.id}')">計畫書</button>
            </td>
        `;
        
        tbody.appendChild(row);
    },

    // 取得客戶名稱
    getClientName: function(clientId) {
        const client = DataManager.getClientById(clientId);
        if (client) {
            // 簡化顯示名稱
            const companyName = client.companyName;
            return companyName;
        }
        return '未知客戶';
    },

    // 顯示專案詳細資訊
    showProjectDetail: function(projectId) {
        this.currentProjectId = projectId;
        
        // 從 DataManager 取得專案資料
        const projectData = DataManager.getProjectById(projectId);
        
        if (projectData) {
            // 取得客戶資料
            const clientData = DataManager.getClientById(projectData.clientId);
            const clientName = clientData ? clientData.companyName : '未知客戶';
            
            // 填入專案資訊
            document.getElementById('projectDetailTitle').textContent = `專案管理 - ${projectId} ${this.getClientName(projectData.clientId)}`;
            
            // 檢查並設定專案資訊欄位
            const detailFields = {
                'detailProjectId': projectData.id,
                'detailClientName': clientName,
                'detailProjectName': projectData.projectName,
                'detailLocation': projectData.facilityAddress,
                'detailDescription': projectData.projectDescription || '-',
                'detailMonitoringDate': Common.formatDate(projectData.monitoringDate),
                'detailMonitoringDays': projectData.monitoringDays + ' 天',
                'detailMonitoringType': projectData.monitoringType,
                'detailMonitoringPoints': projectData.monitoringPoints + ' 個點位',
                'detailProjectStatus': projectData.status,
                'detailProgress': projectData.progress
            };
            
            // 填入欄位資料
            Object.keys(detailFields).forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element) {
                    element.textContent = detailFields[fieldId];
                }
            });
            
            // 載入監測項目
            this.loadProjectItems(projectId);
            
            document.getElementById('projectDetailModal').classList.add('active');
        } else {
            Common.showNotification('找不到專案資料', 'error');
        }
    },

    // 顯示專案計畫書管理頁面
    showProjectPlan: function(projectId) {
        // 先顯示專案詳細資訊
        this.showProjectDetail(projectId);
        
        // 等待模態框完全載入後切換到計畫書標籤
        setTimeout(() => {
            // 移除所有標籤的 active 狀態
            const tabs = document.querySelectorAll('#projectDetailModal .tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // 移除所有標籤內容的 active 狀態
            const tabContents = document.querySelectorAll('#projectDetailModal .tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 啟用計畫書標籤
            const planTab = document.querySelector('#projectDetailModal .tab:nth-child(3)'); // 計畫書是第3個標籤
            if (planTab) {
                planTab.classList.add('active');
            }
            
            // 顯示計畫書內容
            const planContent = document.querySelector('#planDocument');
            if (planContent) {
                planContent.classList.add('active');
            }
        }, 100);
    },

    // 取得專案資料 (使用 DataManager)
    getProjectData: function(projectId) {
        return DataManager.getProjectById(projectId);
    },

    // 載入專案監測項目
    loadProjectItems: function(projectId) {
        const tbody = document.querySelector('#projectItemsTable tbody');
        const projectData = DataManager.getProjectById(projectId);
        
        if (!projectData || !projectData.samplingPoints) {
            tbody.innerHTML = '<tr><td colspan="4">無監測點位資料</td></tr>';
            return;
        }
        
        // 從 samplingPoints 載入點位資料
        const items = projectData.samplingPoints.map(point => ({
            point: point.name,
            itemCount: point.items.length,
            samplingStatus: this.getSamplingStatus(projectData.status),
            labStatus: this.getLabStatus(projectData.status)
        }));
        
        tbody.innerHTML = items.map(item => `
            <tr>
                <td>${item.point}</td>
                <td>${item.itemCount}</td>
                <td><span class="status-badge">${item.samplingStatus}</span></td>
                <td><span class="status-badge">${item.labStatus}</span></td>
            </tr>
        `).join('');
    },
    
    // 取得採樣狀態
    getSamplingStatus: function(projectStatus) {
        const statusMap = {
            '報價中': '未開始',
            '執行中': '進行中',
            '已完成': '已完成'
        };
        return statusMap[projectStatus] || '未開始';
    },
    
    // 取得實驗室狀態
    getLabStatus: function(projectStatus) {
        const statusMap = {
            '報價中': '未送檢',
            '執行中': '未送檢',
            '已完成': '已完成'
        };
        return statusMap[projectStatus] || '未送檢';
    },

    // 產生文件
    generateDocument: async function(projectId, docType) {
        const docTypes = {
            'plan': '計畫書',
            'quote': '報價單',
            'report': '監測報告'
        };
        
        try {
            Common.showNotification(`正在產生${docTypes[docType]}...`, 'info');
            
            // 取得專案和客戶資料
            const projectData = DataManager.getProjectById(projectId);
            if (!projectData) {
                throw new Error('找不到專案資料');
            }
            
            const clientData = DataManager.getClientById(projectData.clientId);
            if (!clientData) {
                throw new Error('找不到客戶資料');
            }
            
            // 載入預設範本資料
            const defaultDataResponse = await fetch('docx-template-default-data.json');
            const defaultData = await defaultDataResponse.json();
            
            // 建立變數物件，攤平預設資料結構
            const variables = this.buildTemplateVariables(projectData, clientData, defaultData.defaultVariables);
            
            // 建立檔案名稱
            const reportName = this.generateReportFilename(projectData, clientData, docType);
            
            // 初始化 Word 產生器
            const generator = new WordTemplateGenerator();
            
            // 根據文件類型選擇樣板
            const templateMap = {
                'plan': 'my_template2.docx',
                'quote': 'my_template2.docx',
                'report': 'my_template2.docx'
            };
            
            const templateName = templateMap[docType] || 'my_template2.docx';
            
            // 載入樣板並產生文件
            await generator.loadTemplate(templateName);
            await generator.generateAndDownload(variables, reportName);
            
            Common.showNotification(`${docTypes[docType]}產生完成！`, 'success');
            
        } catch (error) {
            console.error('產生文件失敗:', error);
            Common.showNotification(`產生${docTypes[docType]}失敗: ${error.message}`, 'error');
        }
    },

    // 預覽文件
    previewDocument: async function(projectId, docType) {
        const docTypes = {
            'plan': '計畫書',
            'quote': '報價單',
            'report': '監測報告'
        };
        
        try {
            Common.showNotification(`正在準備${docTypes[docType]}預覽...`, 'info');
            
            // 取得專案和客戶資料
            const projectData = DataManager.getProjectById(projectId);
            if (!projectData) {
                throw new Error('找不到專案資料');
            }
            
            const clientData = DataManager.getClientById(projectData.clientId);
            if (!clientData) {
                throw new Error('找不到客戶資料');
            }
            
            // 載入預設範本資料
            const defaultDataResponse = await fetch('docx-template-default-data.json');
            const defaultData = await defaultDataResponse.json();
            
            // 建立變數物件，攤平預設資料結構
            const variables = this.buildTemplateVariables(projectData, clientData, defaultData.defaultVariables);
            
            // 初始化 Word 產生器
            const generator = new WordTemplateGenerator();
            
            // 根據文件類型選擇樣板
            const templateMap = {
                'plan': 'my_template2.docx',
                'quote': 'my_template2.docx',
                'report': 'my_template2.docx'
            };
            
            const templateName = templateMap[docType] || 'my_template2.docx';
            
            // 載入樣板並產生文件 Blob
            await generator.loadTemplate(templateName);
            const documentBlob = await generator.generateDocumentBlob(variables);
            
            // 顯示預覽模態框
            Common.showModal('documentPreview');
            
            // 設定預覽標題
            const title = `${docTypes[docType]}預覽 - ${projectData.projectName}`;
            document.getElementById('documentPreviewTitle').textContent = title;
            
            // 預覽文件
            await WordPreviewLib.previewDocument(documentBlob, 'documentPreviewContainer');
            
            Common.showNotification(`${docTypes[docType]}預覽載入完成！`, 'success');
            return { success: true, blob: documentBlob };
            
        } catch (error) {
            console.error(`預覽${docTypes[docType]}失敗:`, error);
            Common.showNotification(`預覽${docTypes[docType]}失敗: ${error.message}`, 'error');
            throw error;
        }
    },

    // 建立範本變數
    buildTemplateVariables: function(projectData, clientData, defaultVariables) {
        // 攤平預設資料結構
        const variables = {};
        
        // 合併基本變數
        if (defaultVariables.basicVariables) {
            Object.assign(variables, defaultVariables.basicVariables);
        }
        
        // 合併陣列變數
        if (defaultVariables.arrayVariables) {
            Object.assign(variables, defaultVariables.arrayVariables);
        }
        
        // 合併物件陣列變數
        if (defaultVariables.objectArrayVariables) {
            Object.assign(variables, defaultVariables.objectArrayVariables);
        }
        
        // 使用實際專案和客戶資料取代預設值
        variables.CustomName1 = clientData.companyName;
        variables.CustomName2 = projectData.projectName;
        variables.CompanyName = '友喬檢驗有限公司';
        variables.ReportingYear = new Date().getFullYear() + '年度';
        variables.CreateDate = Common.formatDate(new Date());
        variables.CreateBy = '友喬檢驗有限公司 by Rex';
        
        // 更新基本資料表格
        if (variables.BasicDataTable && Array.isArray(variables.BasicDataTable)) {
            variables.BasicDataTable = [
                {
                    Name: clientData.companyName + ' ' + projectData.projectName,
                    Address: projectData.facilityAddress || clientData.address,
                    EmpCounts: this.generateRandomEmpCount()
                }
            ];
        }
        
        // 更新監測時程表
        if (variables.MonitoringScheduleTable && Array.isArray(variables.MonitoringScheduleTable)) {
            variables.MonitoringScheduleTable = this.buildMonitoringSchedule(projectData);
        }
        
        // 新增專案相關變數
        variables.ProjectId = projectData.id;
        variables.ProjectName = projectData.projectName;
        variables.ClientName = clientData.companyName;
        variables.ContactPerson = clientData.contactName;
        variables.ContactPhone = clientData.phone;
        variables.ContactEmail = clientData.email;
        variables.FacilityAddress = projectData.facilityAddress;
        variables.MonitoringDate = Common.formatDate(projectData.monitoringDate);
        variables.MonitoringDays = projectData.monitoringDays;
        variables.MonitoringType = projectData.monitoringType;
        variables.MonitoringPoints = projectData.monitoringPoints;
        variables.ProjectDescription = projectData.projectDescription || '';
        
        // 監測項目清單
        if (projectData.samplingPoints && Array.isArray(projectData.samplingPoints)) {
            variables.MonitoringItemsList = this.extractMonitoringItems(projectData.samplingPoints);
        } else {
            variables.MonitoringItemsList = [];
        }
        
        return variables;
    },

    // 產生隨機員工數量
    generateRandomEmpCount: function() {
        return Math.floor(Math.random() * (500 - 100 + 1)) + 100;
    },

    // 建立監測時程表
    buildMonitoringSchedule: function(projectData) {
        const baseDate = new Date(projectData.monitoringDate);
        const schedule = [];
        
        // 規劃階段
        const planDate = new Date(baseDate);
        planDate.setDate(planDate.getDate() - 14);
        schedule.push({
            JobName: `${projectData.projectName} 監測規劃`,
            JobDate: this.formatDateToChinese(planDate),
            JobMemo: '確認現場狀況及需求，並擬定本次採樣點、廠商聯繫'
        });
        
        // 執行階段
        schedule.push({
            JobName: '執行環境監測',
            JobDate: this.formatDateToChinese(baseDate),
            JobMemo: '依擬定規劃執行採樣'
        });
        
        // 報告階段
        const reportDate = new Date(baseDate);
        reportDate.setDate(reportDate.getDate() + parseInt(projectData.monitoringDays) + 7);
        schedule.push({
            JobName: `${projectData.projectName} 監測報告`,
            JobDate: this.formatDateToChinese(reportDate),
            JobMemo: '確認監測報告無誤，並依據計畫書內容做後續處理'
        });
        
        return schedule;
    },

    // 提取監測項目清單
    extractMonitoringItems: function(samplingPoints) {
        const items = [];
        samplingPoints.forEach(point => {
            if (point.items && Array.isArray(point.items)) {
                point.items.forEach(item => {
                    if (!items.includes(item)) {
                        items.push(item);
                    }
                });
            }
        });
        return items;
    },

    // 產生報告檔案名稱
    generateReportFilename: function(projectData, clientData, docType) {
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        
        const typeMap = {
            'plan': '監測計畫書',
            'quote': '報價單',
            'report': '監測報告'
        };
        
        const docTypeName = typeMap[docType] || '文件';
        const clientName = clientData.companyName.replace(/[^\w\u4e00-\u9fff]/g, '_');
        const projectName = projectData.projectName.replace(/[^\w\u4e00-\u9fff]/g, '_');
        
        return `${clientName}_${projectName}_${docTypeName}_${dateStr}.docx`;
    },

    // 格式化日期為中文格式
    formatDateToChinese: function(date) {
        const year = date.getFullYear() - 1911; // 民國年
        const month = date.getMonth() + 1;
        return `${year}.${String(month).padStart(2, '0')}月`;
    },

    // 其他功能方法
    addMonitoringPoint: function() {
        Common.showNotification('新增監測點位功能開發中...', 'info');
    },

    generatePlan: function() {
        Common.showNotification('開始產生計畫書...', 'info');
        
        // 模擬產生過程
        setTimeout(() => {
            Common.showNotification('計畫書產生完成！，可以預覽或下載', 'success');
        }, 1500);
    },

    previewPlan: function() {
        this.previewDocument(this.currentProjectId, 'plan');
    },

    downloadPlan: function() {
        this.generateDocument(this.currentProjectId, 'plan');
    },

    importLabData: function() {
        Common.showNotification('實驗室數據匯入功能開發中...', 'info');
    },

    generateReport: function() {
        this.generateDocument(this.currentProjectId, 'report');
    },

    editProject: function() {
        if (!this.currentProjectId) {
            Common.showNotification('請先選擇要編輯的專案', 'error');
            return;
        }
        
        const projectData = DataManager.getProjectById(this.currentProjectId);
        if (!projectData) {
            Common.showNotification('找不到專案資料', 'error');
            return;
        }
        
        // 關閉詳細資訊模態框
        Common.closeModal();
        
        // 開啟新增專案模態框並填入現有資料
        Common.showModal('newProject');
        
        // 等待模態框開啟後填入資料
        setTimeout(() => {
            this.loadProjectDataForEdit(projectData);
        }, 100);
    },
    
    // 載入專案資料供編輯
    loadProjectDataForEdit: function(projectData) {
        // 填入基本資料
        const form = document.getElementById('projectBasicForm');
        if (form) {
            form.querySelector('[name="clientId"]').value = projectData.clientId;
            form.querySelector('[name="projectName"]').value = projectData.projectName;
            form.querySelector('[name="monitoringDate"]').value = projectData.monitoringDate;
            form.querySelector('[name="monitoringDays"]').value = projectData.monitoringDays;
            form.querySelector('[name="facilityAddress"]').value = projectData.facilityAddress;
            form.querySelector('[name="projectDescription"]').value = projectData.projectDescription || '';
        }
        
        // 填入監測規劃
        const monitoringTypeSelect = document.getElementById('monitoringType');
        if (monitoringTypeSelect) {
            monitoringTypeSelect.value = projectData.monitoringType;
        }
        
        const monitoringPointsInput = document.getElementById('monitoringPoints');
        if (monitoringPointsInput) {
            monitoringPointsInput.value = projectData.monitoringPoints;
        }
        
        // 載入採樣點位資料
        if (projectData.samplingPoints) {
            setTimeout(() => {
                this.loadSamplingPointsForEdit(projectData.samplingPoints);
            }, 200);
        }
        
        // 儲存現有專案ID用於更新
        this.editingProjectId = projectData.id;
        
        // 儲存到 projectFormData
        this.projectFormData = {
            clientId: projectData.clientId,
            projectName: projectData.projectName,
            monitoringDate: projectData.monitoringDate,
            monitoringDays: projectData.monitoringDays,
            facilityAddress: projectData.facilityAddress,
            projectDescription: projectData.projectDescription || ''
        };
        
        Common.showNotification('專案資料已載入，可進行編輯', 'info');
    },

    // 載入採樣點位資料供編輯
    loadSamplingPointsForEdit: function(samplingPoints) {
        // 先生成監測點位表單
        this.generateMonitoringPoints();
        
        // 然後填入已有的資料
        setTimeout(() => {
            samplingPoints.forEach((point, index) => {
                const i = index + 1;
                const nameInput = document.querySelector(`input[name="point${i}_name"]`);
                const typeSelect = document.querySelector(`select[name="point${i}_type"]`);
                const descInput = document.querySelector(`input[name="point${i}_description"]`);
                
                if (nameInput) nameInput.value = point.name;
                if (typeSelect) typeSelect.value = point.type;
                if (descInput) descInput.value = point.description;
                
                // 勾選監測項目
                point.items.forEach(item => {
                    const checkbox = document.querySelector(`input[name="point${i}_items"][value="${item}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            });
        }, 100);
    },

    // 取得當前專案資料 (供友喬 Word 工具使用)
    getCurrentProjectData: function() {
        if (!this.currentProjectId) {
            return null;
        }
        
        const projectData = DataManager.getProjectById(this.currentProjectId);
        const clientData = projectData ? DataManager.getClientById(projectData.clientId) : null;
        
        if (!projectData || !clientData) {
            return null;
        }
        
        return {
            // 專案基本資訊
            id: projectData.id,
            projectName: projectData.projectName,
            projectType: projectData.monitoringType,
            status: projectData.status,
            startDate: projectData.monitoringDate,
            monitoringDate: projectData.monitoringDate,
            monitoringDays: projectData.monitoringDays,
            facilityAddress: projectData.facilityAddress,
            
            // 客戶資訊
            clientName: clientData.companyName,
            clientContact: clientData.contactName,
            clientPhone: clientData.phone,
            clientEmail: clientData.email,
            clientAddress: clientData.address,
            
            // 監測相關
            monitoringItems: this.extractMonitoringItems(projectData.samplingPoints || []),
            samplingData: projectData.samplingPoints || [],
            schedule: this.buildMonitoringSchedule(projectData),
            
            // 描述和備註
            projectDescription: projectData.projectDescription || '',
            notes: `監測類型: ${projectData.monitoringType}, 監測點位: ${projectData.monitoringPoints}個`
        };
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待資料初始化完成後再載入專案
    setTimeout(() => {
        Projects.init();
    }, 100);
});

// 暴露給全域使用
window.Projects = Projects;