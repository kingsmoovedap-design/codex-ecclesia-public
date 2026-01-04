const fs = require("fs-extra");
const glob = require("glob");
const cheerio = require("cheerio");

async function generateSearchIndex() {
  try {
    const files = glob.sync("**/*.html", {
      ignore: ["node_modules/**", "dist/**"]
    });

    const index = [];

    for (const file of files) {
      try {
        // Ensure file exists
        if (!fs.existsSync(file)) {
          console.warn(`⚠ Skipping missing file: ${file}`);
          continue;
        }

        const html = await fs.readFile(file, "utf8");

        // Skip empty files
        if (!html.trim()) {
          console.warn(`⚠ Skipping empty file: ${file}`);
          continue;
        }

        let $;
        try {
          $ = cheerio.load(html);
        } catch (parseErr) {
          console.warn(`⚠ Skipping invalid HTML: ${file}`);
          continue;
        }

        const title = $("title").text().trim() || file;
        const text = $("body").text().replace(/\s+/g, " ").trim();

        index.push({
          file,
          title,
          text
        });

      } catch (innerErr) {
        console.warn(`⚠ Error processing file ${file}:`, innerErr.message);
        continue;
      }
    }

    await fs.ensureDir("dist");
    await fs.writeJson("dist/search-index.json", index, { spaces: 2 });

    console.log("🔍 search-index.json generated successfully");

  } catch (err) {
    console.error("❌ Fatal error generating search index:", err);
    process.exit(1);
  }
}

generateSearchIndex();
