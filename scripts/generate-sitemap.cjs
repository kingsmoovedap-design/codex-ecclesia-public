const fs = require('fs-extra');
const path = require('path');

// CONFIG
const BASE_URL = 'https://codex-ecclesia.org';
const CODEX_PATH = path.join(__dirname, '../codex.json');
const SITEMAP_PATH = path.join(__dirname, '../sitemap.xml');

async function generateSitemap() {
  try {
    const codex = await fs.readJson(CODEX_PATH);

    if (!Array.isArray(codex.scrolls)) {
      throw new Error('codex.json must contain a "scrolls" array');
    }

    const urls = codex.scrolls.map(entry => {
      const loc = `${BASE_URL}/${entry.url.replace(/^\//, '')}`;
      const lastmod = entry.created ? new Date(entry.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${urls.join('\n')}
</urlset>`;

    await fs.writeFile(SITEMAP_PATH, sitemap.trim());
    console.log(`✅ Sitemap generated with ${urls.length + 1} entries.`);
  } catch (err) {
    console.error('❌ Failed to generate sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();
