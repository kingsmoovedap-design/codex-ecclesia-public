/**
 * access-gate.js
 * Sovereign Platform Access Control — Client-Side Gate
 * Include FIRST on every protected page.
 * DivinityVX and Grand Architect bypass via KING2026 (already authenticated via divinity-command)
 */
(function () {
  const AUTH_KEY   = 'dvx_auth';
  const REDIR_KEY  = 'dvx_redirect';
  const GATE_PAGE  = 'gateway.html';

  // Pages that never need a gate (public)
  const PUBLIC_PAGES = ['gateway.html', 'gateway', 'register.html', 'register'];

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (PUBLIC_PAGES.some(p => currentPage.includes(p))) return;

  const token = sessionStorage.getItem(AUTH_KEY);

  if (!token) {
    sessionStorage.setItem(REDIR_KEY, window.location.href);
    window.location.replace(GATE_PAGE);
    // Freeze the page while redirecting
    document.documentElement.style.visibility = 'hidden';
    return;
  }

  // Attach auth header to all fetch calls via monkey-patch
  const _fetch = window.fetch;
  window.fetch = function (url, opts = {}) {
    opts.headers = opts.headers || {};
    opts.headers['X-Dynasty-Auth'] = token;
    return _fetch(url, opts);
  };

  // Expose role/name
  window.DVX_ROLE = sessionStorage.getItem('dvx_role') || 'operator';
  window.DVX_NAME = sessionStorage.getItem('dvx_name') || 'Sovereign Operator';

  // Attach logout to any element with data-logout
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-logout]').forEach(el => {
      el.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = GATE_PAGE;
      });
    });
  });
})();
