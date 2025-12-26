const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kingsmoovedap-design.github.io/codex-ecclesia-public';
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');
const OUTPUT_PATH = path.join(__dirname, 'sitemap.xml');

function escapeXml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

function buildSitemap(items) {
  const urls = items.map(item => {
    const loc = `${BASE_URL}/${item.path}`;
    return `  <url><loc>${escapeXml(loc)}</loc></url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
         `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
         urls.join('\n') +
         `\n</urlset>`;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const sitemap = buildSitemap(manifest.items || []);
  fs.writeFileSync(OUTPUT_PATH, sitemap);
  console.log(`✅ sitemap.xml generated with ${manifest.items.length} entries.`);
}

main();
