(async function loadCodex() {
  const res = await fetch('manifest.json');
  const data = await res.json();
  const items = data.items || [];

  const sections = {
    core: [],
    scrolls: [],
    ministries: [],
    codices: [],
    treaties: [],
    tools: []
  };

  for (const item of items) {
    const section = item.section?.toLowerCase() || 'core';
    if (sections[section]) {
      sections[section].push(item);
    }
  }

  for (const [section, entries] of Object.entries(sections)) {
    const grid = document.getElementById(`${section}-grid`);
    if (!grid) continue;

    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'card';

      const h3 = document.createElement('h3');
      h3.textContent = entry.title;

      const p = document.createElement('p');
      p.textContent = entry.summary || 'No summary available.';

      const a = document.createElement('a');
      a.href = entry.path;
      a.textContent = 'Open →';

      card.appendChild(h3);
      card.appendChild(p);
      card.appendChild(a);
      grid.appendChild(card);
    });
  }
})();
