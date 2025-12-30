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

  if (items.length === 0) {
    console.warn('⚠️ No items found in manifest.json');
    return;
  }

  // ------------------------------------------------------------
  // 2. Group by section + collect tags
  // ------------------------------------------------------------
  const sections = {};
  const allTags = new Set();

  items.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
    (item.tags || []).forEach(tag => allTags.add(tag));
  });

  // ------------------------------------------------------------
  // 3. Render section cards
  // ------------------------------------------------------------
  for (const [section, entries] of Object.entries(sections)) {
    const container = document.getElementById(`${section}-list`);
    if (!container) continue;

    entries.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';

      // searchable attributes
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
      container.appendChild(card);
    });
  }

  // ------------------------------------------------------------
  // 4. Build global search + tag UI
  // ------------------------------------------------------------
  const main = document.querySelector('.main-content');
  const firstSection = document.querySelector('section');

  const ui = document.createElement('div');
  ui.innerHTML = `
    <div style="margin: 2em 0;">
      <input type="text" id="searchBox" placeholder="Search scrolls..." 
        style="padding: 0.5em; width: 60%; max-width: 400px;" />
      <div id="tagFilters" style="margin-top: 1em;"></div>
    </div>
  `;
  main.insertBefore(ui, firstSection);

  // ------------------------------------------------------------
  // 5. Render tag filter buttons
  // ------------------------------------------------------------
  const tagFilters = document.getElementById('tagFilters');

  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.style = `
      margin: 0.2em; 
      padding: 0.4em 0.8em; 
      border: none; 
      background: #003366; 
      color: white; 
      cursor: pointer;
      border-radius: 4px;
    `;
    btn.onclick = () => applyFilters({ tag });
    tagFilters.appendChild(btn);
  });

  // ------------------------------------------------------------
  // 6. Combined Search + Tag Filtering Engine
  // ------------------------------------------------------------
  let activeTag = null;

  function applyFilters({ query = null, tag = null } = {}) {
    if (query !== null) query = query.toLowerCase();
    if (tag !== null) activeTag = tag;

    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      const title = card.dataset.title;
      const summary = card.dataset.summary;
      const tags = card.dataset.tags.split(',');

      const matchesQuery =
        !query || title.includes(query) || summary.includes(query);

      const matchesTag =
        !activeTag || tags.includes(activeTag);

      card.style.display = matchesQuery && matchesTag ? '' : 'none';
    });
  }

  // ------------------------------------------------------------
  // 7. Search input listener
  // ------------------------------------------------------------
  const searchBox = document.getElementById('searchBox');

  searchBox.addEventListener('input', e => {
    applyFilters({ query: e.target.value });
  });

  // ------------------------------------------------------------
  // 8. Restore last search
  // ------------------------------------------------------------
  const lastSearch = localStorage.getItem('lastSearch');
  if (lastSearch) {
    searchBox.value = lastSearch;
    applyFilters({ query: lastSearch });
  }

  searchBox.addEventListener('input', e => {
    localStorage.setItem('lastSearch', e.target.value);
  });

  // ------------------------------------------------------------
  // 9. Tag filter function
  // ------------------------------------------------------------
  function filterByTag(tag) {
    activeTag = tag;
    applyFilters({ query: searchBox.value });
  }
});
