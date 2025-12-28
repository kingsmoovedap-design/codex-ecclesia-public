import fs from 'fs-extra';
import path from 'path';

/**
 * Load and validate the scroll manifest.
 * @param {string} manifestPath
 * @returns {Promise<Array>}
 */
export async function loadManifest(manifestPath) {
  const manifest = await fs.readJson(manifestPath);
  if (!Array.isArray(manifest)) {
    throw new Error('Manifest must be a JSON array.');
  }
  return manifest;
}

/**
 * Add a scroll to the manifest if it doesn't already exist.
 * @param {Array} manifest
 * @param {Object} scroll
 * @returns {Array} updated manifest
 */
export function addScroll(manifest, scroll) {
  const exists = manifest.some(entry => entry.path === scroll.path);
  if (exists) {
    console.warn(`⚠️ Scroll already exists: ${scroll.path}`);
    return manifest;
  }
  manifest.push(scroll);
  manifest.sort((a, b) => new Date(b.date) - new Date(a.date));
  return manifest;
}

/**
 * Save the manifest to disk.
 * @param {string} manifestPath
 * @param {Array} manifest
 */
export async function saveManifest(manifestPath, manifest) {
  await fs.writeJson(manifestPath, manifest, { spaces: 2 });
  console.log(`✅ Manifest updated with ${manifest.length} scrolls.`);
}
