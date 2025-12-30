document.addEventListener('DOMContentLoaded', async () => {
  const main = document.querySelector('.main-content');
  if (!main) {
    console.error('⚠️ .main-content element not found.');
    return;
  }

  // -----------------------------
  // UI: Loading indicator
  // -----------------------------
  const loading = document.createElement('p');
  loading.textContent = '📜 Gathering scrolls...';
  loading.style = 'font-style: italic; opacity: 0.8; margin: 1em 0;';
  main.appendChild(loading);

  // -----------------------------
  // Fetch manifest.json
  // -----------------------------
  let items = [];
  try {
    const response = await fetch('manifest.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    items = Array.isArray(data.items) ? data.items : [];
  } catch (e) {
    loading.textContent = '⚠️ Failed to load manifest.json';
    console.error('Manifest load error:', e);
    return;
  }

  if (items.length === 0) {
    loading.textContent = '⚠️ No scrolls found in manifest.json';
    return;
  }

  // -----------------------------
  // UI: Section filter
  // -----------------------------
  const sectionFilter = document.createElement('select');
  sectionFilter.innerHTML =
    '<option value="">All Sections</option>' +
    [...new Set(items.map(i => i.section).filter(Boolean))]
      .sort()
      .map(s => `<option value="${s}">${s}</option>`)
      .join('');
  sectionFilter.style = 'margin: 0.5em 0; padding: 0.5em;';
  main.prepend(sectionFilter);

  // -----------------------------
  // UI: Search box
  // -----------------------------
  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = 'Search all scrolls...';
  searchBox.autocomplete = 'off';
  searchBox.style = 'width: 100%; padding: 0.75em; font-size: 1em; margin: 0.5em 0;';
  main.prepend(searchBox);

  // -----------------------------
  // UI: Results container
  // -----------------------------
  const results = document.createElement('div');
  results.id = 'search-results';
  results.style = 'margin-top: 1em;';
  main.appendChild(results);

  // -----------------------------
  // Fetch and cache scrolls (parallel)
  // -----------------------------
  const scrollCache = [];

  await Promise.all(
    items.map(async item => {
      if (!item || !item.path) return;
      try {
        const res = await fetch(item.path, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyText = doc.body ? doc.body.innerText : '';

        const title = item.title || item.path;
        const summary = item.summary || '';
        const tags = Array.isArray(item.tags) ? item.tags : [];
        const section = item.section || '';

        scrollCache.push({
          // Original fields
          title,
          path: item.path,
          summary,
          tags,
          section,
          content: bodyText,

          // Lowercased for faster search
          _title: title.toLowerCase(),
          _summary: summary.toLowerCase(),
          _content: bodyText.toLowerCase(),
          _section: section.toLowerCase(),
          _tags: tags.map(t => String(t).toLowerCase())
        });
      } catch (e) {
        console.warn(`⚠️ Failed to fetch scroll: ${item.path}`, e);
      }
    })
  );

  // Remove loading
  main.removeChild(loading);

  if (scrollCache.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = '⚠️ No scroll content could be loaded.';
    main.appendChild(msg);
    return;
  }

  // -----------------------------
  // Helper: escape regex
  // -----------------------------
  function escapeRegex(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  // -----------------------------
  // Helper: highlight matches
  // -----------------------------
  function highlight(text, query) {
    if (!query) return text;
    const safe = escapeRegex(query);
    const re = new RegExp(`(${safe})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  // -----------------------------
  // Helper: icon by section
  // -----------------------------
  function sectionIcon(section) {
    switch (section) {
      case 'ministries':
        return '🏛️';
      case 'scrolls':
        return '📜';
      case 'codices':
        return '📘';
      case 'treaties':
        return '🤝';
      default:
        return '📄';
    }
  }

  // -----------------------------
  // Render results
  // -----------------------------
  function renderResults(queryRaw, sectionValue) {
    const query = (queryRaw || '').trim().toLowerCase();
    const sectionLower = (sectionValue || '').trim().toLowerCase();

    results.innerHTML = '';

    if (!query && !sectionLower) {
      return;
    }

    const matches = scrollCache.filter(s => {
      const sectionMatch = !sectionLower || s._section === sectionLower;
      if (!sectionMatch) return false;

      if (!query) return true; // only filtering by section

      return (
        s._title.includes(query) ||
        s._summary.includes(query) ||
        s._content.includes(query) ||
        s._tags.some(t => t.includes(query))
      );
    });

    localStorage.setItem('lastSearch', query);

    if (matches.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = 'No scrolls match your query.';
      results.appendChild(msg);
      return;
    }

    matches.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style = [
        'margin: 1em 0',
        'padding: 1em',
        'background: var(--card-bg, #fff)',
        'color: var(--card-text, #000)',
        'border-left: 4px solid #003366',
        'border-radius: 4px'
      ].join('; ');

      // Icon
      const icon = document.createElement('span');
      icon.textContent = sectionIcon(s.section);
      icon.style = 'margin-right: 0.5em; font-size: 1.2em;';

      // Title link
      const link = document.createElement('a');
      link.href = s.path;
      link.innerHTML = `<h3 style="display: inline;">${highlight(s.title, query)}</h3>`;
      link.style = 'text-decoration: none; color: inherit;';

      // Snippet
      const idx = s._content.indexOf(query);
      let snippetText;
      if (idx !== -1 && query) {
        const start = Math.max(0, idx - 60);
        const end = idx + 140;
        snippetText = '...' + s.content.slice(start, end) + '...';
      } else {
        snippetText = s.summary || s.content.slice(0, 200) + '...';
      }

      const summary = document.createElement('p');
      summary.innerHTML = highlight(snippetText, query);

      // Tags (optional)
      if (s.tags && s.tags.length > 0) {
        const tagsEl = document.createElement('p');
        tagsEl.style = 'margin-top: 0.5em; font-size: 0.9em; opacity: 0.8;';
        tagsEl.textContent = 'Tags: ' + s.tags.join(', ');
        card.appendChild(tagsEl);
      }

      card.appendChild(icon);
      card.appendChild(link);
      card.appendChild(summary);
      results.appendChild(card);
    });
  }

  // -----------------------------
  // Debounce helper
  // -----------------------------
  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  // -----------------------------
  // Event listeners
  // -----------------------------
  const debouncedSearch = debounce(() => {
    renderResults(searchBox.value, sectionFilter.value);
  }, 250);

  searchBox.addEventListener('input', debouncedSearch);
  sectionFilter.addEventListener('change', debouncedSearch);

  // -----------------------------
  // Restore last search
  // -----------------------------
  const lastSearch = localStorage.getItem('lastSearch');
  if (lastSearch) {
    searchBox.value = lastSearch;
    renderResults(lastSearch, '');
  }
});
