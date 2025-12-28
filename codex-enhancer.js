document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('manifest.json');
  const data = await response.json();
  const items = data.items || [];

  const sections = {};
  const allTags = new Set();

  // Group items by section and collect tags
  items.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
    (item.tags || []).forEach(tag => allTags.add(tag));
  });

  // Render cards
  for (const [section, entries] of Object.entries(sections)) {
    const container = document.getElementById(`${section}-list`);
    if (!container) continue;

    entries.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-tags', (item.tags || []).join(','));
      card.setAttribute('data-title', item.title.toLowerCase());
      card.setAttribute('data-summary', (item.summary || '').toLowerCase());

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

  // Create search + tag UI
  const ui = document.createElement('div');
  ui.innerHTML = `
    <div style="margin: 2em 0;">
      <input type="text" id="searchBox" placeholder="Search scrolls..." style="padding: 0.5em; width: 60%; max-width: 400px;" />
      <div id="tagFilters" style="margin-top: 1em;"></div>
    </div>
  `;
  document.querySelector('.main-content').insertBefore(ui, document.querySelector('section'));

  // Render tag filters
  const tagFilters = document.getElementById('tagFilters');
  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.style = 'margin: 0.2em; padding: 0.4em 0.8em; border: none; background: #003366; color: white; cursor: pointer;';
    btn.onclick = () => filterByTag(tag);
    tagFilters.appendChild(btn);
  });

  // Search logic
  document.getElementById('searchBox').addEventListener('input', e => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const title = card.getAttribute('data-title');
      const summary = card.getAttribute('data-summary');
      card.style.display = (title.includes(query) || summary.includes(query)) ? '' : 'none';
    });
  });

  // Tag filter logic
  function filterByTag(tag) {
    document.querySelectorAll('.card').forEach(card => {
      const tags = card.getAttribute('data-tags').split(',');
      card.style.display = tags.includes(tag) ? '' : 'none';
    });
  }
});
