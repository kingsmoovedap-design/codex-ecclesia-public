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

console.log("====================================");
console.log("   ☩ Building Codex Kernel v2.5");
console.log("====================================");

// Step 1: Metadata Injection
run("Injecting Metadata", "node scripts/inject-metadata.cjs");

// Step 2: Generate codex.json
run("Generating Codex JSON", "node scripts/generate-codex-json.cjs");

// Step 3: Validate scrolls
run("Validating Scrolls", "node scripts/validate-scrolls.cjs");

// Step 4: Hash scrolls into CodexChain
run("Hashing Scrolls", "node scripts/hash-scrolls.cjs");

// Step 5: Generate missing HTML scrolls
run("Generating Missing Scrolls", "node scripts/generate-missing-scrolls.cjs");

// Step 6: Generate manifest
run("Generating Manifest", "node scripts/generate-manifest.cjs");

// Step 7: Build site with Vite
run("Running Vite Build", "vite build");

console.log("\n====================================");
console.log("   ✨ Codex Build Complete ✨");
console.log("====================================\n");
