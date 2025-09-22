// 友喬環境監測系統 - 共用JavaScript函式庫

// 共用功能函式
const Common = {
    // 顯示模態框
    showModal: function(modalType) {
        const modals = {
            'newProject': 'newProjectModal',
            'newClient': 'newClientModal',
            'addChemical': 'addChemicalModal',
            'projectDetail': 'projectDetailModal',
            'quickReport': 'quickReportModal'
        };
        
        const modalId = modals[modalType];
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        }
    },

    // 關閉模態框
    closeModal: function() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.remove('active'));
    },

    // 切換標籤頁 (一般標籤頁)
    switchTab: function(event, tabName, containerSelector = null) {
        const container = containerSelector ? document.querySelector(containerSelector) : document;
        
        // 隱藏所有標籤內容
        const tabContents = container.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        
        // 顯示選中的標籤內容
        if (tabName) {
            const targetTab = container.querySelector('#' + tabName);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        }
        
        // 更新標籤樣式
        if (event) {
            const tabs = container.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
        }
    },

    // 搜尋功能
    searchTable: function(searchInputId, tableId) {
        const searchTerm = document.getElementById(searchInputId).value.toLowerCase();
        const table = document.getElementById(tableId);
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // 表單驗證
    validateForm: function(formSelector) {
        const form = document.querySelector(formSelector);
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ff0000';
                isValid = false;
            } else {
                field.style.borderColor = '#ccc';
            }
        });
        
        return isValid;
    },

    // 顯示通知訊息
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border: 1px solid #333;
            background: white;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // 格式化日期
    formatDate: function(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    },

    // 確認對話框
    confirm: function(message, callback) {
        if (window.confirm(message)) {
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    },

    // 載入狀態管理
    setLoading: function(element, isLoading) {
        if (isLoading) {
            element.disabled = true;
            element.textContent = '載入中...';
        } else {
            element.disabled = false;
            element.textContent = element.getAttribute('data-original-text') || '確認';
        }
    }
};

// 頁面導航功能 (重新命名以避免與 navigation.js 衝突)
const PageNavigation = {
    // 當前頁面名稱
    currentPage: '',

    // 初始化導航
    init: function() {
        this.currentPage = this.getCurrentPageName();
        this.updateActiveNav();
    },

    // 取得當前頁面名稱
    getCurrentPageName: function() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        if (fileName === 'index.html' || fileName === '') return 'dashboard';
        if (fileName === 'clients.html') return 'clients';
        if (fileName === 'projects.html') return 'projects';
        if (fileName === 'sampling.html') return 'sampling';
        if (fileName === 'database.html') return 'database';
        if (fileName === 'reports.html') return 'reports';
        
        return 'dashboard';
    },

    // 更新導航狀態
    updateActiveNav: function() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href && href.includes(this.currentPage)) {
                item.classList.add('active');
            }
        });
    },

    // 導航到指定頁面
    navigateTo: function(page) {
        const pages = {
            'dashboard': 'index.html',
            'clients': 'clients.html',
            'projects': 'projects.html',
            'sampling': 'sampling.html',
            'database': 'database.html',
            'reports': 'reports.html'
        };
        
        if (pages[page]) {
            window.location.href = pages[page];
        }
    }
};

// 資料管理
const DataManager = {
    // 本地儲存
    saveToLocal: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('儲存資料失敗:', e);
            return false;
        }
    },

    // 從本地讀取
    getFromLocal: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('讀取資料失敗:', e);
            return null;
        }
    },

    // 刪除本地資料
    removeFromLocal: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('刪除資料失敗:', e);
            return false;
        }
    },

    // 取得客戶資料
    getClients: function() {
        return this.getFromLocal('clients') || [];
    },

    // 取得專案資料
    getProjects: function() {
        return this.getFromLocal('projects') || [];
    },

    // 根據ID取得客戶
    getClientById: function(clientId) {
        const clients = this.getClients();
        return clients.find(client => client.id === clientId);
    },

    // 根據ID取得專案
    getProjectById: function(projectId) {
        const projects = this.getProjects();
        return projects.find(project => project.id === projectId);
    },

    // 取得客戶的專案
    getProjectsByClientId: function(clientId) {
        const projects = this.getProjects();
        return projects.filter(project => project.clientId === clientId);
    },

    // 新增客戶
    addClient: function(clientData) {
        const clients = this.getClients();
        clients.push(clientData);
        this.saveToLocal('clients', clients);
        return true;
    },

    // 新增專案
    addProject: function(projectData) {
        const projects = this.getProjects();
        projects.push(projectData);
        this.saveToLocal('projects', projects);
        
        // 更新客戶專案數量
        this.updateClientProjectCount(projectData.clientId);
        return true;
    },

    // 更新客戶專案數量
    updateClientProjectCount: function(clientId) {
        const clients = this.getClients();
        const projects = this.getProjectsByClientId(clientId);
        
        const clientIndex = clients.findIndex(client => client.id === clientId);
        if (clientIndex !== -1) {
            clients[clientIndex].projectCount = projects.length;
            this.saveToLocal('clients', clients);
        }
    },

    // 更新客戶資料
    updateClient: function(clientId, updatedData) {
        const clients = this.getClients();
        const clientIndex = clients.findIndex(client => client.id === clientId);
        
        if (clientIndex !== -1) {
            clients[clientIndex] = { ...clients[clientIndex], ...updatedData };
            this.saveToLocal('clients', clients);
            return true;
        }
        return false;
    },

    // 更新專案資料
    updateProject: function(projectId, updatedData) {
        const projects = this.getProjects();
        const projectIndex = projects.findIndex(project => project.id === projectId);
        
        if (projectIndex !== -1) {
            projects[projectIndex] = { ...projects[projectIndex], ...updatedData };
            this.saveToLocal('projects', projects);
            return true;
        }
        return false;
    }
};

// 全域事件處理
document.addEventListener('DOMContentLoaded', function() {
    // 初始化資料（如果還沒初始化）
    if (!DataManager.getFromLocal('dataInitialized')) {
        // 確保 DataInit 已載入
        if (window.DataInit) {
            DataInit.initializeData();
        }
    }

    // 初始化導航
    PageNavigation.init();

    // 模態框點擊外部關閉
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            Common.closeModal();
        }
    });

    // ESC 鍵關閉模態框
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            Common.closeModal();
        }
    });
});

// 暴露全域變數
window.Common = Common;
window.PageNavigation = PageNavigation;
window.DataManager = DataManager;