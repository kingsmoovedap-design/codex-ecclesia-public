(async function () {
  const codexUrl = 'codex.json';
  let scrolls = [];

  const searchInput = document.getElementById('searchInput');
  const resultsGrid = document.getElementById('resultsGrid');
  const resultsEmpty = document.getElementById('resultsEmpty');
  const resultsTitle = document.getElementById('resultsTitle');
  const filterButtons = document.querySelectorAll('.filterButton');

  // Helper: get current page type
  const page = (() => {
    const path = window.location.pathname;
    if (path.endsWith('all-scrolls.html')) return 'directory';
    if (path.endsWith('omega-portal.html')) return 'omega';
    return 'home';
  })();

  // Helper: get URL query param
  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  // Fetch codex
  try {
    const res = await fetch(codexUrl, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Failed to load codex.json');
    const data = await res.json();
    scrolls = Array.isArray(data.scrolls) ? data.scrolls : [];
  } catch (err) {
    console.error('Error loading codex:', err);
    if (resultsEmpty) {
      resultsEmpty.style.display = 'block';
      resultsEmpty.textContent = 'Unable to load Codex data.';
    }
    return;
  }

  // Basic card template
  function renderCard(item) {
    const div = document.createElement('article');
    div.className = 'card';

    const created = item.created ? new Date(item.created) : null;
    const createdStr = created ? created.toLocaleDateString() : '';

    div.innerHTML = `
      <h3>${item.title || 'Untitled Scroll'}</h3>
      <p style="font-size:0.85rem; color:#666; margin-bottom:0.5rem;">
        ${item.section ? item.section.toUpperCase() : ''}${
      item.category ? ' • ' + item.category : ''
    }${createdStr ? ' • ' + createdStr : ''}
      </p>
      <p>${item.summary || ''}</p>
      <p style="margin-top:0.75rem;">
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">Open Scroll →</a>
      </p>
    `;
    return div;
  }

  function updateResults(list, titleOverride) {
    if (!resultsGrid) return;
    resultsGrid.innerHTML = '';
    if (resultsTitle && titleOverride) {
      resultsTitle.textContent = titleOverride;
    }

    if (!list || list.length === 0) {
      if (resultsEmpty) resultsEmpty.style.display = 'block';
      return;
    }

    if (resultsEmpty) resultsEmpty.style.display = 'none';
    list.forEach(item => resultsGrid.appendChild(renderCard(item)));
  }

  // Search logic
  function searchScrolls(query, sectionFilter) {
    const q = (query || '').toLowerCase().trim();
    const sec = (sectionFilter || '').toLowerCase().trim();

    return scrolls.filter(item => {
      if (sec && String(item.section || '').toLowerCase() !== sec) return false;
      if (!q) return true;

      const haystack = [
        item.title || '',
        item.summary || '',
        item.section || '',
        item.category || '',
        ...(item.tags || [])
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }

  // Initial render based on page
  if (page === 'home') {
    // Featured: pinned first, then most recent
    const pinned = scrolls.filter(s => s.pinned);
    const recent = [...scrolls]
      .filter(s => !s.pinned)
      .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
      .slice(0, 6 - pinned.length);

    const featured = [...pinned, ...recent].slice(0, 6);
    updateResults(featured, 'Featured Scrolls');
  }

  if (page === 'directory') {
    const sectionParam = getQueryParam('section');
    let title = 'All Entries';
    if (sectionParam) {
      title = `Entries in ${sectionParam.charAt(0).toUpperCase() + sectionParam.slice(1)}`;
    }
    const initial = searchScrolls('', sectionParam || '');
    updateResults(initial, title);

    // Pre-highlight filter button
    if (sectionParam) {
      filterButtons.forEach(btn => {
        if (btn.dataset.section === sectionParam) {
          btn.style.backgroundColor = '#003366';
          btn.style.color = '#fff';
        }
      });
    }
  }

  if (page === 'omega') {
    const pinned = scrolls.filter(s => s.pinned);
    const recent = [...scrolls]
      .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
      .slice(0, 6);
    const combined = [...new Set([...pinned, ...recent])].slice(0, 6);
    updateResults(combined, 'Recent & Pinned Scrolls');
  }

  // Wire search input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const sectionParam =
        page === 'directory' ? getQueryParam('section') || '' : '';
      const list = searchScrolls(searchInput.value, sectionParam);
      let title = 'Search Results';
      if (!searchInput.value) {
        if (page === 'home') title = 'Featured Scrolls';
        if (page === 'directory') title = 'All Entries';
      }
      updateResults(list, title);
    });
  }

  // Wire filter buttons (directory)
  if (filterButtons && filterButtons.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section || '';

        // Visual state
        filterButtons.forEach(b => {
          b.style.backgroundColor = '';
          b.style.color = '';
        });
        btn.style.backgroundColor = '#003366';
        btn.style.color = '#fff';

        const list = searchScrolls(searchInput ? searchInput.value : '', section);
        let title = 'All Entries';
        if (section) {
          title = `Entries in ${section.charAt(0).toUpperCase() + section.slice(1)}`;
        }
        updateResults(list, title);

        // Update query param (without reload)
        const url = new URL(window.location.href);
        if (section) {
          url.searchParams.set('section', section);
        } else {
          url.searchParams.delete('section');
        }
        window.history.replaceState({}, '', url.toString());
      });
    });
  }
})();
