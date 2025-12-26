import path from 'path';
import { fileURLToPath } from 'url';
import {
  loadManifest,
  addScroll,
  saveManifest
} from './lib/scroll-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MANIFEST_PATH = path.join(__dirname, 'scrolls.json');

// Example scroll to add
const NEW_SCROLL = {
  section: 'core',
  title: 'Codex Curriculum',
  path: 'codex-curriculum.html',
  tags: ['core', 'codex', 'curriculum', 'education', 'rites'],
  date: '2025-12-25',
  summary: 'The sacred syllabus of the Ecclesia — outlining sovereign studies, rites of passage, and the path of scribes, sentinels, and sovereigns.'
};

async function main() {
  try {
    const manifest = await loadManifest(MANIFEST_PATH);
    const updated = addScroll(manifest, NEW_SCROLL);
    await saveManifest(MANIFEST_PATH, updated);
  } catch (err) {
    console.error('❌ Manifest generation failed:', err.message);
    process.exit(1);
  }
}

main();
