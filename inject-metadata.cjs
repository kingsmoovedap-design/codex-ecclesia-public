const fs = require("fs-extra");
const glob = require("glob");
const cheerio = require("cheerio");

async function injectMetadata() {
  try {
    const files = glob.sync("**/*.html", {
      ignore: ["node_modules/**", "dist/**"]
    });

    for (const file of files) {
      const html = await fs.readFile(file, "utf8");
      const $ = cheerio.load(html);

      $("head").prepend(`
        <meta name="generator" content="Codex Ecclesia Engine v1.2">
      `);

      await fs.writeFile(file, $.html());
    }

    console.log("✅ Metadata injected into all HTML files");
  } catch (err) {
    console.error("❌ Error injecting metadata:", err);
    process.exit(1);
  }
}

injectMetadata();
