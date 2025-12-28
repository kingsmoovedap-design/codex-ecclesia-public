import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIG
const BASE_URL = 'https://codex-ecclesia.org'; // Update to your domain
const SCROLLS_PATH = path.join(__dirname, 'scrolls.json');
const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

async function generateSitemap() {
  try {
    const scrolls = await fs.readJson(SCROLLS_PATH);

    if (!Array.isArray(scrolls)) {
      throw new Error('scrolls.json must be an array');
    }

    const urls = scrolls.map(entry => {
      const loc = `${BASE_URL}/${entry.path.replace(/^\//, '')}`;
      const lastmod = entry.date || new Date().toISOString().split('T')[0];
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
${urls.join('\n')}
</urlset>`;

    await fs.writeFile(SITEMAP_PATH, sitemap.trim());
    console.log(`✅ Sitemap generated with ${urls.length} entries.`);
  } catch (err) {
    console.error('❌ Failed to generate sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();
