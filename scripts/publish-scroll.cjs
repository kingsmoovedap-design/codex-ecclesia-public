// scripts/publish-scroll.js

import fs from 'fs-extra';
import path from 'path';

// CONFIGURATION
const MANIFEST_PATH = './manifest.json'; // or './scrolls.json'
const NEW_SCROLL = {
  section: 'core',
  title: 'Scroll CXXVI: Total Embedding of Lawful Instruments',
  path: 'scroll-cxxvi-total-embedding.html',
  tags: ['core', 'scroll', 'cxxvi', 'total', 'embedding'],
  date: '2025-12-16',
  summary: 'Decree embedding all lawful paperwork, charters, procedures, and formats into the Codex Ecclesia Totalis.'
};

// MAIN FUNCTION
async function publishScroll() {
  try {
    const manifest = await fs.readJson(MANIFEST_PATH);

    // Prevent duplicates
    const exists = manifest.some(entry => entry.path === NEW_SCROLL.path);
    if (exists) {
      console.log('⚠️ Scroll already exists in manifest. No action taken.');
      return;
    }

    // Append and sort by date descending
    manifest.push(NEW_SCROLL);
    manifest.sort((a, b) => new Date(b.date) - new Date(a.date));

    await fs.writeJson(MANIFEST_PATH, manifest, { spaces: 2 });
    console.log(`✅ Scroll "${NEW_SCROLL.title}" added to ${MANIFEST_PATH}`);
  } catch (err) {
    console.error('❌ Error updating manifest:', err.message);
  }
}

publishScroll();
