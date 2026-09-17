# 資訊分享儀表板

Joe 用的靜態資訊分享儀表板。介面為**繁體中文（香港）**，無需建置工具。

- **美股／投資狀態**：來自「美股收市助手」的收市資料（非即時），schemaVersion 1。
- **專案／Ticket**：仍為示範／模擬資料。

## 如何在本機開啟

### 方法一：直接開啟檔案

用瀏覽器開啟：

```text
/workspace/info-dashboard/index.html
```

或在檔案總管雙擊 `index.html`。美股資料已內嵌於 `data/stocks.js`，`file://` 亦可運作（無需 fetch）。

### 方法二：簡易靜態伺服器（建議）

在專案目錄執行其一：

```bash
cd /workspace/info-dashboard
python3 -m http.server 8080
```

然後在瀏覽器開啟：

```text
http://localhost:8080/
```

其他選擇：

```bash
npx --yes serve -p 8080
# 或
php -S localhost:8080
```

## 資料說明

### 美股（真實收市 session）

資料來自**美股收市助手**，結構為 schemaVersion 1，欄位包括：

`schemaVersion`、`sessionDate`、`sessionLabel`、`timezoneNote`、`currency`、`source`、`generatedAt`、`holdings[]`（`ticker`、`name`、`shares`、`close`、`change`、`changePct`、`dayLow`、`dayHigh`、`volume`、`avgVolume20`、`volumeVsAvg`、`positionValue`、`news[]`）、`portfolioTotal`。

檔案：

| 檔案 | 用途 |
|------|------|
| `data/stocks-latest.json` | 最新交易日 JSON（例如 2026-09-16） |
| `data/stocks.js` | 同上內容，掛到 `window.STOCKS_SESSION`，供靜態頁直接載入 |

頁面會顯示組合總值（`portfolioTotal`）、當日盈虧（Σ `shares × change`）、持倉表與新聞連結。

### 專案／Ticket（示範）

仍集中於 `data/mock.js`（`window.DASHBOARD_MOCK`），**並非**真實 Jira 或專案系統狀態。

持倉代號（由收市助手提供）：

| 代號 | 公司 | 股數 |
|------|------|------|
| TSLA | Tesla | 30 |
| NVDA | NVIDIA | 30 |
| LCID | Lucid | 3000 |

## 檔案結構

```text
info-dashboard/
├── index.html              # 主頁（三個區塊）
├── css/
│   └── styles.css          # 樣式（深色儀表板風格）
├── js/
│   └── app.js              # 渲染邏輯（美股用 STOCKS_SESSION；其餘用 mock）
├── data/
│   ├── stocks.js           # 美股收市資料 → window.STOCKS_SESSION
│   ├── stocks-latest.json  # 同上 JSON（備份／對照）
│   └── mock.js             # 專案／Ticket 示範資料
└── README.md               # 本說明
```

## 頁面區塊

1. **美股／投資狀態** — 收市價、當日變動、當日高低、持倉市值、組合總值、當日盈虧、相關新聞  
2. **團隊／專案進度** — 專案卡片（名稱、負責人／團隊、狀態、進度％、最後更新）— 示範  
3. **Ticket／Jira 狀態** — 待辦／進行中／完成 摘要＋工單列表 — 示範  

## 更新美股資料

1. 將美股收市助手輸出的 JSON 覆寫 `data/stocks-latest.json`。  
2. 同步更新 `data/stocks.js`（內容相同，改為 `window.STOCKS_SESSION = { ... };`）。  
3. 重新開啟或重新整理頁面即可。

## 之後接 API 的建議

1. 美股保持 schemaVersion 1；專案／Ticket 可維持 `DASHBOARD_MOCK` 結構。  
2. 在 `js/app.js` 可改為 `fetch` 載入，成功後呼叫現有 render 函式；開發期間繼續用 `stocks.js`／`mock.js` 作 fallback。

## 注意事項

- 無金鑰、無部署步驟。  
- 美股為該交易日收市價，**非即時報價**，亦非投資建議。  
- 專案與 Ticket 僅供介面示範。  
