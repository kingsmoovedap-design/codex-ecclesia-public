const fs = require('fs');
const path = require('path');

const CODEX_FILE = 'codex.json';
const OUTPUT_FILE = 'all-scrolls.html';

function loadCodex() {
  const raw = fs.readFileSync(CODEX_FILE, 'utf-8');
  const data = JSON.parse(raw);
  return data.scrolls || [];
}

function groupByCategory(scrolls) {
  const grouped = {};
  for (const scroll of scrolls) {
    const category = scroll.category || 'Other';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(scroll);
  }
  return grouped;
}

function generateHTML(grouped) {
  let html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>☩ All Scrolls</title>
<link rel="stylesheet" href="style.css" />
<style>
  body { font-family: Georgia, serif; background: #fdfcf9; color: #222; padding: 2em; }
  h1, h2 { color: #003366; }
  ul { list-style: none; padding-left: 0; }
  li { margin: 0.5em 0; }
  a { color: #003366; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head><body>
<h1>☩ All Scrolls & Instruments</h1>
<p><a href="index.html">← Return to Codex Ecclesia Public</a></p>`;

  for (const [category, items] of Object.entries(grouped)) {
    html += `<h2>${category}</h2><ul>`;
    for (const item of items.sort((a, b) => a.title.localeCompare(b.title))) {
      html += `<li><a href="${item.url}">${item.title}</a></li>`;
    }
    html += '</ul>';
  }

  html += '</body></html>';
  return html;
}

function main() {
  const scrolls = loadCodex();
  const grouped = groupByCategory(scrolls);
  const html = generateHTML(grouped);
  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`✅ ${OUTPUT_FILE} generated with ${scrolls.length} entries from codex.json`);
}

main();
