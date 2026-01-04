const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n🔧 Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

async function main() {
  try {
    console.log("\n🔱 Codex Ecclesia Engine — Full Build Starting");

    run("node scripts/generate-manifest.cjs");
    run("node scripts/generate-codex-json.cjs");
    run("node scripts/generate-scroll-index.cjs");
    run("node scripts/generate-sitemap.cjs");
    run("node scripts/inject-metadata.cjs");
    run("node scripts/generate-search-index.cjs");
    run("node scripts/validate-codex.cjs");

    console.log("\n✨ All Codex generation tasks completed successfully.");
  } catch (err) {
    console.error("\n❌ Codex Engine failed:", err);
    process.exit(1);
  }
}

main();
