// 客戶管理專用JavaScript

const Clients = {
    currentClientId: null,
    
    // 初始化客戶頁面
    init: function() {
        this.loadClientsTable();
    },

    // 載入客戶表格
    loadClientsTable: function() {
        const tbody = document.querySelector('#clientsTable tbody');
        const clients = DataManager.getClients();
        
        tbody.innerHTML = '';
        
        clients.forEach(client => {
            this.addClientToTable(client);
        });
    },

    // 搜尋客戶
    searchClients: function() {
        const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
        const rows = document.querySelectorAll('#clientsTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // 儲存客戶
    saveClient: function() {
        const form = document.getElementById('clientForm');
        const formData = new FormData(form);
        
        if (!Common.validateForm('#clientForm')) {
            Common.showNotification('請填寫所有必填欄位', 'error');
            return;
        }

        // 驗證統編格式
        const taxId = formData.get('taxId');
        if (!/^[0-9]{8}$/.test(taxId)) {
            Common.showNotification('統一編號格式不正確', 'error');
            return;
        }

        // 檢查統編是否重複
        const existingClients = DataManager.getClients();
        const duplicateTaxId = existingClients.find(client => client.taxId === taxId);
        if (duplicateTaxId) {
            Common.showNotification('統一編號已存在', 'error');
            return;
        }

        // 建立客戶資料
        const clientData = {
            id: DataInit.generateClientId(),
            companyName: formData.get('companyName'),
            taxId: formData.get('taxId'),
            contactName: formData.get('contactName'),
            contactTitle: formData.get('contactTitle') || '',
            phone: formData.get('phone'),
            email: formData.get('email') || '',
            address: formData.get('address'),
            projectCount: 0,
            createdDate: new Date().toISOString(),
            status: '活躍'
        };

        // 儲存客戶
        if (DataManager.addClient(clientData)) {
            this.addClientToTable(clientData);
            Common.showNotification('客戶新增成功！', 'success');
            Common.closeModal();
            form.reset();
        } else {
            Common.showNotification('客戶新增失敗', 'error');
        }
    },

    // 新增客戶到表格
    addClientToTable: function(clientData) {
        const tbody = document.querySelector('#clientsTable tbody');
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${clientData.id}</td>
            <td>${clientData.companyName}</td>
            <td>${clientData.taxId}</td>
            <td>${clientData.contactName}</td>
            <td>${clientData.phone}</td>
            <td>${clientData.projectCount}</td>
            <td>
                <button class="btn" onclick="Clients.showClientDetail('${clientData.id}')">檢視</button>
                <button class="btn" onclick="Clients.editClient('${clientData.id}')">編輯</button>
            </td>
        `;
        
        tbody.appendChild(row);
    },

    // 顯示客戶詳細資訊
    showClientDetail: function(clientId) {
        this.currentClientId = clientId;
        
        const clientData = DataManager.getClientById(clientId);
        
        if (clientData) {
            // 填入基本資料
            document.getElementById('clientDetailTitle').textContent = clientData.companyName + ' - 客戶詳細資訊';
            document.getElementById('detailClientId').textContent = clientData.id;
            document.getElementById('detailCompanyName').textContent = clientData.companyName;
            document.getElementById('detailTaxId').textContent = clientData.taxId;
            document.getElementById('detailContactName').textContent = clientData.contactName;
            document.getElementById('detailContactTitle').textContent = clientData.contactTitle || '-';
            document.getElementById('detailPhone').textContent = clientData.phone;
            document.getElementById('detailEmail').textContent = clientData.email || '-';
            document.getElementById('detailAddress').textContent = clientData.address;
            
            // 載入專案記錄
            this.loadClientProjects(clientId);
            
            // 載入歷史紀錄
            this.loadClientHistory(clientId);
            
            document.getElementById('clientDetailModal').classList.add('active');
        }
    },

    // 載入客戶專案
    loadClientProjects: function(clientId) {
        const tbody = document.getElementById('clientProjectsTable');
        const clientProjects = DataManager.getProjectsByClientId(clientId);
        
        tbody.innerHTML = clientProjects.map(project => `
            <tr>
                <td>${project.id}</td>
                <td>${project.projectName}</td>
                <td>${Common.formatDate(project.monitoringDate)}</td>
                <td><span class="status-badge">${project.status}</span></td>
                <td><button class="btn" onclick="PageNavigation.navigateTo('projects')">檢視</button></td>
            </tr>
        `).join('');
    },

    // 載入客戶歷史紀錄
    loadClientHistory: function(clientId) {
        const list = document.getElementById('clientHistoryList');
        const clientProjects = DataManager.getProjectsByClientId(clientId);
        const client = DataManager.getClientById(clientId);
        
        let history = [];
        
        // 從專案建立歷史紀錄
        clientProjects.forEach(project => {
            history.push({
                date: project.createdDate,
                event: `新增專案：${project.projectName}`
            });
            
            if (project.status === '已完成') {
                history.push({
                    date: project.monitoringDate,
                    event: `完成專案：${project.projectName}`
                });
            }
        });
        
        // 客戶建立紀錄
        history.push({
            date: client.createdDate,
            event: '建立客戶資料'
        });
        
        // 按日期排序（最新的在前）
        history.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        list.innerHTML = history.map(item => 
            `<li style="padding: 5px 0;">${Common.formatDate(item.date)} - ${item.event}</li>`
        ).join('');
    },

    // 編輯客戶
    editClient: function(clientId) {
        Common.showNotification('編輯功能開發中...', 'info');
    },

    // 編輯當前客戶
    editCurrentClient: function() {
        if (this.currentClientId) {
            this.editClient(this.currentClientId);
        }
    },

    // 重新整理客戶專案數量
    refreshProjectCounts: function() {
        const clients = DataManager.getClients();
        clients.forEach(client => {
            DataManager.updateClientProjectCount(client.id);
        });
        this.loadClientsTable();
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    Clients.init();
});

// 暴露給全域使用
window.Clients = Clients;