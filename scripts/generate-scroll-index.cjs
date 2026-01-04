const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");

async function generateScrollIndex() {
  try {
    const scrolls = glob.sync("scrolls/**/*.html");

    const index = scrolls.map(file => ({
      path: file,
      title: path.basename(file, ".html")
    }));

    await fs.ensureDir("dist");
    await fs.writeJson("dist/scroll-index.json", index, { spaces: 2 });

    console.log("✅ scroll-index.json generated");
  } catch (err) {
    console.error("❌ Error generating scroll index:", err);
    process.exit(1);
  }
}

generateScrollIndex();
