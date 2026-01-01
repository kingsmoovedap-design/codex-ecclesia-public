document.addEventListener('DOMContentLoaded', async () => {
  // ------------------------------------------------------------
  // 1. Load manifest.json
  // ------------------------------------------------------------
  let items = [];
  try {
    const response = await fetch('manifest.json', { cache: 'no-store' });
    const data = await response.json();
    items = data.items || [];
  } catch (e) {
    console.error('⚠️ Failed to load manifest.json', e);
    return;
  }

  if (!items.length) return;

  // ------------------------------------------------------------
  // 2. Group by section + collect tags
  // ------------------------------------------------------------
  const sections = {};
  const allTags = new Set();

  for (const item of items) {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
    (item.tags || []).forEach(tag => allTags.add(tag));
  }

  // ------------------------------------------------------------
  // 3. Inject Global Search UI
  // ------------------------------------------------------------
  const main = document.querySelector('.main-content');
  const firstSection = document.querySelector('section');

  const ui = document.createElement('div');
  ui.className = 'codex-search-ui';
  ui.innerHTML = `
    <div class="codex-search-container">
      <input type="text" id="searchBox" placeholder="Search scrolls..." autocomplete="off" />
      <button id="clearFilters" class="clear-btn" style="display:none;">Clear</button>
      <div id="tagFilters" class="tag-filter-row"></div>
    </div>
  `;
  main.insertBefore(ui, firstSection);

  const searchBox = document.getElementById('searchBox');
  const clearBtn = document.getElementById('clearFilters');
  const tagFilters = document.getElementById('tagFilters');

  // ------------------------------------------------------------
  // 4. Render Section Cards
  // ------------------------------------------------------------
  for (const [section, entries] of Object.entries(sections)) {
    const container = document.getElementById(`${section}-list`);
    if (!container) continue;

    const fragment = document.createDocumentFragment();

    for (const item of entries) {
      const card = document.createElement('div');
      card.className = 'card';

      card.dataset.tags = (item.tags || []).join(',');
      card.dataset.title = item.title.toLowerCase();
      card.dataset.summary = (item.summary || '').toLowerCase();

      const link = document.createElement('a');
      link.href = item.path;

      const title = document.createElement('h3');
      title.textContent = item.title;

      const summary = document.createElement('p');
      summary.textContent = item.summary || '';

      link.appendChild(title);
      card.appendChild(link);
      card.appendChild(summary);
      fragment.appendChild(card);
    }

    container.appendChild(fragment);
  }

  // ------------------------------------------------------------
  // 5. Render Tag Filters
  // ------------------------------------------------------------
  for (const tag of allTags) {
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = tag;
    btn.onclick = () => applyFilters({ tag });
    tagFilters.appendChild(btn);
  }

  // ------------------------------------------------------------
  // 6. Fuzzy Search Engine
  // ------------------------------------------------------------
  function fuzzyMatch(text, query) {
    if (!query) return true;
    text = text.toLowerCase();
    query = query.toLowerCase();

    let tIndex = 0;
    for (const q of query) {
      tIndex = text.indexOf(q, tIndex);
      if (tIndex === -1) return false;
      tIndex++;
    }
    return true;
  }

  // ------------------------------------------------------------
  // 7. Combined Search + Tag Filtering
  // ------------------------------------------------------------
  let activeTag = null;

  function applyFilters({ query = null, tag = null } = {}) {
    if (query !== null) query = query.toLowerCase();
    if (tag !== null) activeTag = tag;

    const cards = document.querySelectorAll('.card');

    let anyHidden = false;

    for (const card of cards) {
      const title = card.dataset.title;
      const summary = card.dataset.summary;
      const tags = card.dataset.tags.split(',');

      const matchesQuery =
        !query ||
        fuzzyMatch(title, query) ||
        fuzzyMatch(summary, query);

      const matchesTag =
        !activeTag || tags.includes(activeTag);

      const visible = matchesQuery && matchesTag;
      card.style.display = visible ? '' : 'none';

      if (!visible) anyHidden = true;
    }

    highlightActiveTag();
    clearBtn.style.display = activeTag || query ? 'inline-block' : 'none';
  }

  // ------------------------------------------------------------
  // 8. Active Tag Highlighting
  // ------------------------------------------------------------
  function highlightActiveTag() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === activeTag);
    });
  }

  // ------------------------------------------------------------
  // 9. Search Input Listener + Persistence
  // ------------------------------------------------------------
  searchBox.addEventListener('input', e => {
    const value = e.target.value;
    localStorage.setItem('lastSearch', value);
    applyFilters({ query: value });
  });

  const lastSearch = localStorage.getItem('lastSearch');
  if (lastSearch) {
    searchBox.value = lastSearch;
    applyFilters({ query: lastSearch });
  }

  // ------------------------------------------------------------
  // 10. Clear Filters Button
  // ------------------------------------------------------------
  clearBtn.onclick = () => {
    activeTag = null;
    searchBox.value = '';
    localStorage.removeItem('lastSearch');
    applyFilters({ query: '' });
  };

  // ------------------------------------------------------------
  // 11. Section Collapsing
  // ------------------------------------------------------------
  document.querySelectorAll('section h2').forEach(header => {
    header.style.cursor = 'pointer';
    header.onclick = () => {
      const list = header.nextElementSibling;
      list.style.display = list.style.display === 'none' ? '' : 'none';
    };
  });

  // ------------------------------------------------------------
  // 12. Keyboard Navigation (↑ ↓ Enter)
  // ------------------------------------------------------------
  document.addEventListener('keydown', e => {
    const cards = [...document.querySelectorAll('.card')].filter(
      c => c.style.display !== 'none'
    );
    if (!cards.length) return;

    let index = cards.findIndex(c => c.classList.contains('focus'));

    if (e.key === 'ArrowDown') {
      if (index >= 0) cards[index].classList.remove('focus');
      index = (index + 1) % cards.length;
      cards[index].classList.add('focus');
      cards[index].scrollIntoView({ block: 'nearest' });
    }

    if (e.key === 'ArrowUp') {
      if (index >= 0) cards[index].classList.remove('focus');
      index = (index - 1 + cards.length) % cards.length;
      cards[index].classList.add('focus');
      cards[index].scrollIntoView({ block: 'nearest' });
    }

    if (e.key === 'Enter' && index >= 0) {
      const link = cards[index].querySelector('a');
      if (link) window.location.href = link.href;
    }
  });
});
