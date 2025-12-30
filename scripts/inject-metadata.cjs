#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function walk(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else if (entry.name.endsWith('.html')) callback(full);
  }
}

function inject(file) {
  let html = fs.readFileSync(file, 'utf8');

  if (!html.includes('<meta name="date"')) {
    const date = new Date().toISOString().split('T')[0];
    html = html.replace(
      '</head>',
      `  <meta name="date" content="${date}" />\n</head>`
    );
    fs.writeFileSync(file, html);
  }
}

walk(ROOT, inject);

console.log("✅ Metadata injection complete.");
