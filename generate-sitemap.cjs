const fs = require('fs-extra');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

async function generateSitemap() {
  const baseUrl = "https://kingsmoovedap-design.github.io/codex-ecclesia-public";

  // Collect all HTML files in the root directory
  const pages = fs
    .readdirSync("./")
    .filter(file => file.endsWith(".html"))
    .map(file => `/${file}`);

  const sitemap = new SitemapStream({ hostname: baseUrl });

  pages.forEach(page => sitemap.write({ url: page }));

  sitemap.end();

  const xml = await streamToPromise(sitemap);

  // Ensure dist exists
  fs.ensureDirSync("dist");

  // Write sitemap
  fs.writeFileSync("dist/sitemap.xml", xml.toString());

  console.log("✅ sitemap.xml generated");
}

generateSitemap();
