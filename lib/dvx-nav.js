/**
 * DVX Universal Navigation — injected topbar for all platform pages
 * Drop <script src="lib/dvx-nav.js"></script> into any page's <head>
 */
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const NAV_LINKS = [
    { href: 'index.html',                      label: '⚡ Hub',           cls: 'cyan' },
    { href: 'divinity-command.html',            label: '🧠 Command',       cls: 'purple' },
    { href: 'logistics-ecosystem.html',         label: '🚚 Ecosystem',     cls: 'green' },
    { href: 'dispatcher-console.html',          label: '🗂 Dispatch',       cls: 'green' },
    { href: 'driver-app.html',                  label: '📱 Driver App',     cls: '' },
    { href: 'reverse-logistics-dashboard.html', label: '♻ Rev.Logi',      cls: 'green' },
    { href: 'carrier-enrollment.html',          label: '📝 Enroll',        cls: '' },
    { href: 'omega-portal.html',                label: '☩ Omega',          cls: '' },
    { href: 'dynasty-os-modules.html',          label: '⚙ Dynasty-OS',    cls: '' },
    { href: 'token-payment.html',               label: '🪙 Tokens',        cls: 'gold' },
    { href: 'register.html',                    label: '📋 Apply',          cls: '' },
    { href: 'all-scrolls.html',                 label: '📜 Scrolls',        cls: '' },
    { href: 'https://borders-dynasty--kingsmoovedap.replit.app', label: '👑 Dynasty HQ', cls: 'gold', external: true },
  ];

  const css = `
    #dvx-nav{
      position:sticky;top:0;z-index:9999;
      background:rgba(2,11,24,0.97);
      border-bottom:1px solid rgba(0,212,255,0.15);
      display:flex;align-items:center;justify-content:space-between;
      padding:0 1.25rem;height:50px;
      backdrop-filter:blur(10px);
      font-family:'Courier New',monospace;
      box-sizing:border-box;
    }
    #dvx-nav *{box-sizing:border-box;}
    .dvxn-left{display:flex;align-items:center;gap:0.9rem;}
    .dvxn-seal{font-size:1.2rem;filter:drop-shadow(0 0 8px rgba(255,215,0,0.7));
      animation:dvxSealPulse 3s ease-in-out infinite;}
    @keyframes dvxSealPulse{0%,100%{filter:drop-shadow(0 0 6px rgba(255,215,0,0.5));}50%{filter:drop-shadow(0 0 18px rgba(255,215,0,1));}}
    .dvxn-brand{font-size:0.85rem;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;
      background:linear-gradient(90deg,#00d4ff,#9b4dff);-webkit-background-clip:text;
      -webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap;}
    .dvxn-role{font-size:0.56rem;text-transform:uppercase;letter-spacing:0.12em;color:#ffd700;
      border:1px solid rgba(255,215,0,0.28);background:rgba(255,215,0,0.06);
      padding:0.13rem 0.45rem;border-radius:2px;white-space:nowrap;}
    .dvxn-links{display:flex;gap:0.15rem;flex-wrap:nowrap;overflow:hidden;}
    .dvxn-a{font-size:0.58rem;text-transform:uppercase;letter-spacing:0.07em;
      text-decoration:none;padding:0.28rem 0.55rem;border-radius:3px;
      border:1px solid transparent;transition:all 0.18s;color:#3a5060;white-space:nowrap;
      position:relative;}
    .dvxn-a:hover{color:#00d4ff;border-color:rgba(0,212,255,0.28);background:rgba(0,212,255,0.06);}
    .dvxn-a.active{color:#00d4ff;border-color:rgba(0,212,255,0.35);background:rgba(0,212,255,0.07);}
    .dvxn-a.clr-cyan{color:#2a8090;}.dvxn-a.clr-cyan:hover,.dvxn-a.clr-cyan.active{color:#00d4ff;}
    .dvxn-a.clr-purple{color:#6b3aaa;}.dvxn-a.clr-purple:hover,.dvxn-a.clr-purple.active{color:#9b4dff;border-color:rgba(155,77,255,0.35);background:rgba(155,77,255,0.07);}
    .dvxn-a.clr-green{color:#006644;}.dvxn-a.clr-green:hover,.dvxn-a.clr-green.active{color:#00ff88;border-color:rgba(0,255,136,0.35);background:rgba(0,255,136,0.06);}
    .dvxn-a.clr-gold{color:#aa8800;}.dvxn-a.clr-gold:hover,.dvxn-a.clr-gold.active{color:#ffd700;border-color:rgba(255,215,0,0.35);background:rgba(255,215,0,0.06);}
    .dvxn-badge{display:none;position:absolute;top:-4px;right:-4px;
      background:#ff3b6b;color:#fff;font-size:0.5rem;font-weight:900;
      width:14px;height:14px;border-radius:50%;text-align:center;line-height:14px;}
    .dvxn-right{display:flex;align-items:center;gap:0.65rem;flex-shrink:0;}
    .dvxn-clock{font-size:0.68rem;color:#00d4ff;letter-spacing:0.06em;white-space:nowrap;}
    .dvxn-dot{width:7px;height:7px;border-radius:50%;background:#00ff88;
      box-shadow:0 0 8px rgba(0,255,136,0.9);animation:dvxBlink 2s ease-in-out infinite;flex-shrink:0;}
    @keyframes dvxBlink{0%,100%{opacity:1;}50%{opacity:0.2;}}
    .dvxn-lock{font-size:0.56rem;color:#2a4255;text-transform:uppercase;letter-spacing:0.08em;
      border:1px solid rgba(0,212,255,0.12);padding:0.22rem 0.48rem;border-radius:2px;
      cursor:pointer;background:transparent;font-family:'Courier New',monospace;
      transition:all 0.18s;white-space:nowrap;}
    .dvxn-lock:hover{color:#ff3b6b;border-color:rgba(255,59,107,0.3);}
    @media(max-width:900px){.dvxn-links{display:none;}}
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const linkHtml = NAV_LINKS.map(l => {
    const active = page === l.href.split('/').pop() ? ' active' : '';
    const clr = l.cls ? ` clr-${l.cls}` : '';
    const target = l.external ? ' target="_blank"' : '';
    const badge = l.href === 'register.html' ? '<span class="dvxn-badge" id="dvxPendingBadge"></span>' : '';
    return `<a href="${l.href}" class="dvxn-a${active}${clr}"${target}>${l.label}${badge}</a>`;
  }).join('');

  const navHtml = `
    <div class="dvxn-left">
      <span class="dvxn-seal">☩</span>
      <span class="dvxn-brand">DivinityVX</span>
      <span class="dvxn-role" id="dvxNavRole">Sovereign Platform</span>
    </div>
    <div class="dvxn-links">${linkHtml}</div>
    <div class="dvxn-right">
      <span class="dvxn-clock" id="dvxNavClock">00:00:00 UTC</span>
      <span class="dvxn-dot"></span>
      <button class="dvxn-lock" onclick="(function(){sessionStorage.clear();window.location.href='gateway.html';})()">🔒 Lock</button>
    </div>
  `;

  const nav = document.createElement('nav');
  nav.id = 'dvx-nav';
  nav.innerHTML = navHtml;

  function inject() {
    if (document.body && !document.getElementById('dvx-nav')) {
      document.body.insertBefore(nav, document.body.firstChild);
      start();
    }
  }

  function start() {
    const roleEl = document.getElementById('dvxNavRole');
    if (roleEl) {
      const name = sessionStorage.getItem('dvx_name');
      const role = sessionStorage.getItem('dvx_role');
      if (name) roleEl.textContent = name;
      else if (role) roleEl.textContent = role;
    }

    setInterval(() => {
      const el = document.getElementById('dvxNavClock');
      if (el) {
        const t = new Date().toUTCString().match(/\d\d:\d\d:\d\d/);
        el.textContent = (t ? t[0] : '00:00:00') + ' UTC';
      }
    }, 1000);

    async function pollPending() {
      try {
        const r = await fetch('/api/admin/registrations/pending/count');
        if (!r.ok) return;
        const d = await r.json();
        const badge = document.getElementById('dvxPendingBadge');
        if (badge) {
          badge.textContent = d.count;
          badge.style.display = d.count > 0 ? 'inline-block' : 'none';
        }
      } catch (e) {}
    }
    pollPending();
    setInterval(pollPending, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
