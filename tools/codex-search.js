(async function () {
  const CODEX_URL = 'codex.json';

  let scrolls = [];

  const searchInput = document.getElementById('searchInput');
  const resultsGrid = document.getElementById('resultsGrid');
  const resultsEmpty = document.getElementById('resultsEmpty');
  const resultsTitle = document.getElementById('resultsTitle');
  const filterButtons = document.querySelectorAll('.filterButton');

  const path = window.location.pathname;
  const page = path.endsWith('all-scrolls.html')
    ? 'directory'
    : path.endsWith('omega-portal.html')
    ? 'omega'
    : 'home';

  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }

  try {
    const res = await fetch(CODEX_URL, { cache: 'no-cache' });
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

  function renderCard(item) {
    const div = document.createElement('div');
    div.className = 'card';

    const created = item.created ? new Date(item.created) : null;
    const createdStr = created ? created.toLocaleDateString() : '';

    div.innerHTML = `
      <h3>${item.title || 'Untitled Scroll'}</h3>
      <p class="card-meta">
        ${(item.section || '').toUpperCase()}${
          item.category ? ' • ' + item.category : ''
        }${createdStr ? ' • ' + createdStr : ''}
      </p>
      <p>${item.summary || ''}</p>
      <p class="card-link-row">
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

  // Initial page-specific render
  if (page === 'home') {
    const pinned = scrolls.filter(s => s.pinned);
    const recent = [...scrolls]
      .filter(s => !s.pinned)
      .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
      .slice(0, Math.max(0, 6 - pinned.length));
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

    if (sectionParam) {
      filterButtons.forEach(btn => {
        if (btn.dataset.section === sectionParam) {
          btn.classList.add('filter-active');
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

  // Search wiring
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const sectionParam = page === 'directory' ? getQueryParam('section') || '' : '';
      const list = searchScrolls(searchInput.value, sectionParam);
      let title = 'Search Results';
      if (!searchInput.value) {
        if (page === 'home') title = 'Featured Scrolls';
        if (page === 'directory') title = 'All Entries';
        if (page === 'omega') title = 'Recent & Pinned Scrolls';
      }
      updateResults(list, title);
    });
  }

  // Filter buttons (directory)
  if (filterButtons && filterButtons.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section || '';

        filterButtons.forEach(b => b.classList.remove('filter-active'));
        btn.classList.add('filter-active');

        const list = searchScrolls(searchInput ? searchInput.value : '', section);
        let title = 'All Entries';
        if (section) {
          title = `Entries in ${section.charAt(0).toUpperCase() + section.slice(1)}`;
        }
        updateResults(list, title);

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
