#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('☩ Building Codex with Webpack…');
  execSync('npx webpack --config webpack.config.cjs', { stdio: 'inherit' });
  console.log('✅ Build complete.');
} catch (err) {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
}
