#!/usr/bin/env node

/**
 * Codex Build Orchestrator
 * -------------------------
 * Runs the full Codex build pipeline:
 *  1. Inject metadata into scrolls
 *  2. Generate manifest.json
 *  3. Generate codex.json
 *  4. Build static site with Vite
 */

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

console.log('==============================');
console.log('  ☩ Building the Codex…');
console.log('==============================');

// 1. Inject metadata
run('Injecting metadata', 'node scripts/inject-metadata.cjs');

// 2. Generate manifest.json
run('Generating manifest.json', 'node scripts/generate-manifest.cjs');

// 3. Generate codex.json
run('Generating codex.json', 'node scripts/generate-codex-json.js');

// 4. Build with Vite
run('Building static site', 'npx vite build');

console.log('\n==============================');
console.log('  ✨ Codex Build Complete ✨');
console.log('==============================\n');
