/**
 * 示範資料（Mock Data）— 專案與 Ticket
 * 美股持倉改由 data/stocks.js（window.STOCKS_SESSION）提供，來自美股收市助手。
 * 日後專案／Ticket 可改為從 API 載入，結構大致保持不變。
 */
window.DASHBOARD_MOCK = {
  meta: {
    label: "美股：收市資料 · 其餘示範",
    generatedAt: "2026-09-17T09:00:00+08:00",
    disclaimer: "專案與 Ticket 為示範資料；美股報價來自美股收市助手（非即時）。"
  },

  projects: [
    {
      id: "prj-001",
      name: "資訊分享儀表板",
      owner: "Joe Ng",
      team: "產品／工程",
      status: "進行中",
      progress: 65,
      lastUpdate: "2026-09-16"
    },
    {
      id: "prj-002",
      name: "內部知識庫遷移",
      owner: "Amy Chan",
      team: "平台團隊",
      status: "進行中",
      progress: 40,
      lastUpdate: "2026-09-15"
    },
    {
      id: "prj-003",
      name: "季度營運報表自動化",
      owner: "Ken Wong",
      team: "數據團隊",
      status: "待開始",
      progress: 0,
      lastUpdate: "2026-09-10"
    },
    {
      id: "prj-004",
      name: "客戶支援工單分類優化",
      owner: "Sarah Lee",
      team: "客服／AI",
      status: "進行中",
      progress: 80,
      lastUpdate: "2026-09-17"
    },
    {
      id: "prj-005",
      name: "2026 Q2 回顧簡報",
      owner: "Joe Ng",
      team: "管理層",
      status: "已完成",
      progress: 100,
      lastUpdate: "2026-08-30"
    }
  ],

  tickets: {
    summary: {
      todo: 7,
      inProgress: 4,
      done: 12
    },
    items: [
      {
        key: "OPS-241",
        title: "儀表板靜態骨架初版",
        assignee: "Joe Ng",
        priority: "高",
        status: "進行中"
      },
      {
        key: "OPS-238",
        title: "整理投資示範資料欄位",
        assignee: "Amy Chan",
        priority: "中",
        status: "待辦"
      },
      {
        key: "OPS-235",
        title: "專案進度卡片 UI 調整",
        assignee: "Ken Wong",
        priority: "中",
        status: "進行中"
      },
      {
        key: "OPS-230",
        title: "Ticket 摘要數字對齊 Jira",
        assignee: "Sarah Lee",
        priority: "低",
        status: "待辦"
      },
      {
        key: "OPS-220",
        title: "README 繁中說明文件",
        assignee: "Joe Ng",
        priority: "低",
        status: "完成"
      },
      {
        key: "OPS-215",
        title: "暗色主題對比度檢查",
        assignee: "Amy Chan",
        priority: "中",
        status: "完成"
      }
    ]
  }
};
