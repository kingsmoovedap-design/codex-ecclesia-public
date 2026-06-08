/**
 * divinity-copilot.js
 * DivinityVX Co-Pilot — Grand Architect Action Mirror
 * Every significant action on every protected page is streamed
 * live to DivinityVX Command Center so both operate together.
 *
 * Include after access-gate.js on every page.
 */
(function () {
  if (!sessionStorage.getItem('dvx_auth')) return;

  const PAGE = window.location.pathname.split('/').pop() || 'index.html';
  let actionQueue = [];
  let flushTimer = null;

  // ── Core event publisher ──
  function emit(action, detail = {}) {
    const event = {
      id: 'ACT-' + Date.now().toString(36).toUpperCase(),
      ts: new Date().toISOString(),
      page: PAGE,
      operator: window.DVX_NAME || 'Grand Architect',
      role: window.DVX_ROLE || 'architect',
      action,
      detail
    };
    actionQueue.push(event);
    if (!flushTimer) flushTimer = setTimeout(flush, 800);
    updateCopilotPanel(event);
  }

  function flush() {
    flushTimer = null;
    if (!actionQueue.length) return;
    const batch = actionQueue.splice(0);
    fetch('/api/divinity/copilot/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Dynasty-Auth': sessionStorage.getItem('dvx_auth') || '' },
      body: JSON.stringify({ actions: batch })
    }).catch(() => {});
  }

  // ── Track page load ──
  emit('PAGE_VISIT', { title: document.title, url: window.location.href });

  // ── Track all significant clicks ──
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a, button, [data-track], .cg-card, .ob-btn, .hero-btn, .sov-activate-btn, .dv-nav-btn, .filter-btn');
    if (!el) return;
    emit('CLICK', {
      element: el.tagName,
      text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 80),
      href: el.href || el.getAttribute('data-href') || null,
      id: el.id || null,
      class: el.className?.toString().slice(0, 60) || null
    });
  }, true);

  // ── Track form submissions ──
  document.addEventListener('submit', (e) => {
    emit('FORM_SUBMIT', { formId: e.target.id, formAction: e.target.action });
  }, true);

  // ── Track select/input changes ──
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.tagName === 'SELECT' || (el.tagName === 'INPUT' && el.type !== 'password')) {
      emit('INPUT_CHANGE', { id: el.id, name: el.name, value: el.value?.slice(0, 50) });
    }
  }, true);

  // ── Co-pilot floating panel ──
  function buildPanel() {
    if (document.getElementById('dvxCopilotPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'dvxCopilotPanel';
    panel.innerHTML = `
      <div id="dvxCpHeader" style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:0.5rem 0.75rem;border-bottom:1px solid rgba(0,212,255,0.15);">
        <span style="font-size:0.62rem;color:#00d4ff;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">⚡ DivinityVX Co-Pilot</span>
        <span id="dvxCpToggle" style="font-size:0.7rem;color:#4a6580;">▾</span>
      </div>
      <div id="dvxCpBody" style="padding:0.5rem 0.75rem;">
        <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.4rem;">
          <span id="dvxCpDot" style="width:6px;height:6px;border-radius:50%;background:#00ff88;box-shadow:0 0 6px rgba(0,255,136,0.8);flex-shrink:0;"></span>
          <span style="font-size:0.6rem;color:#4a6580;text-transform:uppercase;letter-spacing:0.08em;">Live — Watching</span>
        </div>
        <div id="dvxCpFeed" style="font-size:0.58rem;color:#2a4255;max-height:120px;overflow-y:auto;line-height:1.6;"></div>
        <div style="margin-top:0.5rem;border-top:1px solid rgba(0,212,255,0.08);padding-top:0.4rem;display:flex;gap:0.4rem;flex-wrap:wrap;">
          <a href="divinity-command.html" style="font-size:0.58rem;color:#00d4ff;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em;border:1px solid rgba(0,212,255,0.2);padding:0.15rem 0.4rem;border-radius:2px;">⚡ Command</a>
          <span id="dvxCpCmdInput" onclick="dvxCopilotSendCmd()" style="font-size:0.58rem;color:#9b4dff;text-transform:uppercase;letter-spacing:0.08em;border:1px solid rgba(155,77,255,0.2);padding:0.15rem 0.4rem;border-radius:2px;cursor:pointer;">📡 Signal</span>
        </div>
        <div id="dvxIncoming" style="margin-top:0.35rem;display:none;background:rgba(155,77,255,0.06);border:1px solid rgba(155,77,255,0.2);border-radius:2px;padding:0.3rem 0.5rem;font-size:0.6rem;color:#9b4dff;"></div>
      </div>`;
    panel.style.cssText = `
      position:fixed;bottom:1.5rem;left:1.5rem;z-index:9999;
      background:rgba(4,18,40,0.96);border:1px solid rgba(0,212,255,0.25);
      border-radius:6px;width:220px;
      box-shadow:0 0 20px rgba(0,212,255,0.1);
      font-family:'Courier New',monospace;
      transition:all 0.2s;`;
    document.body.appendChild(panel);

    let collapsed = false;
    document.getElementById('dvxCpHeader').addEventListener('click', () => {
      collapsed = !collapsed;
      document.getElementById('dvxCpBody').style.display = collapsed ? 'none' : 'block';
      document.getElementById('dvxCpToggle').textContent = collapsed ? '▸' : '▾';
    });

    pollIncoming();
  }

  function updateCopilotPanel(event) {
    const feed = document.getElementById('dvxCpFeed');
    if (!feed) return;
    const dot = document.getElementById('dvxCpDot');
    if (dot) { dot.style.background = '#00d4ff'; setTimeout(() => dot.style.background = '#00ff88', 300); }
    const line = document.createElement('div');
    line.style.color = '#3a6070';
    line.textContent = '▸ ' + event.action + (event.detail?.text ? ' — ' + event.detail.text.slice(0, 30) : '');
    feed.appendChild(line);
    feed.scrollTop = feed.scrollHeight;
    if (feed.children.length > 12) feed.removeChild(feed.firstChild);
  }

  async function pollIncoming() {
    setInterval(async () => {
      try {
        const res = await fetch('/api/divinity/copilot/commands?page=' + PAGE);
        const d = await res.json();
        if (d.command) {
          const el = document.getElementById('dvxIncoming');
          if (el) {
            el.style.display = 'block';
            el.innerHTML = '⚡ DVX: ' + d.command.message;
            setTimeout(() => { el.style.display = 'none'; }, 8000);
          }
        }
      } catch (_) {}
    }, 5000);
  }

  window.dvxCopilotSendCmd = function () {
    const msg = prompt('Send signal to DivinityVX:');
    if (!msg) return;
    fetch('/api/divinity/copilot/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: window.DVX_NAME || 'Grand Architect', message: msg, page: PAGE, ts: new Date().toISOString() })
    }).catch(() => {});
    emit('SIGNAL_SENT', { message: msg });
  };

  // Build panel after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPanel);
  } else {
    buildPanel();
  }
})();
