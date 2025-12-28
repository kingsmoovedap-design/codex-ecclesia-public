const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'codex.json';
const ROOT_DIR = '.';

const CATEGORY_RULES = {
  Scrolls: ['scroll', 'notice', 'affidavit', 'declaration', 'proof', 'coronation'],
  Heirs: ['heir', 'queen', 'matriarch', 'omega'],
  Codices: ['codex'],
  Treaties: ['treaty', 'recognition'],
  Tools: ['qr', 'verify', 'hash', 'console', 'forge', 'generator', 'manifest'],
  Ministries: ['ministry'],
};

const SUPPORTED_EXTENSIONS = ['.html', '.md', '.pdf', '.txt'];

function categorize(filename) {
  const lower = filename.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'Other';
}

function formatTitle(filename) {
  return filename
    .replace(/^.*[\\/]/, '')
    .replace(/\.(html|md|pdf|txt)$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.github', 'assets'].includes(file)) {
        walk(fullPath, fileList);
      }
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(file))) {
      fileList.push({
        path: fullPath.replace(/\\/g, '/').replace('./', ''),
        created: stat.birthtime.toISOString()
      });
    }
  }
  return fileList;
}

function main() {
  const files = walk(ROOT_DIR);
  const scrolls = files.map(file => ({
    url: file.path,
    title: formatTitle(file.path),
    category: categorize(file.path),
    created: file.created
  }));

  const codex = { scrolls };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(codex, null, 2));
  console.log(`✅ ${OUTPUT_FILE} generated with ${scrolls.length} entries.`);
}

main();
