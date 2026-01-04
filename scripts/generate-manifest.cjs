const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");

async function generateManifest() {
  try {
    const files = glob.sync("**/*.html", {
      ignore: ["node_modules/**", "dist/**"]
    });

    const manifest = files.map(file => ({
      path: file,
      name: path.basename(file)
    }));

    await fs.ensureDir("dist");
    await fs.writeJson("dist/manifest.json", manifest, { spaces: 2 });

    console.log(`✅ manifest.json generated with ${manifest.length} entries.`);
  } catch (err) {
    console.error("❌ Error generating manifest:", err);
    process.exit(1);
  }
}

generateManifest();
