#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, 'codex.json');

function loadManifest() {
  const file = path.join(ROOT, 'manifest.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function buildCodex() {
  const manifest = loadManifest();

  const scrolls = manifest.items.map(item => ({
    title: item.title,
    summary: item.summary,
    section: item.section,
    tags: item.tags || [],
    created: item.date || null,
    url: `/${item.path}`
  }));

  return { version: "2.5", scrolls };
}

const codex = buildCodex();
fs.writeFileSync(OUTPUT, JSON.stringify(codex, null, 2));

console.log(`✅ codex.json generated with ${codex.scrolls.length} scrolls.`);
