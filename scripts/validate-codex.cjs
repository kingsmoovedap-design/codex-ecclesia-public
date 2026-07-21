const fs = require("fs-extra");

async function validate() {
  try {
    const codexPath = "dist/codex.json";

    if (!fs.existsSync(codexPath)) {
      throw new Error("codex.json not found in dist/. Did generate-codex-json.cjs run?");
    }

    const codex = await fs.readJson(codexPath);

    if (!codex.scrolls || !Array.isArray(codex.scrolls)) {
      throw new Error("Codex missing required 'scrolls' array");
    }

    if (!codex.codices || !Array.isArray(codex.codices)) {
      throw new Error("Codex missing required 'codices' array");
    }

    console.log("✅ Codex schema validated successfully");
  } catch (err) {
    console.error("❌ Codex validation failed:", err.message);
    process.exit(1);
  }
}

validate();
