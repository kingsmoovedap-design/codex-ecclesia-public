#!/usr/bin/env node

/**
 * Codex Kernel v2.5 — Manifest Generator
 * Scans all sections, extracts metadata, builds manifest.json
 */

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const config = require('../codex.config.js');

const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ROOT, 'manifest.json');

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function normalize(section) {
  return String(section).trim().toLowerCase();
}

function slugify(filepath) {
  return filepath
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function extractMetadata(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  const title =
    $('title').text().trim() ||
    path.basename(filePath).replace(/\.[^.]+$/, '');

  const summary =
    $('meta[name="description"]').attr('content') ||
    '';

  const keywords =
    $('meta[name="keywords"]').attr('content') || '';

  const tags = keywords
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const date =
    $('meta[name="date"]').attr('content') ||
    config.defaultDate;

  return { title, summary, tags, date };
}

function getHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
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
    const normalized = normalize(section);
    const baseDir = path.join(ROOT, normalized);

    const files = getHtmlFiles(baseDir);

    for (const file of files) {
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      const meta = extractMetadata(file);

      items.push({
        section: normalized,
        title: meta.title,
        summary: meta.summary,
        tags: meta.tags,
        date: meta.date,
        path: rel,
        slug: slugify(rel)
      });
    }
  }

  return { items };
}

// ------------------------------------------------------------
// Execute
// ------------------------------------------------------------
const manifest = buildManifest();
fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));

console.log(`✅ manifest.json generated with ${manifest.items.length} entries.`);
