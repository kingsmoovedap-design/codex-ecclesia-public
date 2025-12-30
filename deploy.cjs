#!/usr/bin/env node

/**
 * Codex Deployment Script (Codex Kernel v2.5)
 * -------------------------------------------
 * Default: Deploys the built Codex (dist/) to GitHub Pages.
 * 
 * You can switch deployment targets by editing DEPLOY_TARGET below.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ---------------- CONFIG ----------------

const DEPLOY_TARGET = "github"; 
// Options: "github", "cloudflare", "s3", "local"

// ----------------------------------------

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

// 1. Ensure build exists
if (!fs.existsSync(path.join(process.cwd(), "dist"))) {
  console.log("⚠️  No build found. Running full build first.");
  run("Building Codex", "node scripts/build-codex.cjs");
}

// 2. Deploy based on target
switch (DEPLOY_TARGET) {
  case "github":
    run("Deploying to GitHub Pages", "npx gh-pages -d dist");
    break;

  case "cloudflare":
    run("Deploying to Cloudflare Pages", "npx wrangler pages publish dist");
    break;

  case "s3":
    run("Deploying to AWS S3", "aws s3 sync dist s3://YOUR_BUCKET_NAME --delete");
    break;

  case "local":
    console.log("📁 Local deployment selected. No remote upload performed.");
    break;

  default:
    console.error("❌ Unknown deployment target:", DEPLOY_TARGET);
    process.exit(1);
}

console.log("\n====================================");
console.log("   ✨ Codex Deployment Complete ✨");
console.log("====================================\n");
