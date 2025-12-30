#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

console.log("====================================");
console.log("   ☩ Deploying the Codex…");
console.log("====================================");

if (!fs.existsSync(path.join(process.cwd(), "dist"))) {
  run("Building Codex", "node scripts/build-codex.cjs");
}

run("Deploying to GitHub Pages", "npx gh-pages -d dist");

console.log("\n====================================");
console.log("   ✨ Codex Deployment Complete ✨");
console.log("====================================\n");
