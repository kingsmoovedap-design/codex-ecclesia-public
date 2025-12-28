const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'all-scrolls.html';
const ROOT_DIR = '.';

const categories = {
  scrolls: ['scroll', 'notice', 'affidavit', 'declaration', 'proof', 'coronation'],
  codices: ['codex'],
  treaties: ['treaty', 'recognition'],
  tools: ['qr', 'verify', 'hash', 'console', 'forge', 'generator', 'manifest'],
  heirs: ['heir', 'queen', 'matriarch', 'omega'],
  ministries: ['ministry'],
};

function categorize(filename) {
  const lower = filename.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'other';
}

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, fileList);
    } else if (file.endsWith('.html') || file.endsWith('.md')) {
      fileList.push(fullPath.replace('./', ''));
    }
  }
  return fileList;
}

function generateHTML(grouped) {
  let html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>☩ All Scrolls</title>
<link rel="stylesheet" href="style.css" />
</head><body>
<h1>☩ All Scrolls & Instruments</h1>
<p><a href="index.html">← Return to Codex Ecclesia Public</a></p>`;

  for (const [category, files] of Object.entries(grouped)) {
    html += `<h2>${category.toUpperCase()}</h2><ul>`;
    for (const file of files.sort()) {
      const name = path.basename(file).replace(/[-_]/g, ' ').replace(/\.(html|md)/, '');
      html += `<li><a href="${file}">${name}</a></li>`;
    }
    html += '</ul>';
  }

  html += '</body></html>';
  return html;
}

function main() {
  const files = walk(ROOT_DIR);
  const grouped = {};
  for (const file of files) {
    const category = categorize(file);
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(file);
  }
  const html = generateHTML(grouped);
  fs.writeFileSync(OUTPUT_FILE, html);
  console.log(`✅ ${OUTPUT_FILE} generated with ${files.length} entries.`);
}

main();
