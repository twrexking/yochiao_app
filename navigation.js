// navigation.js - 統一的導航管理系統
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.createNavigationBar();
        this.addNavigationEvents();
        this.updateActiveNavigation();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename.replace('.html', '');
    }

    createNavigationBar() {
        const navigationHTML = `
            <nav class="main-navigation">
                <div class="nav-brand">
                    <h3>友喬環境監測系統</h3>
                </div>
                <div class="nav-links">
                    <a href="index.html" class="nav-link" data-page="index">
                        <i>🏠</i> 首頁
                    </a>
                    <a href="clients.html" class="nav-link" data-page="clients">
                        <i>👥</i> 客戶管理
                    </a>
                    <a href="projects.html" class="nav-link" data-page="projects">
                        <i>📊</i> 專案管理
                    </a>
                    <a href="sampling.html" class="nav-link" data-page="sampling">
                        <i>🧪</i> 現場採樣
                    </a>
                    <a href="database.html" class="nav-link" data-page="database">
                        <i>🗄️</i> 資料庫管理
                    </a>
                    <a href="reports.html" class="nav-link" data-page="reports">
                        <i>📄</i> 報表輸出
                    </a>
                </div>
                <div class="nav-user">
                    <span class="user-info">歡迎，管理員</span>
                     <button class="btn btn-secondary btn-xs" onclick="NavigationManager.clearLocalStorage()">🗑️ 清除資料</button>
                    <button class="btn btn-secondary btn-xs" onclick="NavigationManager.logout()">登出</button>
                </div>
            </nav>
        `;

        // 在頁面頂部插入導航欄
        const body = document.body;
        const navigationContainer = document.createElement('div');
        navigationContainer.innerHTML = navigationHTML;
        body.insertBefore(navigationContainer.firstElementChild, body.firstChild);

        // 添加導航欄樣式
        this.addNavigationStyles();
    }

    addNavigationStyles() {
        const styles = `
            <style>
                .main-navigation {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                }

                .nav-brand h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                .nav-links {
                    display: flex;
                    gap: 1rem;
                }

                .nav-link {
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }

                .nav-link:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white;
                    transform: translateY(-1px);
                }

                .nav-link.active {
                    background-color: rgba(255, 255, 255, 0.2);
                    color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .nav-link i {
                    font-size: 1.1rem;
                }

                .nav-user {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-info {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }

                /* 按鈕樣式 */
                .btn {
                    padding: 0.375rem 0.75rem;
                    margin: 0 0.25rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.2s ease;
                }

                .btn-xs {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                    line-height: 1.2;
                }

                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }

                .btn-secondary:hover {
                    background-color: #545b62;
                    transform: translateY(-1px);
                }

                .btn-outline {
                    background-color: transparent;
                    color: #6c757d;
                    border: 1px solid #6c757d;
                }

                .btn-outline:hover {
                    background-color: #6c757d;
                    color: white;
                    transform: translateY(-1px);
                }

                /* 調整頁面內容的頂部間距 */
                .container, .main-content {
                    margin-top: 0;
                }

                /* 響應式設計 */
                @media (max-width: 768px) {
                    .main-navigation {
                        flex-direction: column;
                        gap: 1rem;
                        padding: 1rem;
                    }

                    .nav-links {
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .nav-link {
                        font-size: 0.9rem;
                        padding: 0.4rem 0.8rem;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    addNavigationEvents() {
        // 為所有導航連結添加點擊事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetPage = link.getAttribute('data-page');
                this.navigateToPage(targetPage, e);
            });
        });
    }

    updateActiveNavigation() {
        // 移除所有活動狀態
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // 為當前頁面添加活動狀態
        const currentNavLink = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (currentNavLink) {
            currentNavLink.classList.add('active');
        }
    }

    navigateToPage(page, event) {
        // 如果已經在目標頁面，則不需要跳轉
        if (page === this.currentPage) {
            event.preventDefault();
            return;
        }

        // 在跳轉前儲存當前頁面狀態
        this.saveCurrentPageState();
        
        // 顯示載入指示器（可選）
        this.showLoadingIndicator();
    }

    saveCurrentPageState() {
        // 儲存當前頁面的表單數據或狀態
        const pageState = {
            timestamp: new Date().toISOString(),
            scrollPosition: window.scrollY,
            formData: this.collectFormData()
        };

        localStorage.setItem(`pageState_${this.currentPage}`, JSON.stringify(pageState));
    }

    collectFormData() {
        const formData = {};
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
            const formDataObj = new FormData(form);
            const formObject = {};
            
            for (let [key, value] of formDataObj.entries()) {
                formObject[key] = value;
            }
            
            formData[`form_${index}`] = formObject;
        });

        return formData;
    }

    restorePageState() {
        const savedState = localStorage.getItem(`pageState_${this.currentPage}`);
        
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // 恢復滾動位置
            if (state.scrollPosition) {
                window.scrollTo(0, state.scrollPosition);
            }
            
            // 恢復表單數據
            this.restoreFormData(state.formData);
        }
    }

    restoreFormData(formData) {
        if (!formData) return;

        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
            const savedFormData = formData[`form_${index}`];
            if (savedFormData) {
                Object.keys(savedFormData).forEach(fieldName => {
                    const field = form.querySelector(`[name="${fieldName}"]`);
                    if (field) {
                        field.value = savedFormData[fieldName];
                    }
                });
            }
        });
    }

    showLoadingIndicator() {
        // 簡單的載入指示器
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, #667eea, #764ba2);
                z-index: 9999;
                animation: loadingBar 1s ease-in-out;
            "></div>
            <style>
                @keyframes loadingBar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0); }
                }
            </style>
        `;
        
        document.body.appendChild(loader);
        
        // 1秒後移除載入指示器
        setTimeout(() => {
            const loaderElement = document.getElementById('page-loader');
            if (loaderElement) {
                loaderElement.remove();
            }
        }, 100);
    }

    // 靜態方法，可在任何頁面調用
    static logout() {
        if (confirm('確定要登出嗎？')) {
            // 清除儲存的狀態
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('pageState_') || key.startsWith('youqiao_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // 跳轉到登入頁面或首頁
            window.location.href = 'index.html';
        }
    }

    // 頁面間數據傳遞
    static setPageData(key, data) {
        localStorage.setItem(`pageData_${key}`, JSON.stringify(data));
    }

    static getPageData(key) {
        const data = localStorage.getItem(`pageData_${key}`);
        return data ? JSON.parse(data) : null;
    }

    static clearPageData(key) {
        localStorage.removeItem(`pageData_${key}`);
    }

    // 麵包屑導航
    static updateBreadcrumb(items) {
        let breadcrumbContainer = document.querySelector('.breadcrumb-container');
        
        if (!breadcrumbContainer) {
            breadcrumbContainer = document.createElement('div');
            breadcrumbContainer.className = 'breadcrumb-container';
            
            const navigation = document.querySelector('.main-navigation');
            if (navigation) {
                navigation.parentNode.insertBefore(breadcrumbContainer, navigation.nextSibling);
            }
        }

        const breadcrumbHTML = `
            <nav class="breadcrumb">
                ${items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return `
                        <span class="breadcrumb-item ${isLast ? 'active' : ''}">
                            ${!isLast && item.href ? 
                                `<a href="${item.href}">${item.text}</a>` : 
                                item.text
                            }
                        </span>
                        ${!isLast ? '<span class="breadcrumb-separator">></span>' : ''}
                    `;
                }).join('')}
            </nav>
            <style>
                .breadcrumb-container {
                    background-color: #f8f9fa;
                    padding: 0.5rem 2rem;
                    border-bottom: 1px solid #dee2e6;
                }
                
                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }
                
                .breadcrumb-item a {
                    color: #6c757d;
                    text-decoration: none;
                }
                
                .breadcrumb-item a:hover {
                    color: #495057;
                    text-decoration: underline;
                }
                
                .breadcrumb-item.active {
                    color: #495057;
                    font-weight: 500;
                }
                
                .breadcrumb-separator {
                    color: #6c757d;
                }
            </style>
        `;

        breadcrumbContainer.innerHTML = breadcrumbHTML;
    }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
        // 等待資料初始化完成後再載入專案
    setTimeout(() => {
        // 恢復頁面狀態
        if (window.Navigation && typeof window.Navigation.restorePageState === 'function') {
            window.Navigation.restorePageState();
        }
        
        // 根據頁面設定麵包屑
        const pageBreadcrumbs = {
            'index': [
                { text: '首頁', href: null }
            ],
            'clients': [
                { text: '首頁', href: 'index.html' },
                { text: '客戶管理', href: null }
            ],
            'projects': [
                { text: '首頁', href: 'index.html' },
                { text: '專案管理', href: null }
            ],
            'sampling': [
                { text: '首頁', href: 'index.html' },
                { text: '現場採樣', href: null }
            ],
            'database': [
                { text: '首頁', href: 'index.html' },
                { text: '資料庫管理', href: null }
            ],
            'reports': [
                { text: '首頁', href: 'index.html' },
                { text: '報表輸出', href: null }
            ]
        };

        const currentPage = window.Navigation ? window.Navigation.currentPage : 'index';
        if (pageBreadcrumbs[currentPage]) {
            NavigationManager.updateBreadcrumb(pageBreadcrumbs[currentPage]);
        }
    }, 100);
});

// 全域導航實例
window.Navigation = new NavigationManager();

// 在頁面卸載前儲存狀態
window.addEventListener('beforeunload', function() {
    if (window.Navigation && typeof window.Navigation.saveCurrentPageState === 'function') {
        window.Navigation.saveCurrentPageState();
    }
});