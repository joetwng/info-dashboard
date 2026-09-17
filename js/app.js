/**
 * 資訊分享儀表板 — 前端邏輯
 * 美股：window.STOCKS_SESSION（data/stocks.js，來自美股收市助手）
 * 專案／Ticket：window.DASHBOARD_MOCK（data/mock.js，示範資料）
 */
(function () {
  "use strict";

  const MOCK = window.DASHBOARD_MOCK;
  const STOCKS = window.STOCKS_SESSION;

  if (!MOCK) {
    document.body.innerHTML =
      '<p style="padding:2rem;color:#ef4444;">無法載入示範資料（data/mock.js）。</p>';
    return;
  }

  if (!STOCKS) {
    document.body.innerHTML =
      '<p style="padding:2rem;color:#ef4444;">無法載入美股資料（data/stocks.js）。</p>';
    return;
  }

  function formatUSD(n) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: STOCKS.currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n);
  }

  function formatPct(n) {
    const sign = n > 0 ? "+" : "";
    return sign + n.toFixed(2) + "%";
  }

  function formatSignedUSD(n) {
    const sign = n > 0 ? "+" : "";
    return sign + formatUSD(n);
  }

  function formatRange(low, high) {
    return formatUSD(low) + " – " + formatUSD(high);
  }

  function formatAmplitude(low, high, close) {
    const amp = high - low;
    const pct = close ? (amp / close) * 100 : 0;
    return formatUSD(amp) + " <small>(" + pct.toFixed(2) + "%)</small>";
  }


  /** 簡單估算：以下日收市為中軸，用今日波幅作預期區間（非預測保證） */
  function formatNextDayRange(close, low, high) {
    const amp = high - low;
    const predLow = close - amp;
    const predHigh = close + amp;
    return (
      formatUSD(predLow) +
      " – " +
      formatUSD(predHigh) +
      ' <small class="est-note">估算</small>'
    );
  }



  function changeClass(n) {
    if (n > 0) return "change-pos";
    if (n < 0) return "change-neg";
    return "";
  }

  function valueClass(n) {
    if (n > 0) return "positive";
    if (n < 0) return "negative";
    return "";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  /* ---------- A) 投資組合（STOCKS_SESSION） ---------- */

  function renderPortfolio() {
    const holdings = STOCKS.holdings || [];
    let totalDayPL = 0;

    const rows = holdings.map(function (h) {
      const dayPL = h.shares * h.change;
      totalDayPL += dayPL;
      const positionValue =
        typeof h.positionValue === "number"
          ? h.positionValue
          : h.shares * h.close;

      return (
        "<tr>" +
        '<td><span class="ticker">' +
        escapeHtml(h.ticker) +
        '</span><div class="company">' +
        escapeHtml(h.name) +
        "</div></td>" +
        "<td>" +
        h.shares +
        "</td>" +
        "<td>" +
        formatUSD(h.close) +
        "</td>" +
        '<td class="' +
        changeClass(h.change) +
        '">' +
        formatPct(h.changePct) +
        "<br><small>" +
        formatSignedUSD(h.change) +
        "</small></td>" +
        "<td>" +
        formatRange(h.dayLow, h.dayHigh) +
        "</td>" +
        '<td class="amplitude">' +
        formatAmplitude(h.dayLow, h.dayHigh, h.close) +
        "</td>" +
        '<td class="next-range" title="以收市價 ± 當日波幅估算，僅供參考">' +
        formatNextDayRange(h.close, h.dayLow, h.dayHigh) +
        "</td>" +
        "<td>" +
        formatUSD(positionValue) +
        "</td>" +
        "</tr>"
      );
    });

    document.getElementById("portfolio-total-value").textContent = formatUSD(
      STOCKS.portfolioTotal
    );
    const plEl = document.getElementById("portfolio-day-pl");
    plEl.textContent = formatSignedUSD(totalDayPL);
    plEl.className = "value " + valueClass(totalDayPL);

    document.getElementById("holdings-tbody").innerHTML = rows.join("");

    const metaEl = document.getElementById("portfolio-session-meta");
    if (metaEl) {
      const parts = [];
      if (STOCKS.sessionDate) parts.push("交易日 " + STOCKS.sessionDate);
      if (STOCKS.sessionLabel) parts.push(STOCKS.sessionLabel);
      if (STOCKS.source) parts.push("來源：" + STOCKS.source);
      metaEl.textContent = parts.join(" · ");
    }

    renderNews(holdings);

    const disc = document.getElementById("portfolio-disclaimer");
    if (disc) {
      const notes = [];
      if (STOCKS.timezoneNote) notes.push(STOCKS.timezoneNote);
      if (MOCK.meta && MOCK.meta.disclaimer) notes.push(MOCK.meta.disclaimer);
      disc.textContent = notes.join(" ");
    }
  }

  function renderNews(holdings) {
    const container = document.getElementById("portfolio-news");
    if (!container) return;

    const items = [];
    holdings.forEach(function (h) {
      (h.news || []).forEach(function (n) {
        items.push({
          ticker: h.ticker,
          headline: n.headline,
          url: n.url
        });
      });
    });

    if (!items.length) {
      container.innerHTML = "";
      return;
    }

    const lis = items
      .map(function (n) {
        return (
          "<li>" +
          '<span class="news-ticker">' +
          escapeHtml(n.ticker) +
          "</span> " +
          '<a href="' +
          escapeAttr(n.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(n.headline) +
          "</a>" +
          "</li>"
        );
      })
      .join("");

    container.innerHTML =
      '<h3 class="news-heading">相關新聞</h3><ul class="news-list">' +
      lis +
      "</ul>";
  }

  /* ---------- B) 專案進度 ---------- */

  function renderProjects() {
    const cards = MOCK.projects.map(function (p) {
      return (
        '<article class="project-card">' +
        "<h3>" +
        escapeHtml(p.name) +
        "</h3>" +
        '<div class="project-meta">' +
        "<span>負責人：" +
        escapeHtml(p.owner) +
        "</span>" +
        "<span>團隊：" +
        escapeHtml(p.team) +
        "</span>" +
        "</div>" +
        '<div><span class="status-pill ' +
        escapeHtml(p.status) +
        '">' +
        escapeHtml(p.status) +
        "</span></div>" +
        '<div class="progress-row">' +
        '<div class="progress-bar" role="progressbar" aria-valuenow="' +
        p.progress +
        '" aria-valuemin="0" aria-valuemax="100">' +
        '<div class="progress-fill" style="width:' +
        p.progress +
        '%"></div></div>' +
        '<span class="progress-pct">' +
        p.progress +
        "%</span></div>" +
        '<div class="project-meta">最後更新：' +
        escapeHtml(p.lastUpdate) +
        "</div>" +
        "</article>"
      );
    });

    document.getElementById("project-grid").innerHTML = cards.join("");
  }

  /* ---------- C) Ticket ---------- */

  function renderTickets() {
    const s = MOCK.tickets.summary;
    document.getElementById("ticket-todo").textContent = s.todo;
    document.getElementById("ticket-in-progress").textContent = s.inProgress;
    document.getElementById("ticket-done").textContent = s.done;

    const rows = MOCK.tickets.items.map(function (t) {
      return (
        "<tr>" +
        '<td class="key-cell">' +
        escapeHtml(t.key) +
        "</td>" +
        "<td>" +
        escapeHtml(t.title) +
        "</td>" +
        "<td>" +
        escapeHtml(t.assignee) +
        "</td>" +
        '<td><span class="priority ' +
        escapeHtml(t.priority) +
        '">' +
        escapeHtml(t.priority) +
        "</span></td>" +
        '<td><span class="status-pill ' +
        escapeHtml(t.status) +
        '">' +
        escapeHtml(t.status) +
        "</span></td>" +
        "</tr>"
      );
    });

    document.getElementById("tickets-tbody").innerHTML = rows.join("");
  }

  /* ---------- 啟動 ---------- */

  function init() {
    const badge = document.getElementById("mock-badge");
    if (badge) {
      badge.textContent =
        (MOCK.meta && MOCK.meta.label) || "美股：收市資料 · 其餘示範";
    }

    const updated = document.getElementById("mock-updated");
    if (updated) {
      const stamp = STOCKS.generatedAt || (MOCK.meta && MOCK.meta.generatedAt);
      if (stamp) {
        try {
          const d = new Date(stamp);
          updated.textContent =
            "美股資料時間：" +
            d.toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong" });
        } catch (e) {
          updated.textContent = "美股資料時間：" + stamp;
        }
      }
    }

    renderPortfolio();
    renderProjects();
    renderTickets();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
