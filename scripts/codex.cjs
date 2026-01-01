#!/usr/bin/env node

/**
 * Codex Build Orchestrator (Codex Kernel v2.5)
 * -------------------------------------------
 * Runs the full pipeline:
 *  1. inject-metadata.cjs
 *  2. generate-manifest.cjs
 *  3. generate-codex-json.js
 *  4. Vite build
 *  5. Copy JSON APIs into dist/
 */

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

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`   → Copied ${src} → ${dest}`);
  } else {
    console.warn(`   ⚠ ${src} not found, skipping copy.`);
  }
}

console.log('====================================');
console.log('   ☩ Building the Codex…');
console.log('====================================');

run('Injecting metadata', 'node scripts/inject-metadata.cjs');
run('Generating manifest.json', 'node scripts/generate-manifest.cjs');
run('Generating codex.json', 'node scripts/generate-codex-json.js');
run('Running Vite build', 'npm run vite-build --if-present || npx vite build');

const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ not found after build.');
  process.exit(1);
}

copyIfExists('manifest.json', path.join(distDir, 'manifest.json'));
copyIfExists('codex.json', path.join(distDir, 'codex.json'));

console.log('\n====================================');
console.log('   ✨ Codex Build Complete ✨');
console.log('====================================\n');
