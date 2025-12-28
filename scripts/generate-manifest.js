const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SECTIONS = ['core', 'scrolls', 'ministries', 'treaties', 'codices', 'tools'];
const OUTPUT_FILE = 'manifest.json';

function getAllFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.htm')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractMetadata(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html);

  const title = $('title').text().trim() || path.basename(filePath);
  const summary = $('meta[name="description"]').attr('content') || '';
  const keywords = $('meta[name="keywords"]').attr('content') || '';
  const tags = keywords.split(',').map(t => t.trim()).filter(Boolean);
  const date = $('meta[name="date"]').attr('content') || '2025-01-01';

  return { title, summary, tags, date };
}

function buildManifest() {
  const items = [];

  for (const section of SECTIONS) {
    const baseDir = path.join(__dirname, '..', section);
    const files = getAllFiles(baseDir);

    for (const file of files) {
      const relPath = path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/');
      const meta = extractMetadata(file);

      items.push({
        section,
        title: meta.title,
        path: relPath,
        tags: meta.tags,
        date: meta.date,
        summary: meta.summary
      });
    }
  }

  return { items };
}

function writeManifest(manifest) {
  const outputPath = path.join(__dirname, '..', OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✅ ${OUTPUT_FILE} generated with ${manifest.items.length} entries.`);
}

const manifest = buildManifest();
writeManifest(manifest);
