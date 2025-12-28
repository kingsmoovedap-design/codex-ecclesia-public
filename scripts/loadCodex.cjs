(async function loadCodex() {
  try {
    const res = await fetch('manifest.json');
    if (!res.ok) throw new Error(`Failed to fetch manifest: ${res.status}`);
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

    // Organize items by section
    for (const item of items) {
      const section = item.section?.toLowerCase() || 'core';
      if (sections[section]) {
        sections[section].push(item);
      } else {
        console.warn(`⚠️ Unknown section "${section}" in item:`, item);
      }
    }

    // Render each section
    for (const [section, entries] of Object.entries(sections)) {
      const grid = document.getElementById(`${section}-grid`);
      if (!grid) {
        console.warn(`⚠️ No grid found for section: ${section}`);
        continue;
      }

      entries.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style = 'margin: 1em 0; padding: 1em; background: var(--card-bg, #fff); color: var(--card-text, #000); border-left: 4px solid #003366; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);';

        const h3 = document.createElement('h3');
        h3.textContent = entry.title;

        const p = document.createElement('p');
        p.textContent = entry.summary || 'No summary available.';

        const a = document.createElement('a');
        a.href = entry.path;
        a.textContent = 'Open →';
        a.style = 'display: inline-block; margin-top: 0.5em; color: #003366; text-decoration: underline;';

        card.appendChild(h3);
        card.appendChild(p);
        card.appendChild(a);
        grid.appendChild(card);
      });
    }
  } catch (error) {
    console.error('🛑 Codex load failed:', error);
    const main = document.querySelector('.main-content') || document.body;
    const errorMsg = document.createElement('p');
    errorMsg.textContent = '⚠️ Failed to load the Codex. Please try again later.';
    errorMsg.style = 'color: red; font-weight: bold; padding: 1em;';
    main.appendChild(errorMsg);
  }
})();
