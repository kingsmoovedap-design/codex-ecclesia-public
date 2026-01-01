// generate-scroll-archive.js
const fs = require('fs');
const path = require('path');

const codexPath = path.join(__dirname, 'codex.json');
const outputPath = path.join(__dirname, 'scroll-archive.html');

const template = (scrolls) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>📚 Scroll Archive | Codex Ecclesia</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond&display=swap" rel="stylesheet"/>
  <style>
    body {
      font-family: 'EB Garamond', serif;
      background: #fdfaf6;
      color: #2c1a0f;
      padding: 2rem;
      max-width: 960px;
      margin: auto;
    }
    h1 {
      text-align: center;
      font-size: 2.2rem;
      color: #5e3b1d;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 0.5rem;
    }
    .scroll-entry {
      margin: 1.5rem 0;
      padding: 1rem;
      border-left: 4px solid #d4af37;
    }
    .scroll-entry h2 {
      margin: 0;
      font-size: 1.3rem;
    }
    .scroll-entry p {
      margin: 0.3rem 0;
      font-size: 0.95rem;
      color: #555;
    }
    .category {
      font-weight: bold;
      color: #5e3b1d;
    }
  </style>
</head>
<body>
  <h1>📚 Archive of Living Scrolls</h1>
  ${scrolls.map(scroll => `
    <div class="scroll-entry">
      <h2><a href="${scroll.url}">${scroll.title}</a></h2>
      <p><span class="category">${scroll.category}</span> — ${new Date(scroll.created).toLocaleDateString()}</p>
    </div>
  `).join('')}
</body>
</html>`;

fs.readFile(codexPath, 'utf8', (err, data) => {
  if (err) {
    console.error('❌ Failed to read codex.json:', err);
    return;
  }

  try {
    const scrolls = JSON.parse(data).sort((a, b) => new Date(b.created) - new Date(a.created));
    const html = template(scrolls);
    fs.writeFileSync(outputPath, html);
    console.log('✅ scroll-archive.html generated successfully.');
  } catch (e) {
    console.error('❌ Failed to parse or render scrolls:', e);
  }
});
