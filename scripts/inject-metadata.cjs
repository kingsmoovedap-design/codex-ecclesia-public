/**
 * Codex Metadata Injector (Integrated Kernel Version)
 * ---------------------------------------------------
 * This script:
 *  - Scans all Codex sections
 *  - Ensures every scroll has:
 *      <title>
 *      <meta name="description">
 *      <meta name="keywords">
 *      <meta name="date">
 *  - Applies Codex Kernel defaults
 *  - Normalizes titles + tags
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// ------------------------------------------------------------
// Load Codex Kernel Config
// ------------------------------------------------------------
const config = require('../codex.config.js');

const ROOT = path.join(__dirname, '..');
const DEFAULT_DATE = config.defaultDate || '2025-01-01';

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function formatTitleFromFilename(filename) {
  return filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function extractTagsFromPath(filepath) {
  const parts = filepath.split('/');
  return parts
    .filter(p => p && !p.includes('.'))
    .map(p => p.toLowerCase());
}

function injectMetadata(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  const fileName = path.basename(filePath, path.extname(filePath));
  const titleText =
    $('title').text().trim() ||
    formatTitleFromFilename(fileName);

  // ------------------------------------------------------------
  // <title>
  // ------------------------------------------------------------
  if (!$('title').length) {
    $('head').prepend(`<title>${titleText}</title>`);
  }

  // ------------------------------------------------------------
  // <meta name="description">
  // ------------------------------------------------------------
  if (!$('meta[name="description"]').length) {
    const summary = config.metadataDefaults.summary.replace('{{title}}', titleText);
    $('head').append(`<meta name="description" content="${summary}">`);
  }

  // ------------------------------------------------------------
  // <meta name="keywords">
  // ------------------------------------------------------------
  if (!$('meta[name="keywords"]').length) {
    let tags = [];

    if (config.metadataDefaults.tagsFromPath) {
      tags = extractTagsFromPath(filePath);
    } else {
      tags = fileName.toLowerCase().split(/[-_]/);
    }

    $('head').append(`<meta name="keywords" content="${tags.join(', ')}">`);
  }

  // ------------------------------------------------------------
  // <meta name="date">
  // ------------------------------------------------------------
  if (!$('meta[name="date"]').length) {
    $('head').append(`<meta name="date" content="${DEFAULT_DATE}">`);
  }

  fs.writeFileSync(filePath, $.html(), 'utf8');
  console.log(`✅ Injected metadata into: ${filePath}`);
}

// ------------------------------------------------------------
// Process ALL Codex Sections
// ------------------------------------------------------------
function processAllSections() {
  for (const section of config.sections) {
    const dir = path.join(ROOT, section);
    if (!fs.existsSync(dir)) continue;

    const files = fs
      .readdirSync(dir)
      .filter(f => f.endsWith('.html') || f.endsWith('.htm'));

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      injectMetadata(fullPath);
    });
  }
}

processAllSections();
