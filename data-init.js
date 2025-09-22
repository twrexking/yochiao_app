// 友喬環境監測系統 - 統一資料初始化函式庫

const DataInit = {
    isInitialized: false,

    // 初始化所有資料
    initializeData: function() {
        if (this.isInitialized) {
            console.log('資料已初始化，跳過重複初始化');
            return;
        }

        // 檢查是否已有本地資料
        const existingClients = DataManager.getFromLocal('clients');
        const existingProjects = DataManager.getFromLocal('projects');

        if (!existingClients || existingClients.length === 0) {
            this.initializeClients();
        }

        if (!existingProjects || existingProjects.length === 0) {
            this.initializeProjects();
        }

        this.initializeOtherData();
        this.initializeSamplingData();
        this.isInitialized = true;
        DataManager.saveToLocal('dataInitialized', true);
        console.log('資料初始化完成');
    },

    // 初始化客戶資料
    initializeClients: function() {
        const clients = [
            {
                id: 'CLIENT_001',
                companyName: '味全食品工業股份有限公司',
                taxId: '11347802',
                contactName: '王經理',
                contactTitle: '環保經理',
                phone: '02-2298-8888',
                email: 'wang@weichuan.com.tw',
                address: '台北市松山區八德路四段575巷20號',
                projectCount: 0,
                createdDate: '2023-01-15T09:00:00.000Z',
                status: '活躍'
            },
            {
                id: 'CLIENT_002',
                companyName: '葡萄王生技股份有限公司',
                taxId: '11880517',
                contactName: '陳協理',
                contactTitle: '品保協理',
                phone: '03-411-6789',
                email: 'chen@grapeking.com.tw',
                address: '桃園市龍潭區渴望路428號',
                projectCount: 0,
                createdDate: '2023-02-20T10:30:00.000Z',
                status: '活躍'
            },
            {
                id: 'CLIENT_003',
                companyName: '統一企業股份有限公司',
                taxId: '73251209',
                contactName: '林主任',
                contactTitle: '環境主任',
                phone: '06-253-6789',
                email: 'lin@uni-president.com.tw',
                address: '台南市永康區鹽行路338號',
                projectCount: 0,
                createdDate: '2023-03-10T11:15:00.000Z',
                status: '活躍'
            }
        ];

        DataManager.saveToLocal('clients', clients);
        console.log('客戶資料初始化完成');
    },

    // 初始化專案資料
    initializeProjects: function() {
        const projects = [
            {
                id: 'YOC114-001',
                clientId: 'CLIENT_001',
                projectName: '松山廠區',
                monitoringDate: '2025-03-20',
                monitoringDays: 1,
                facilityAddress: '台北市松山區八德路四段575巷20號3樓',
                projectDescription: '標準室內空氣品質監測專案',
                status: '執行中',
                progress: '計畫書完成',
                createdDate: '2025-02-15T09:00:00.000Z',
                monitoringType: '室內空氣品質監測',
                monitoringPoints: 4,
                monitoringItems: ['甲醛(HCHO)', '二氧化碳(CO2)', '一氧化碳(CO)', '臭氧(O3)', '懸浮微粒(PM10)', '細懸浮微粒(PM2.5)', '溫度', '相對濕度'],
                samplingPoints: [
                    {
                        id: 'P001',
                        name: 'B1F 停車場（汽車）',
                        description: '地下一樓汽車停車區域',
                        itemCount: 5,
                        items: ['一氧化碳(CO)', '二氧化碳(CO2)', '溫度', '相對濕度', '風速']
                    },
                    {
                        id: 'P002',
                        name: 'B1F 停車場（機車）',
                        description: '地下一樓機車停車區域',
                        itemCount: 5,
                        items: ['一氧化碳(CO)', '二氧化碳(CO2)', '溫度', '相對濕度', '風速']
                    },
                    {
                        id: 'P003',
                        name: 'A棟1F 大廳',
                        description: '一樓主要出入口大廳',
                        itemCount: 8,
                        items: ['甲醛(HCHO)', '一氧化碳(CO)', '二氧化碳(CO2)', 'TVOC', '溫度', '相對濕度', '懸浮微粒(PM10)', '細懸浮微粒(PM2.5)']
                    },
                    {
                        id: 'P004',
                        name: 'A棟1F 聯合辦公室',
                        description: '一樓開放式辦公區域',
                        itemCount: 10,
                        items: ['甲醛(HCHO)', '一氧化碳(CO)', '二氧化碳(CO2)', 'TVOC', '臭氧(O3)', '溫度', '相對濕度', '懸浮微粒(PM10)', '細懸浮微粒(PM2.5)', '細菌']
                    }
                ]
            },
            {
                id: 'YOC114-002',
                clientId: 'CLIENT_002',
                projectName: '龍潭廠區',
                monitoringDate: '2025-03-25',
                monitoringDays: 2,
                facilityAddress: '桃園市龍潭區渴望路428號',
                projectDescription: '作業環境監測專案',
                status: '報價中',
                progress: '待確認',
                createdDate: '2025-02-20T10:30:00.000Z',
                monitoringType: '作業環境監測',
                monitoringPoints: 6,
                monitoringItems: ['噪音', '照度', '溫濕度', '有機溶劑', '粉塵'],
                samplingPoints: [
                    {
                        id: 'P001',
                        name: '生產線A區',
                        description: '主要生產線區域',
                        itemCount: 6,
                        items: ['噪音', '照度', '溫濕度', '粉塵', '有機溶劑', '二氧化碳(CO2)']
                    },
                    {
                        id: 'P002',
                        name: '生產線B區',
                        description: '次要生產線區域',
                        itemCount: 5,
                        items: ['噪音', '照度', '溫濕度', '粉塵', '有機溶劑']
                    },
                    {
                        id: 'P003',
                        name: '包裝區',
                        description: '產品包裝作業區',
                        itemCount: 4,
                        items: ['噪音', '照度', '溫濕度', '懸浮微粒(PM10)']
                    },
                    {
                        id: 'P004',
                        name: '倉庫區',
                        description: '原料及成品倉庫',
                        itemCount: 3,
                        items: ['溫濕度', '粉塵', '照度']
                    },
                    {
                        id: 'P005',
                        name: '辦公區A',
                        description: '管理人員辦公區域',
                        itemCount: 4,
                        items: ['噪音', '照度', '溫濕度', '二氧化碳(CO2)']
                    },
                    {
                        id: 'P006',
                        name: '辦公區B',
                        description: '行政人員辦公區域',
                        itemCount: 4,
                        items: ['噪音', '照度', '溫濕度', '二氧化碳(CO2)']
                    }
                ]
            },
            {
                id: 'YOC113-015',
                clientId: 'CLIENT_003',
                projectName: '永康廠區',
                monitoringDate: '2024-12-15',
                monitoringDays: 3,
                facilityAddress: '台南市永康區鹽行路338號',
                projectDescription: '年度環境影響評估',
                status: '已完成',
                progress: '報告已交付',
                createdDate: '2024-11-01T08:00:00.000Z',
                monitoringType: '環境影響評估',
                monitoringPoints: 8,
                monitoringItems: ['空氣品質', '噪音振動', '水質', '土壤'],
                samplingPoints: [
                    {
                        id: 'P001',
                        name: '廠界北側',
                        description: '廠區北側邊界監測點',
                        itemCount: 4,
                        items: ['空氣品質', '噪音振動', 'PM10', 'PM2.5']
                    },
                    {
                        id: 'P002',
                        name: '廠界東側',
                        description: '廠區東側邊界監測點',
                        itemCount: 4,
                        items: ['空氣品質', '噪音振動', 'PM10', 'PM2.5']
                    },
                    {
                        id: 'P003',
                        name: '廠界南側',
                        description: '廠區南側邊界監測點',
                        itemCount: 4,
                        items: ['空氣品質', '噪音振動', 'PM10', 'PM2.5']
                    },
                    {
                        id: 'P004',
                        name: '廠界西側',
                        description: '廠區西側邊界監測點',
                        itemCount: 4,
                        items: ['空氣品質', '噪音振動', 'PM10', 'PM2.5']
                    },
                    {
                        id: 'P005',
                        name: '敏感受體1',
                        description: '鄰近住宅區監測點',
                        itemCount: 3,
                        items: ['空氣品質', 'PM10', 'PM2.5']
                    },
                    {
                        id: 'P006',
                        name: '敏感受體2',
                        description: '鄰近學校監測點',
                        itemCount: 3,
                        items: ['空氣品質', 'PM10', 'PM2.5']
                    },
                    {
                        id: 'P007',
                        name: '水質監測點1',
                        description: '廠區排水口',
                        itemCount: 1,
                        items: ['水質']
                    },
                    {
                        id: 'P008',
                        name: '土壤監測點1',
                        description: '廠區內土壤監測',
                        itemCount: 1,
                        items: ['土壤']
                    }
                ]
            }
        ];

        DataManager.saveToLocal('projects', projects);
        
        // 更新客戶的專案數量
        this.updateClientProjectCounts();
        console.log('專案資料初始化完成');
    },

    // 更新客戶專案數量
    updateClientProjectCounts: function() {
        const clients = DataManager.getFromLocal('clients') || [];
        const projects = DataManager.getFromLocal('projects') || [];

        clients.forEach(client => {
            const clientProjects = projects.filter(project => project.clientId === client.id);
            client.projectCount = clientProjects.length;
        });

        DataManager.saveToLocal('clients', clients);
    },

    // 初始化其他資料
    initializeOtherData: function() {
        // 監測項目資料
        const monitoringItems = {
            '室內空氣品質監測': ['甲醛(HCHO)', '二氧化碳(CO2)', '一氧化碳(CO)', '臭氧(O3)', '懸浮微粒(PM10)', '細懸浮微粒(PM2.5)', '溫度', '相對濕度'],
            '作業環境監測': ['噪音', '照度', '溫濕度', '有機溶劑', '粉塵', '重金屬', '酸鹼氣體'],
            '環境影響評估': ['空氣品質', '噪音振動', '水質', '土壤', '生態環境'],
            '特殊有害物質監測': ['石綿', '戴奧辛', 'PAHs', 'VOCs', '重金屬', '農藥殘留']
        };

        DataManager.saveToLocal('monitoringItems', monitoringItems);

        // 系統設定
        const systemSettings = {
            companyName: '友喬檢驗有限公司',
            version: '1.0.0',
            lastUpdate: new Date().toISOString()
        };

        DataManager.saveToLocal('systemSettings', systemSettings);
    },

    // 初始化採樣資料
    initializeSamplingData: function() {
        // 初始化採樣記錄
        const samplingRecords = [];
        DataManager.saveToLocal('samplingRecords', samplingRecords);

        // 初始化儀器校正記錄
        const calibrationRecords = [];
        DataManager.saveToLocal('calibrationRecords', calibrationRecords);

        // 初始化品管樣本記錄
        const qcSampleRecords = [];
        DataManager.saveToLocal('qcSampleRecords', qcSampleRecords);

        // 初始化採樣狀態
        const samplingStatus = {};
        DataManager.saveToLocal('samplingStatus', samplingStatus);

        console.log('採樣資料初始化完成');
    },

    // 檢查資料完整性
    validateData: function() {
        const clients = DataManager.getFromLocal('clients') || [];
        const projects = DataManager.getFromLocal('projects') || [];

        // 檢查專案是否都有對應的客戶
        const orphanProjects = projects.filter(project => {
            return !clients.find(client => client.id === project.clientId);
        });

        if (orphanProjects.length > 0) {
            console.warn('發現孤立專案（沒有對應客戶）:', orphanProjects);
        }

        return {
            isValid: orphanProjects.length === 0,
            orphanProjects: orphanProjects
        };
    },

    // 產生唯一ID
    generateClientId: function() {
        const clients = DataManager.getFromLocal('clients') || [];
        let maxId = 0;
        
        clients.forEach(client => {
            const idNum = parseInt(client.id.replace('CLIENT_', ''));
            if (idNum > maxId) {
                maxId = idNum;
            }
        });

        return `CLIENT_${String(maxId + 1).padStart(3, '0')}`;
    },

    // 產生專案ID
    generateProjectId: function() {
        const currentYear = new Date().getFullYear();
        const yearSuffix = currentYear.toString().slice(-2);
        const projects = DataManager.getFromLocal('projects') || [];
        
        // 找出當年度最大的編號
        let maxNum = 0;
        const currentYearProjects = projects.filter(project => 
            project.id.startsWith(`YOC${yearSuffix}-`)
        );

        currentYearProjects.forEach(project => {
            const num = parseInt(project.id.split('-')[1]);
            if (num > maxNum) {
                maxNum = num;
            }
        });

        return `YOC${yearSuffix}-${String(maxNum + 1).padStart(3, '0')}`;
    }
};

// 暴露給全域使用
window.DataInit = DataInit;