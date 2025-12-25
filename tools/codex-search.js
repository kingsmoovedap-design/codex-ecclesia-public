document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('manifest.json');
  const data = await response.json();
  const items = data.items || [];

  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = 'Search all scrolls...';
  searchBox.style = 'width: 100%; padding: 0.75em; font-size: 1em; margin: 1em 0;';
  document.querySelector('.main-content').prepend(searchBox);

  const results = document.createElement('div');
  results.id = 'search-results';
  document.querySelector('.main-content').appendChild(results);

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

  searchBox.addEventListener('input', () => {
    const query = searchBox.value.toLowerCase();
    results.innerHTML = '';

    if (!query) return;

    const matches = scrollCache.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.summary.toLowerCase().includes(query) ||
      s.content.includes(query)
    );

    if (matches.length === 0) {
      results.innerHTML = '<p>No scrolls match your query.</p>';
      return;
    }

    matches.forEach(s => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style = 'margin: 1em 0; padding: 1em; background: #fff; border-left: 4px solid #003366;';

      const link = document.createElement('a');
      link.href = s.path;
      link.innerHTML = `<h3>${s.title}</h3>`;

      const summary = document.createElement('p');
      summary.textContent = s.summary;

      card.appendChild(link);
      card.appendChild(summary);
      results.appendChild(card);
    });
  });
});
