# Kitchen Order（receipts）網頁 — 需求規格

本文檔描述 **現況需求**（as-built），任何助理按此即可重做／維護同一頁面。  
參考實作：`https://joetwng.github.io/info-dashboard/receipts/`  
Repo：`https://github.com/joetwng/info-dashboard`（路徑 `receipts/`）

---

## 1. 目的

在廚房／出單場景，用網頁一覽 STAR 收據 PDF 預覽圖，支援搜尋、已印／未印切換、全螢幕瀏覽，並以雙擊標記「已列印」。

頁面顯示標題：**Kitchen Order**（`<title>` 同 `h1` 都係呢個字）。

---

## 2. 託管與部署

| 項目 | 要求 |
|------|------|
| 託管 | GitHub Pages（免費） |
| Repo | `joetwng/info-dashboard`（公開） |
| 發佈分支 | `main` 根目錄 |
| 公開 URL | `https://joetwng.github.io/info-dashboard/receipts/` |
| 技術 | 純靜態：HTML + CSS + 前端 JS；**唔需要**後端 |
| Cache bust | `receipts.css`、`manifest.json`、預覽圖 URL 要帶 `?v=YYYYMMDDHHMM`（或同等版本參數），避免 CDN／瀏覽器快取舊清單 |

主儀表板（`index.html`）可保留不明顯連結到 `receipts/`；**本頁本身唔好**有「返回上一頁／返回儀表板」頂／底連結。

---

## 3. 目錄結構

```
receipts/
  index.html          # 頁面＋全部互動 JS
  receipts.css        # 樣式
  manifest.json       # 收據清單（陣列）
  REQUIREMENTS.md     # 本文件
  pdfs/               # 原始 PDF（canonical 檔名）
    *.pdf
  previews/           # 由 PDF 轉出嘅 PNG 預覽（裁白邊）
    *.png
```

### 3.1 `manifest.json` 每項欄位

```json
{
  "name": "Test_PrintQ-2744-NA.pdf",
  "file": "pdfs/Test_PrintQ-2744-NA.pdf",
  "title": "Test_PrintQ-2744-NA",
  "preview": "previews/Test_PrintQ-2744-NA.png",
  "createdAt": "2026-09-17T04:21:08.612215+00:00",
  "mac": "00:11:62:42:79:1c"
}
```

| 欄位 | 說明 |
|------|------|
| `name` | 顯示／搜尋用檔名（含 `.pdf`） |
| `file` | 相對路徑，指向 `pdfs/` |
| `title` | 通常係去掉副檔名嘅名稱 |
| `preview` | 相對路徑，指向 `previews/*.png`；可選，冇就顯示檔名 fallback |
| `createdAt` | ISO 8601；用於排序 |
| `mac` | 列印機／來源 MAC（可選，顯示唔一定要） |

### 3.2 PDF 檔名規則（上載時）

- 只用 **canonical** 檔名（例如 `K1-0667-PICKUP.pdf`、`Test_PrintQ-2744-NA.pdf`）。
- **唔好**上載 `-2`／`-3` 等副本檔名。
- 新 PDF 流程：複製到 `receipts/pdfs/` → 產生預覽 PNG 到 `receipts/previews/` → 更新 `manifest.json` → 改 cache-bust 版本 → commit／push → 等 Pages built。

### 3.3 預覽圖要求

- 由 PDF 轉圖（例如 `pdftoppm`）再裁走左／右／底白邊（例如 Pillow）。
- **同一欄寬**：圖 `width: 100%`、`height: auto`（高度跟內容，唔鎖死固定 aspect-ratio）。
- 網格 5 欄，所有預覽同一欄寬。

---

## 4. 版面（Layout）

### 4.1 整體

- 深色主題（與主儀表板一致風格即可）。
- 頁面 `height: 100%`；**只有 PDF 區可滾動**；標題列固定唔跟滾。
- 外層 `max-width` 約 `1200px` 置中。

### 4.2 標題列（同一行，固定）

由左到右：

1. **標題** `h1`：`Kitchen Order`
2. **搜尋區**：標籤「搜尋檔案名稱」＋ search input（同一行）
3. **兩個掣**（靠右）：
   - `Show Printed`／`Show Un-Print`（視圖切換，見下）
   - `Full screen`／`Resume`（全螢幕）

**唔好**再放：標題下說明、內層「收據」小標題、頂／底返回連結、PDF 數量 counter。

### 4.3 PDF 區

- 外層 scroll container（例如 `.receipt-scroll`）負責 `overflow-y: auto`。
- **內層**先係 CSS Grid（例如 `.receipt-list`）：`grid-template-columns: repeat(5, minmax(0, 1fr))`。
- **重要**：scroll 同 grid **唔好**用同一個 DOM 節點，否則滾動時會出現「全部疊喺同一欄」嘅 bug。
- 排列：由左到右，再由上到下。
- 單擊 PDF：**唔好**開啟 PDF／唔好跳轉。
- 無符合結果時顯示：`找不到符合的收據。`

---

## 5. 互動行為

### 5.1 搜尋

- 即時過濾（`input`）。
- 對 `name`、`title`、以及去掉 `PRT_` 後嘅 base name 做 **case-insensitive** 包含比對。

### 5.2 已印／未印視圖（`localStorage`）

用瀏覽器 `localStorage` 記住狀態（唔改伺服器檔名）。

