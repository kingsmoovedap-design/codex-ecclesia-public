# ☩ Codex Ecclesia Public

## Overview
A dynamic, metadata-driven digital archive serving as the sovereign scroll archive of the Borders Ecclesia Earth Trust. Built with Vite and an automated Node.js indexing system.

## Project Architecture
- **Framework**: Vite (static site)
- **Language**: JavaScript (CommonJS for scripts, ES modules for Vite)
- **Port**: 5000 (development)
- **Core API**: `manifest.json` (raw manifest), `codex.json` (structured API)

## Key Files
- `index.html` - Unified gateway with real-time search and dynamic sections
- `codex.json` - Expanded JSON API (version 2.0.0) with status, versioning, and sigil images
- `style.css` - Professional "Sacred Archive" theme
- `vite.config.js` - Proxy-ready configuration

## Directory Structure
- `/core/` - Canonical texts and affidavits
- `/scrolls/` - Teachings and revelations
- `/ministries/` - Organizational documents
- `/treaties/` - Diplomatic covenants
- `/codices/` - Knowledge sets
- `/tools/` - System utilities and generators
- `/scripts/` - Node.js automation scripts (.cjs)

## Scripts
- `npm run dev` - Start development server on port 5000
- `npm run generate` - Full index regeneration (manifest, codex, sitemap)
- `npm run inject` - Inject metadata into HTML files
- `npm run guard` - Integrity check for broken links and missing metadata

## Deployment
- **Type**: Static
- **Build Command**: `npm run build`
- **Public Directory**: `dist`

## Recent Changes
- 2025-12-28: Omniversal Codex Enhancements
  - Implemented Codex DNA (API v2.0.0) with expanded metadata fields.
  - Added Sacred Navigation Bar and Seal Footer across all gateway pages.
  - Developed `scripts/guardian.cjs` for repository integrity monitoring.
  - Centralized the archive homepage with real-time global search.
  - Added `leadership.html` and `submit-scroll.html` modules.
  - Implemented PWA features: Web App Manifest and Service Worker for offline support.
  - Developed `omega-portal.html` as a master command center for trust management and document drafting.
  - Integrated sacred ☩ seal icons (192px/512px) for PWA compliance.
