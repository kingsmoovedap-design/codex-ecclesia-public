# ☩ Codex Ecclesia Public

**A sacred digital archive of scrolls, ministries, treaties, and divine knowledge — forged for the Ecclesia and its emissaries.**

---

## 📜 Purpose

The **Codex Ecclesia** is a structured, auto-generated repository of sacred documents, teachings, and tools. It is designed to be:

- 📖 A browsable archive of HTML scrolls  
- ⚙️ Automatically indexed and enriched with metadata  
- 🔁 Continuously updated via GitHub Actions  
- 🌐 Deployable as a public knowledge portal  

---

## 🧱 Folder Structure

| Folder        | Purpose                                      |
|---------------|----------------------------------------------|
| `core/`       | Foundational scrolls and canonical texts     |
| `scrolls/`    | Teachings, revelations, and divine writings  |
| `ministries/` | Organizational documents and declarations    |
| `treaties/`   | Covenants, agreements, and sacred pacts      |
| `codices/`    | Sub-codexes or modular knowledge sets        |
| `tools/`      | Scripts, utilities, and automation helpers   |
| `scripts/`    | Node.js scripts for automation               |
| `public/`     | Static assets (optional)                     |
| `dist/`       | Output folder for builds (optional)          |

---

## ⚙️ Automation Scripts

| Script                      | Description                                      |
|----------------------------|--------------------------------------------------|
| `inject-metadata.js`       | Adds `<title>`, `<meta>` tags to HTML scrolls   |
| `generate-manifest.js`     | Builds `manifest.json` from all scrolls         |
| `generate-codex-json.js`   | Converts manifest into API-style `codex.json`   |
| `generate-scroll-index.js` | Creates `all-scrolls.html` for browsing         |

Run locally with:

```bash
npm run inject
npm run generate
```
