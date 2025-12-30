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

flowchart TD

  subgraph Developer
    A[Author / Operator]
  end

  subgraph GitRepo[Git Repository]
    F1[index.html]
    F2[Scrolls / Codices / Treaties / Ministries / Tools]
    F3[style.css]
    F4[vite.config.js]
    F5[scripts/*.cjs]
  end

  subgraph Kernel[Codex Kernel v2.5]
    subgraph K_Config[Configuration]
      C1[codex.config.js\nsections, defaults, rules]
    end

    subgraph K_Scanners[Scanners]
      S1[inject-metadata.cjs\nHTML metadata injection]
      S2[generate-manifest.cjs\nmanifest.json]
      S3[generate-codex-json.js\ncodex.json]
      S4[build-codex.cjs\norchestration]
      S5[guardian.cjs\nintegrity checks]
    end
  end

  subgraph Build[Vite Build System]
    B1[Vite Dev Server\nnpm run dev]
    B2[Vite Build\nnpm run build]
    O1[dist/\nstatic output]
  end

  subgraph APIs[Codex APIs]
    API1[manifest.json\nraw file manifest]
    API2[codex.json\nstructured kernel API]
    API3[search-index.json\n(optional search index)]
  end

  subgraph Frontend[Codex Frontend]
    UI1[index.html\nSacred Gateway]
    UI2[All Scrolls / Directory Views]
    UI3[Omega Portal\nomega-portal.html]
  end

  subgraph Infra[Deployment / CI-CD]
    D1[GitHub Actions\ncodex.yml]
    D2[GitHub Pages / Cloudflare Pages]
  end

  A -->|author scrolls, codices, HTML| GitRepo

  GitRepo -->|npm run metadata| S1
  GitRepo -->|npm run manifest| S2
  GitRepo -->|npm run codex| S3

  S1 -->|writes| GitRepo
  S2 -->|writes| API1
  S3 -->|writes| API2

  C1 --> S1
  C1 --> S2
  C1 --> S3

  S4 -->|npm run build\norchestrates| S1
  S4 --> S2
  S4 --> S3
  S4 --> B2

  GitRepo --> B1
  GitRepo --> B2
  B2 --> O1

  O1 --> API1
  O1 --> API2
  O1 --> Frontend

  API1 --> UI1
  API2 --> UI1
  API2 --> UI2
  API2 --> UI3

  GitRepo --> D1
  D1 --> B2
  B2 --> D2
  D2 --> Frontend

Run locally with:

```bash
npm run inject
npm run generate
```
