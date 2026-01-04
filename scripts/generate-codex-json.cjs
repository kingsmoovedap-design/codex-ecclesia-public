const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");

async function generateCodex() {
  try {
    const sections = ["codices", "scrolls", "ministries", "identity", "trusts", "treaties", "academy", "pma"];

    const codex = {};

    for (const section of sections) {
      const files = glob.sync(`${section}/**/*.html`);
      codex[section] = files.map(file => ({
        path: file,
        name: path.basename(file, ".html")
      }));
    }

    await fs.ensureDir("dist");
    await fs.writeJson("dist/codex.json", codex, { spaces: 2 });

    console.log("✅ codex.json generated");
  } catch (err) {
    console.error("❌ Error generating codex.json:", err);
    process.exit(1);
  }
}

generateCodex();
