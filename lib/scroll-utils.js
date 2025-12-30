name: 🔁 Generate Codex & Scroll Index

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: 🧭 Checkout Repository
        uses: actions/checkout@v4

      - name: 🛠️ Set Up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: 📦 Install Dependencies
        run: npm ci

      - name: 🧩 Inject Metadata
        run: node scripts/inject-metadata.cjs

      - name: 🗂️ Generate Manifest
        run: node scripts/generate-manifest.cjs

      - name: 🧾 Generate codex.json
        run: node scripts/generate-codex-json.js

      - name: 🏗️ Build Codex
        run: npm run build

      - name: 🔐 Configure Git
        run: |
          git config user.name "CodexBot"
          git config user.email "codexbot@ecclesia.local"

      - name: 📤 Commit and Push Updates
        run: |
          git add codex.json manifest.json
          git diff --cached --quiet || git commit -m "🔄 Auto-update codex.json & manifest.json"
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
