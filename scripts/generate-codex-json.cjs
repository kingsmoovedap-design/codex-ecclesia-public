const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'codex.json';
const ROOT_DIR = '.';

const CATEGORY_RULES = {
  Scrolls: ['scroll', 'notice', 'affidavit', 'declaration', 'proof', 'coronation'],
  Heirs: ['heir', 'queen', 'matriarch', 'omega'],
  Codices: ['codex', 'binder', 'ledger'],
  Treaties: ['treaty', 'recognition', 'embassy', 'concord'],
  Tools: ['qr', 'verify', 'hash', 'console', 'forge', 'generator', 'manifest'],
  Ministries: ['ministry'],
  Trusts: ['trust', 'fund'],
  Identity: ['passport', 'id', 'registry'],
  Index: ['index', 'directory'],
};

const SUPPORTED_EXTENSIONS = ['.html', '.md', '.pdf', '.txt'];
const EXCLUDED_DIRS = ['node_modules', '.git', '.github', 'assets', 'proof'];

function categorize(filename) {
  const lower = filename.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some(k => lower.includes(k))) return category;
  }
  return 'Other';
}

function formatTitle(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b(?:id|qr|pdf|md|html)\b/gi, match => match.toUpperCase())
    .replace(/\b([ivxlcdm]+)\b/gi, match => match.toUpperCase()) // Roman numerals
    .replace(/\b\w/g, c => c.toUpperCase());
}

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
        walk(fullPath, fileList);
      }
    } else if (SUPPORTED_EXTENSIONS.includes(path.extname(entry.name))) {
      const stat = fs.statSync(fullPath);
      fileList.push({
        path: fullPath.replace(/\\/g, '/').replace(/^\.\//, ''),
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

  scrolls.sort((a, b) => new Date(a.created) - new Date(b.created));

  const codex = { scrolls };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(codex, null, 2));
  console.log(`✅ ${OUTPUT_FILE} generated with ${scrolls.length} entries.`);
}

main();
