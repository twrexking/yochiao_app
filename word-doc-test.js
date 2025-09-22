// 專案管理 Word 文件產生測試範例
// 此檔案展示如何使用 Projects.generateDocument 功能

// 測試範例 1: 直接呼叫產生計畫書
function testGenerateProjectPlan() {
    // 假設有一個專案 ID (從實際系統中取得)
    const projectId = 'PROJECT_001'; // 這應該是實際存在的專案 ID
    
    // 產生計畫書
    Projects.generateDocument(projectId, 'plan');
}

// 測試範例 2: 產生報價單
function testGenerateQuote() {
    const projectId = 'PROJECT_001';
    Projects.generateDocument(projectId, 'quote');
}

// 測試範例 3: 產生監測報告
function testGenerateReport() {
    const projectId = 'PROJECT_001';
    Projects.generateDocument(projectId, 'report');
}

// 測試範例 4: 檢查變數建構功能
async function testVariableBuilding() {
    // 取得測試資料
    const projectData = DataManager.getProjectById('PROJECT_001');
    const clientData = DataManager.getClientById(projectData?.clientId);
    
    if (!projectData || !clientData) {
        console.log('找不到測試資料，請先確保有初始化專案和客戶資料');
        return;
    }
    
    // 載入預設範本資料
    try {
        const response = await fetch('docx-template-default-data.json');
        const defaultData = await response.json();
        
        // 建立變數
        const variables = Projects.buildTemplateVariables(
            projectData, 
            clientData, 
            defaultData.defaultVariables
        );
        
        console.log('建立的範本變數:', variables);
        
        // 顯示變數摘要
        console.log('變數摘要:');
        console.log(`- 客戶名稱 (CustomName1): ${variables.CustomName1}`);
        console.log(`- 專案名稱 (CustomName2): ${variables.CustomName2}`);
        console.log(`- 基本資料表格項目數: ${variables.BasicDataTable?.length || 0}`);
        console.log(`- 監測時程表項目數: ${variables.MonitoringScheduleTable?.length || 0}`);
        console.log(`- 監測項目清單: ${variables.MonitoringItemsList?.length || 0} 項`);
        
    } catch (error) {
        console.error('測試變數建構失敗:', error);
    }
}

// 測試範例 5: 檢查當前專案資料收集
function testCurrentProjectData() {
    // 先設定一個當前專案 (模擬使用者點擊專案詳情)
    Projects.currentProjectId = 'PROJECT_001';
    
    const currentData = Projects.getCurrentProjectData();
    console.log('當前專案資料:', currentData);
    
    if (currentData) {
        console.log('專案資料摘要:');
        console.log(`- 專案: ${currentData.projectName}`);
        console.log(`- 客戶: ${currentData.clientName}`);
        console.log(`- 監測類型: ${currentData.projectType}`);
        console.log(`- 監測項目: ${currentData.monitoringItems?.length || 0} 項`);
        console.log(`- 採樣點位: ${currentData.samplingData?.length || 0} 個`);
    }
}

// 使用說明
console.log(`
Word 文件產生功能使用說明:

1. 基本使用:
   Projects.generateDocument('專案ID', '文件類型');
   
   文件類型選項:
   - 'plan': 監測計畫書
   - 'quote': 報價單  
   - 'report': 監測報告

2. 測試函式:
   - testGenerateProjectPlan(): 測試產生計畫書
   - testGenerateQuote(): 測試產生報價單
   - testGenerateReport(): 測試產生監測報告
   - testVariableBuilding(): 測試變數建構功能
   - testCurrentProjectData(): 測試當前專案資料收集

3. 注意事項:
   - 確保已載入 word-template-generator.js
   - 確保 template/ 目錄下有對應的 .docx 樣板檔案
   - 確保 docx-template-default-data.json 檔案可存取
   - 需要網路連線以載入 docx-templates 和 FileSaver.js

4. 變數對映說明:
   - CustomName1 → 客戶公司名稱
   - CustomName2 → 專案名稱
   - BasicDataTable → 專案基本資料表格
   - MonitoringScheduleTable → 監測時程表
   - 其他專案相關變數會自動填入

使用範例:
// 在瀏覽器控制台中執行
testVariableBuilding();
testGenerateProjectPlan();
`);

// 暴露測試函式到全域
window.WordDocTestFunctions = {
    testGenerateProjectPlan,
    testGenerateQuote,
    testGenerateReport,
    testVariableBuilding,
    testCurrentProjectData
};