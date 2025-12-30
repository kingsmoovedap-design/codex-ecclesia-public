#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CODEX_PATH = path.join(__dirname, '../codex.json');
const ROOT = path.join(__dirname, '..');

function ensureDirExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createScrollHTML({ title, section, summary }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${summary || 'A scroll of the Codex Ecclesia.'}" />
  <meta name="keywords" content="${section || 'scroll'}" />
  <link rel="stylesheet" href="../style.css" />
</head>
<body>
  <header>
    <h1>${title}</h1>
    <p>${summary || 'This scroll has been generated as part of the Codex Ecclesia archive.'}</p>
  </header>
</body>
</html>`;
}

function generateMissingScrolls() {
  if (!fs.existsSync(CODEX_PATH)) {
    console.error('❌ codex.json not found.');
    process.exit(1);
  }

  const codex = JSON.parse(fs.readFileSync(CODEX_PATH, 'utf-8'));
  const scrolls = codex.scrolls || [];

  let createdCount = 0;

  scrolls.forEach(scroll => {
    const filePath = path.join(ROOT, scroll.path);
    if (!fs.existsSync(filePath)) {
      ensureDirExists(filePath);
      const html = createScrollHTML(scroll);
      fs.writeFileSync(filePath, html);
      console.log(`🆕 Created: ${scroll.path}`);
      createdCount++;
    }
  });

  console.log(`\n✅ ${createdCount} missing scroll(s) generated.`);
}

generateMissingScrolls();
