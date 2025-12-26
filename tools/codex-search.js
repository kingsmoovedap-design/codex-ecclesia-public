document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('manifest.json');
  const data = await response.json();
  const items = data.items || [];

  // Create UI
  const main = document.querySelector('.main-content');

  const sectionFilter = document.createElement('select');
  sectionFilter.innerHTML = '<option value="">All Sections</option>' +
    [...new Set(items.map(i => i.section))].map(s => `<option value="${s}">${s}</option>`).join('');
  sectionFilter.style = 'margin: 0.5em 0; padding: 0.5em;';
  main.prepend(sectionFilter);

  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = 'Search all scrolls...';
  searchBox.style = 'width: 100%; padding: 0.75em; font-size: 1em; margin: 0.5em 0;';
  main.prepend(searchBox);

  const results = document.createElement('div');
  results.id = 'search-results';
  main.appendChild(results);

  const scrollCache = [];

  for (const item of items) {
    try {
      const res = await fetch(item.path);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const bodyText = doc.body ? doc.body.innerText : '';
      scrollCache.push({
        title: item.title,
        path: item.path,
        summary: item.summary || '',
        tags: item.tags || [],
        section: item.section,
        content: bodyText.toLowerCase()
      });
    } catch (e) {
      console.warn('Failed to fetch scroll:', item.path);
    }
  }

  function highlight(text, query) {
    return text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
  }

  function renderResults(query, section) {
    results.innerHTML = '';
    if (!query && !section) return;

    const matches = scrollCache.filter(s =>
      (!section || s.section === section) &&
      (s.title.toLowerCase().includes(query) ||
       s.summary.toLowerCase().includes(query) ||
       s.content.includes(query))
    );

    localStorage.setItem('lastSearch', query);

    if (matches.length === 0) {
      results.innerHTML = '<p>No scrolls match your query.</p>';
      return;
    }

    matches.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style = 'margin: 1em 0; padding: 1em; background: var(--card-bg, #fff); color: var(--card-text, #000); border-left: 4px solid #003366;';
      card.setAttribute('data-preview', s.content.slice(0, 300) + '...');

      const link = document.createElement('a');
      link.href = s.path;
      link.innerHTML = `<h3>${highlight(s.title, query)}</h3>`;

      const snippetIndex = s.content.indexOf(query);
      const snippet = snippetIndex !== -1
        ? '...' + s.content.slice(Math.max(0, snippetIndex - 50), snippetIndex + 100) + '...'
        : s.summary;

      const summary = document.createElement('p');
      summary.innerHTML = highlight(snippet, query);

      const icon = document.createElement('span');
      icon.textContent = s.section === 'ministries' ? '🏛️' :
                         s.section === 'scrolls' ? '📜' :
                         s.section === 'codices' ? '📘' :
                         s.section === 'treaties' ? '🤝' : '📄';
      icon.style = 'margin-right: 0.5em;';

      card.prepend(icon);
      card.appendChild(link);
      card.appendChild(summary);
      results.appendChild(card);
    });
  }

  searchBox.addEventListener('input', () => {
    renderResults(searchBox.value.toLowerCase(), sectionFilter.value);
  });

  sectionFilter.addEventListener('change', () => {
    renderResults(searchBox.value.toLowerCase(), sectionFilter.value);
  });
});