| Key | 用途 |
|-----|------|
| `star-receipts-prt-names` | JSON 字串陣列；標記已印／取消已印 |
| `star-receipts-view-mode` | `"printed"` 或 `"unprinted"`；預設 **`unprinted`** |

**「已印」判斷邏輯（必須一致）：**

- 若檔名本身以 `PRT_` 開頭：視為已印，除非 set 入面有 `UNPRT_` + baseName。
- 否則：若 set 有 `baseName` 或 `PRT_` + baseName → 已印。
- `baseName` = 去掉開頭 `PRT_` 後嘅檔名。

**雙擊一張預覽卡：**

1. 切換該張嘅已印狀態（寫入／清除 `localStorage`）：
   - 未印 → 標記已印（加入 base 同 `PRT_`+base；清走 `UNPRT_`）。
   - 已印 → 取消已印（刪除標記；若真實檔名以 `PRT_` 開頭則加 `UNPRT_`+base）。
2. **重新 render 清單**（`renderReceipts()`），**禁止 `location.reload()`**。  
   原因：全螢幕下 reload 會退出全螢幕。

**視圖掣文案與行為：**

| 而家視圖 | 掣顯示文案 | 掣按下後 |
|----------|------------|----------|
| 未印（預設） | `Show Printed` | 改顯示已印 |
| 已印 | `Show Un-Print` | 改顯示未印 |

- **Show Un-Print（未印列表）**：只顯示未印；按 `createdAt` **新→舊**（descending）。
- **Show Printed（已印列表）**：只顯示已印；按 `createdAt` **新→舊**（descending）。
- 切換後立即 re-render；記住 `view-mode`。

### 5.3 全螢幕

- `Full screen`：`document.documentElement.requestFullscreen()`（兼顧 webkit 前綴）。
- 進入後掣文案改 `Resume`；退出改返 `Full screen`。
- 監聽 `fullscreenchange`／`webkitfullscreenchange` 更新文案。
- 全螢幕下雙擊標記已印 **必須保持全螢幕**（見 5.2：唔好 reload）。

### 5.4 停止滾動自動回頂

- 只監聽 PDF 滾動區（`scroll`／`wheel`／`touchmove`）。
- 停止滾動後 **2 秒**（`SCROLL_IDLE_MS = 2000`），若 `scrollTop > 0`，平滑滾回頂（`behavior: "smooth"`）。

---

## 6. UI 文案一覽（固定字串）

| 位置 | 文案 |
|------|------|
| 頁標題／h1 | `Kitchen Order` |
| 搜尋 label | `搜尋檔案名稱` |
| 搜尋 placeholder | `例如：2748` |
| 視圖掣 | `Show Printed` / `Show Un-Print` |
| 全螢幕掣 | `Full screen` / `Resume` |
| 空狀態 | `找不到符合的收據。` |
| `lang` | `zh-HK` |

---

## 7. 驗收清單（Acceptance）

實作完成後，逐項核對：

- [ ] 開啟 `…/receipts/`，標題係 **Kitchen Order**，冇頂／底返回連結、冇標題下說明、冇內層「收據」小標。
- [ ] 標題行同一行：左標題、中搜尋（label＋input）、右兩個掣。
- [ ] 只有 PDF 區可滾；標題／搜尋／掣固定。
- [ ] 預覽 5 欄網格；左→右、上→下；闊度一致、高度跟內容；白邊已裁。
- [ ] 單擊唔開 PDF；雙擊切換已印並更新清單，**唔整頁 reload**。
- [ ] 預設顯示未印、新→舊；撳 `Show Printed` 顯示已印、新→舊；掣改 `Show Un-Print`，再撳返未印。
- [ ] 搜尋可按檔名片段過濾。
- [ ] 全螢幕可進／出；全螢幕下雙擊仍保持全螢幕。
- [ ] 滾動停 2 秒後自動平滑回頂。
- [ ] 新 PDF 上線後，改 `manifest`＋cache-bust，強制重新整理可見；唔好上 `-2`／`-3` 副本。

---

## 8. 新增一張收據嘅標準步驟（給部署／對接助理）

1. 取得 canonical PDF（唔用副本後綴）。
2. 放入 `receipts/pdfs/<name>.pdf`。
3. 轉 PNG 預覽 → 裁左／右／底白邊 → 存 `receipts/previews/<stem>.png`。
4. 更新 `manifest.json`（補 `name`／`file`／`title`／`preview`／`createdAt`／`mac`）。
5. 更新 `index.html` 內 `receipts.css?v=`、`manifest.json?v=`、預覽 `?v=`。
6. Commit＋push `main`；等 GitHub Pages `status=built`。
7. 用帶隨機 query 嘅 URL 抽查 live HTML／manifest 版本。

如需「只保留最新一張／清空其餘」，按 Joe 指示刪 `pdfs/`、`previews/` 對應檔並重寫 `manifest.json` 後再部署。

---

## 9. 非目標（Out of scope）

- 伺服器端改檔名加 `PRT_`（已印狀態只在瀏覽器 `localStorage`）。
- 點擊開啟 PDF、列印對話框、帳號登入。
- 即時推送（而家係靜態 manifest；新單靠重新部署／更新檔案）。

---

*最後對齊 live 行為日期：2026-09-18（UTC+8）。*
