#!/usr/bin/env node

const { execSync } = require('child_process');

function run(label, command) {
  try {
    console.log(`\n☩ ${label}…`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${label} complete.`);
  } catch (err) {
    console.error(`❌ ${label} failed:`, err.message);
    process.exit(1);
  }
}
node scripts/inject-metadata.cjs
node scripts/generate-codex-json.cjs
node scripts/validate-scrolls.cjs
node scripts/hash-scrolls.cjs
node scripts/generate-missing-scrolls.cjs
console.log("====================================");
console.log("   ☩ Building Codex Kernel v2.5");
console.log("====================================");

run("Injecting Metadata", "node scripts/inject-metadata.cjs");
run("Generating Manifest", "node scripts/generate-manifest.cjs");
run("Generating Codex JSON", "node scripts/generate-codex-json.js");
run("Running Vite Build", "vite build");

console.log("\n====================================");
console.log("   ✨ Codex Build Complete ✨");
console.log("====================================\n");
