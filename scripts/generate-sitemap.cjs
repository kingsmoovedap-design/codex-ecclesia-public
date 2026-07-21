const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");
const { SitemapStream, streamToPromise } = require("sitemap");

async function generateSitemap() {
  try {
    const baseUrl = "https://kingsmoovedap-design.github.io/codex-ecclesia-public";

    const pages = glob
      .sync("**/*.html", { ignore: ["node_modules/**", "dist/**"] })
      .map(file => `/${file}`);

    const sitemap = new SitemapStream({ hostname: baseUrl });

    pages.forEach(page => sitemap.write({ url: page }));
    sitemap.end();

    const xml = await streamToPromise(sitemap);

    await fs.ensureDir("dist");
    await fs.writeFile("dist/sitemap.xml", xml.toString());

    console.log("✅ sitemap.xml generated");
  } catch (err) {
    console.error("❌ Error generating sitemap:", err);
    process.exit(1);
  }
}

generateSitemap();
