import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';

const SCROLLS_DIR = './';
const OUTPUT_FILE = './codex.json';

function extractTitle(content) {
  const match = content.match(/<title>(.*?)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractCategory(content) {
  const match = content.match(/<meta\s+name=["']category["']\s+content=["'](.*?)["']/i);
  return match ? match[1].trim() : 'Uncategorized';
}

function extractCreatedDate(content) {
  const match = content.match(/<meta\s+name=["']created["']\s+content=["'](.*?)["']/i);
  return match ? match[1].trim() : new Date().toISOString().split('T')[0];
}

function buildManifestEntry(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    title: extractTitle(content) || path.basename(filePath),
    url: path.relative('.', filePath).replace(/\\/g, '/'),
    category: extractCategory(content),
    created: extractCreatedDate(content)
  };
}

function generateManifest() {
  const files = glob.sync('**/*.html', {
    ignore: ['node_modules/**', 'dist/**', 'vite.config.js', 'index.html']
  });

  const scrolls = files.map(buildManifestEntry).sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const manifest = {
    scrolls,
    meta: {
      generated: new Date().toISOString(),
      sovereign: 'Sovereign King Omega',
      repository: 'Borders Ecclesia Earth Trust'
    }
  };

  fs.writeJsonSync(OUTPUT_FILE, manifest, { spaces: 2 });
  console.log(`☩ Manifest generated with ${scrolls.length} scrolls.`);
}

generateManifest();
