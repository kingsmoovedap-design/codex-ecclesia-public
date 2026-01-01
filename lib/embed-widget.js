const CodexEmbed = (function() {
  'use strict';
  
  const CODEX_ORIGIN = window.location.origin;
  const STYLES = {
    widget: `
      font-family: 'Cinzel', 'Times New Roman', serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
      color: #d4af37;
      border: 1px solid #d4af37;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
    `,
    title: `
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    `,
    stat: `
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    `,
    button: `
      background: linear-gradient(135deg, #d4af37 0%, #aa8a2e 100%);
      color: #1a1a2e;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      width: 100%;
      margin-top: 12px;
    `
  };
  
  function createStatsWidget(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const widget = document.createElement('div');
    widget.style.cssText = STYLES.widget;
    widget.innerHTML = `
      <div style="${STYLES.title}">Codex Ecclesia Stats</div>
      <div id="codex-stats-content">
        <div style="${STYLES.stat}"><span>Documents Filed</span><span id="stat-docs">--</span></div>
        <div style="${STYLES.stat}"><span>Active Entities</span><span id="stat-entities">--</span></div>
        <div style="${STYLES.stat}"><span>Codex Events</span><span id="stat-events">--</span></div>
        <div style="${STYLES.stat}"><span>Network Status</span><span id="stat-status">--</span></div>
      </div>
      <button style="${STYLES.button}" onclick="window.open('${CODEX_ORIGIN}/omega-portal.html', '_blank')">
        Open Command Center
      </button>
    `;
    container.appendChild(widget);
    
    refreshStats(widget);
    if (options.autoRefresh !== false) {
      setInterval(() => refreshStats(widget), options.refreshInterval || 30000);
    }
    
    return widget;
  }
  
  function createCommandWidget(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const widget = document.createElement('div');
    widget.style.cssText = STYLES.widget + 'min-width: 280px;';
    widget.innerHTML = `
      <div style="${STYLES.title}">Dynasty Command</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <button style="${STYLES.button}margin-top:0;" onclick="CodexEmbed.action('loadboard')">Load Board</button>
        <button style="${STYLES.button}margin-top:0;" onclick="CodexEmbed.action('dispatch')">Dispatch</button>
        <button style="${STYLES.button}margin-top:0;" onclick="CodexEmbed.action('treasury')">Treasury</button>
        <button style="${STYLES.button}margin-top:0;" onclick="CodexEmbed.action('codex')">Codex</button>
      </div>
      <button style="${STYLES.button}" onclick="CodexEmbed.action('portal')">
        Full Command Center
      </button>
    `;
    container.appendChild(widget);
    return widget;
  }
  
  function createFilingWidget(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const widget = document.createElement('div');
    widget.style.cssText = STYLES.widget;
    widget.innerHTML = `
      <div style="${STYLES.title}">Quick File</div>
      <select id="filing-type" style="width:100%;padding:8px;margin-bottom:8px;background:#16213e;color:#d4af37;border:1px solid #d4af37;border-radius:4px;">
        <option value="">Select Document Type...</option>
        <option value="trust">Trust Declaration</option>
        <option value="pma">PMA Agreement</option>
        <option value="ucc">UCC Filing</option>
        <option value="affidavit">Affidavit</option>
        <option value="notice">Notice of Standing</option>
      </select>
      <button style="${STYLES.button}" onclick="CodexEmbed.startFiling()">
        Start Filing
      </button>
    `;
    container.appendChild(widget);
    return widget;
  }
  
  function createCoinTickerWidget(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const widget = document.createElement('div');
    widget.style.cssText = STYLES.widget + 'display:flex;align-items:center;gap:16px;';
    widget.innerHTML = `
      <div style="font-size:24px;">BSC</div>
      <div>
        <div style="font-size:12px;opacity:0.7;">Borders Sovereign Coin</div>
        <div style="font-size:18px;font-weight:600;" id="bsc-price">$0.00</div>
      </div>
      <div style="margin-left:auto;text-align:right;">
        <div style="font-size:12px;opacity:0.7;">24h Change</div>
        <div style="font-size:14px;color:#4ade80;" id="bsc-change">+0.00%</div>
      </div>
    `;
    container.appendChild(widget);
    return widget;
  }
  
  async function refreshStats(widget) {
    try {
      const response = await fetch(CODEX_ORIGIN + '/api/public/stats');
      if (response.ok) {
        const data = await response.json();
        const docs = widget.querySelector('#stat-docs');
        const entities = widget.querySelector('#stat-entities');
        const events = widget.querySelector('#stat-events');
        const status = widget.querySelector('#stat-status');
        
        if (docs) docs.textContent = data.documents || '0';
        if (entities) entities.textContent = data.entities || '0';
        if (events) events.textContent = data.events || '0';
        if (status) {
          status.textContent = 'Online';
          status.style.color = '#4ade80';
        }
      }
    } catch (e) {
      const status = widget.querySelector('#stat-status');
      if (status) {
        status.textContent = 'Offline';
        status.style.color = '#ef4444';
      }
    }
  }
  
  function action(type) {
    const urls = {
      loadboard: CODEX_ORIGIN + '/logistics-dynasty.html',
      dispatch: CODEX_ORIGIN + '/omega-portal.html#dispatch',
      treasury: CODEX_ORIGIN + '/treasury-console.html',
      codex: CODEX_ORIGIN + '/omega-portal.html#codex',
      portal: CODEX_ORIGIN + '/omega-portal.html'
    };
    window.open(urls[type] || urls.portal, '_blank');
  }
  
  function startFiling() {
    const select = document.getElementById('filing-type');
    const type = select ? select.value : '';
    if (type) {
      window.open(CODEX_ORIGIN + '/omega-portal.html?filing=' + type, '_blank');
    } else {
      window.open(CODEX_ORIGIN + '/omega-portal.html', '_blank');
    }
  }
  
  function embedIframe(containerId, path = '/omega-portal.html', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const iframe = document.createElement('iframe');
    iframe.src = CODEX_ORIGIN + path;
    iframe.style.cssText = `
      width: ${options.width || '100%'};
      height: ${options.height || '600px'};
      border: 1px solid #d4af37;
      border-radius: 8px;
    `;
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('loading', 'lazy');
    container.appendChild(iframe);
    return iframe;
  }
  
  function getEmbedCode(type, options = {}) {
    const widgetId = options.containerId || 'codex-widget';
    switch (type) {
      case 'stats':
        return `<div id="${widgetId}"></div>\n<script src="${CODEX_ORIGIN}/lib/embed-widget.js"><\/script>\n<script>CodexEmbed.createStatsWidget('${widgetId}');<\/script>`;
      case 'command':
        return `<div id="${widgetId}"></div>\n<script src="${CODEX_ORIGIN}/lib/embed-widget.js"><\/script>\n<script>CodexEmbed.createCommandWidget('${widgetId}');<\/script>`;
      case 'filing':
        return `<div id="${widgetId}"></div>\n<script src="${CODEX_ORIGIN}/lib/embed-widget.js"><\/script>\n<script>CodexEmbed.createFilingWidget('${widgetId}');<\/script>`;
      case 'iframe':
        return `<iframe src="${CODEX_ORIGIN}/omega-portal.html" style="width:100%;height:600px;border:1px solid #d4af37;border-radius:8px;" allowfullscreen loading="lazy"></iframe>`;
      default:
        return '';
    }
  }
  
  return {
    createStatsWidget,
    createCommandWidget,
    createFilingWidget,
    createCoinTickerWidget,
    embedIframe,
    getEmbedCode,
    action,
    startFiling,
    refresh: refreshStats
  };
})();

if (typeof window !== 'undefined') {
  window.CodexEmbed = CodexEmbed;
}
