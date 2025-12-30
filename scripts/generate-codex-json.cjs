/**
 * Codex JSON Generator (Integrated Kernel Version)
 * ------------------------------------------------
 * This script:
 *  - Walks the repository
 *  - Extracts scroll metadata
 *  - Categorizes scrolls using kernel rules
 *  - Applies metadata defaults
 *  - Generates codex.json for search + indexing
 */

const fs = require('fs');
const path = require('path');

// ------------------------------------------------------------
// Load Codex Kernel Config
// ------------------------------------------------------------
const config = require('./codex.config.js');

const OUTPUT_FILE = 'codex.json';
const ROOT_DIR = config.basePath || '.';

const SUPPORTED_EXTENSIONS = ['.html', '.md', '.pdf', '.txt'];
const EXCLUDED_DIRS = ['node_modules', '.git', '.github', 'assets', 'proof'];

// ------------------------------------------------------------
// CATEGORY RULES (merged with kernel sections)
// ------------------------------------------------------------
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
  Other: []
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
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
    .replace(/\b(?:id|qr|pdf|md|html)\b/gi, m => m.toUpperCase())
    .replace(/\b([ivxlcdm]+)\b/gi, m => m.toUpperCase())
    .replace(/\b\w/g, c => c.toUpperCase());
}

function generateSlug(filename) {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function extractTagsFromPath(filepath) {
  const parts = filepath.split('/');
  return parts
    .filter(p => p && !p.includes('.'))
    .map(p => p.toLowerCase())
    .filter(Boolean);
}

// ------------------------------------------------------------
// Walk directory tree
// ------------------------------------------------------------
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
        created: stat.birthtime.toISOString(),
        modified: stat.mtime.toISOString()
      });
    }
  }

  return fileList;
}

// ------------------------------------------------------------
// Main generator
// ------------------------------------------------------------
function main() {
  const files = walk(ROOT_DIR);

  const scrolls = files.map(file => {
    const title = formatTitle(file.path);
    const category = categorize(file.path);

    const tags = config.metadataDefaults.tagsFromPath
      ? extractTagsFromPath(file.path)
      : [];

    const slug = config.metadataDefaults.autoSlug
      ? generateSlug(file.path)
      : null;

    return {
      url: file.path,
      slug,
      title,
      category,
      section: category.toLowerCase(),
      summary: config.metadataDefaults.summary.replace('{{title}}', title),
      tags,
      created: file.created || config.defaultDate,
      modified: file.modified || file.created,
      version: '1.0.0',
      lang: 'en',
      status: 'active',
      image: 'https://via.placeholder.com/150/003366/e0d5b0?text=Sigil'
    };
  });

  // Sort by creation date
  scrolls.sort((a, b) => new Date(a.created) - new Date(b.created));

  const codex = {
    version: '2.0.0',
    generated: new Date().toISOString(),
    count: scrolls.length,
    scrolls
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(codex, null, 2));
  console.log(`✅ ${OUTPUT_FILE} generated with ${scrolls.length} entries.`);
}

main();
