import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIG
const BASE_URL = 'https://codex-ecclesia.org';
const SCROLLS_PATH = path.join(__dirname, 'scrolls.json');
const CODEX_PATH = path.join(__dirname, 'codex.json');

async function generateCodex() {
  try {
    const scrolls = await fs.readJson(SCROLLS_PATH);

    if (!Array.isArray(scrolls)) {
      throw new Error('scrolls.json must be an array');
    }

    const codex = scrolls.map(entry => ({
      title: entry.title,
      path: entry.path,
      url: `${BASE_URL}/${entry.path.replace(/^\//, '')}`,
      tags: entry.tags || [],
      date: entry.date,
      summary: entry.summary
    }));

    await fs.writeJson(CODEX_PATH, codex, { spaces: 2 });
    console.log(`✅ codex.json generated with ${codex.length} entries.`);
  } catch (err) {
    console.error('❌ Failed to generate codex.json:', err.message);
    process.exit(1);
  }
}

generateCodex();
