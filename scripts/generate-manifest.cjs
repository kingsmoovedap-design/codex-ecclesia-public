/**
 * Codex Manifest Generator (Integrated Kernel Version)
 * ----------------------------------------------------
 * This script:
 *  - Scans all Codex sections
 *  - Extracts metadata from HTML scrolls
 *  - Applies Codex Kernel defaults
 *  - Normalizes sections, tags, and titles
 *  - Generates manifest.json for search + UI rendering
 */

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

// ------------------------------------------------------------
// Load Codex Kernel Config
// ------------------------------------------------------------
const config = require('../codex.config.js');

const OUTPUT_FILE = 'manifest.json';
const ROOT = path.join(__dirname, '..');

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function normalizeSection(section) {
  return config.metadataDefaults.normalizeSection
    ? String(section).trim().toLowerCase()
    : section;
}

function generateSlug(filepath) {
  return filepath
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

function extractMetadata(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  const title =
    $('title').text().trim() ||
    path.basename(filePath).replace(/\.[^.]+$/, '');

  const summary =
    $('meta[name="description"]').attr('content') ||
    config.metadataDefaults.summary.replace('{{title}}', title);

  const keywords = $('meta[name="keywords"]').attr('content') || '';
  const tags = keywords
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const date =
    $('meta[name="date"]').attr('content') ||
    config.defaultDate;

  return { title, summary, tags, date };
}

function getAllHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllHtmlFiles(full));
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.htm')) {
      files.push(full);
    }
  }

  return files;
}

// ------------------------------------------------------------
// Build Manifest
// ------------------------------------------------------------
function buildManifest() {
  const items = [];

  for (const section of config.sections) {
    const normalized = normalizeSection(section);
    const baseDir = path.join(ROOT, normalized);

    const files = getAllHtmlFiles(baseDir);

    for (const file of files) {
      const relPath = path.relative(ROOT, file).replace(/\\/g, '/');
      const meta = extractMetadata(file);

      const autoTags = config.metadataDefaults.tagsFromPath
        ? extractTagsFromPath(relPath)
        : [];

      const slug = config.metadataDefaults.autoSlug
        ? generateSlug(relPath)
        : null;

      items.push({
        section: normalized,
        title: meta.title,
        path: relPath,
        slug,
        tags: [...new Set([...meta.tags, ...autoTags])],
        date: meta.date,
        summary: meta.summary
      });
    }
  }

  return { items };
}

// ------------------------------------------------------------
// Write Manifest
// ------------------------------------------------------------
function writeManifest(manifest) {
  const outputPath = path.join(ROOT, OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✅ ${OUTPUT_FILE} generated with ${manifest.items.length} entries.`);
}

// ------------------------------------------------------------
// Execute
// ------------------------------------------------------------
const manifest = buildManifest();
writeManifest(manifest);
