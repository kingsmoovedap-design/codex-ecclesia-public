# ☩ Contributing to the Codex Ecclesia

We welcome all scribes, scholars, and visionaries to contribute to the Codex.

## How to Contribute

1. **Fork** this repository
2. Add or edit scrolls in the appropriate folder (`scrolls/`, `ministries/`, etc.)
3. Run the scripts:
   ```bash
   npm run inject
   npm run generate
   ```

---

## 🛡️ Branch Protection

The `main` branch is protected.

- **Do not push directly to `main`**
- All changes must be submitted via **Pull Requests (PRs)**
- PRs require **review and approval** before merging
- Force pushes and deletions are **strictly prohibited**

---

## 🧾 How to Submit a Scroll or Codex Update

### 1. Fork the Repository
Click “Fork” in the top-right to create your own copy of this archive.

### 2. Create a New Branch
```bash
git checkout -b scroll-031-your-title
```

### 3. Add Your Content
Place your HTML or Markdown files in the appropriate directory. Ensure you include the necessary metadata (title, tags, summary) in the `<head>` section of HTML files.

### 4. Index Your Changes
Run the following commands to update the archive's indices:
```bash
npm run inject
npm run generate
```

### 5. Submit a PR
Commit your changes and open a Pull Request against the `main` branch.
