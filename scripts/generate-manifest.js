// scripts/generate-manifest.js

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SECTIONS = ['scrolls', 'ministries', 'treaties', 'codices'];
const OUTPUT_FILE = 'manifest.json';

function getAllHtmlFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
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
  const tags = ($('meta[name="keywords"]').attr('content') || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  return { title, summary, tags };
}

function buildManifest() {
  const items = [];

  for (const section of SECTIONS) {
    const sectionPath = path.join(__dirname, '..', section);
    if (!fs.existsSync(sectionPath)) continue;

    const htmlFiles = getAllHtmlFiles(sectionPath);

    for (const file of htmlFiles) {
      const relPath = path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/');
      const meta = extractMetadata(file);

      items.push({
        title: meta.title,
        path: relPath,
        summary: meta.summary,
        tags: meta.tags,
        section
      });
    }
  }

  return { items };
}

function writeManifest(manifest) {
  const outputPath = path.join(__dirname, '..', OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✅ ${OUTPUT_FILE} generated with ${manifest.items.length} scrolls.`);
}

const manifest = buildManifest();
writeManifest(manifest);
