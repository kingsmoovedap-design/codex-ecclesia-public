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
          node-version: '22'

      - name: 📦 Install Dependencies
        run: npm install

      - name: 🧾 Generate codex.json
        run: node scripts/generate-codex-json.js

      - name: 📜 Generate all-scrolls.html
        run: node scripts/generate-scroll-index.js

      - name: 🔐 Configure Git
        run: |
          git config user.name "CodexBot"
          git config user.email "codexbot@ecclesia.local"

      - name: 📤 Commit and Push Updates
        run: |
          git add codex.json all-scrolls.html
          git diff --cached --quiet || git commit -m "🔄 Auto-update codex.json & all-scrolls.html"
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
