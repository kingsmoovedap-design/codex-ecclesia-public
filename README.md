# ☩ Codex Ecclesia Public

**Master Index of Ecclesiastical Scrolls, Ministries, and Sovereign Instruments**

The Codex Ecclesia Public is the living digital archive of the Borders Ecclesia Earth Trust — a sovereign repository of sacred scrolls, declarations, ministries, and divine protocols. This repository serves as the canonical source for all public-facing ecclesiastical documents, tools, and instruments of governance.

---

## 🧭 Git Branch Strategy

```mermaid
graph TD
  A[main] -->|release| B[release/v1.0]
  A -->|hotfix| C[hotfix/fix-urgent]
  A --> D[dev]
  D --> E[scroll/scroll-of-rights]
  D --> F[tool/oracle-console]
  D --> G[profile/heir-deven]
  D --> H[fix/sidebar-links]
  E --> D
  F --> D
  G --> D
  H --> D
  D --> A
