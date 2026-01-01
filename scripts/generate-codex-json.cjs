// scripts/generate-codex-json.cjs
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../codex.json');
const ROOT_DIR = path.join(__dirname, '..');

const SECTIONS = {
  core: ['index.html', 'codex.html', 'codex-ecclesia.html', 'codex-ecclesia-constitution.html'],
  scrolls: 'scrolls',
  ministries: 'ministries',
  treaties: 'treaties',
  tools: 'tools',
  codices: 'codices'
};

function getScrollsFromDir(dir, section) {
  const fullPath = path.join(ROOT_DIR, dir);
  if (!fs.existsSync(fullPath)) return [];

  return fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.html'))
    .map(file => ({
      title: formatTitle(file),
      path: path.join(dir, file).replace(/\\/g, '/'),
      section,
      tags: [],
      summary: '',
      created: new Date().toISOString()
    }));
}

function formatTitle(filename) {
  return filename
    .replace('.html', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function generateCodex() {
  let scrolls = [];

  // Add core files manually
  SECTIONS.core.forEach(file => {
    const title = formatTitle(file);
    scrolls.push({
      title,
      path: file,
      section: 'core',
      tags: [],
      summary: '',
      created: new Date().toISOString()
    });
  });

  // Add other sections dynamically
  Object.entries(SECTIONS).forEach(([section, dir]) => {
    if (section === 'core') return;
    scrolls = scrolls.concat(getScrollsFromDir(dir, section));
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ scrolls }, null, 2));
  console.log(`✅ codex.json generated with ${scrolls.length} entries.`);
}

generateCodex();
