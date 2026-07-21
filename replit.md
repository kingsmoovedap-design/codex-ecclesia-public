# Codex Ecclesia Public

## Overview
A static HTML website serving as the sovereign scroll archive of the Borders Ecclesia Earth Trust. Built with Vite for development and static file serving.

## Project Architecture
- **Framework**: Vite (static site)
- **Language**: JavaScript (ES modules)
- **Port**: 5000 (development)

## Key Files
- `index.html` - Main entry point, displays scrolls from codex.json
- `codex.json` - JSON data file containing scrolls, heirs, treaties metadata
- `style.css` - Global styles
- `vite.config.js` - Vite configuration (host/port/allowedHosts)

## Directory Structure
- `/scrolls/` - Scroll HTML documents
- `/codices/` - Codex documents
- `/ministries/` - Ministry HTML documents
- `/tools/` - Utility tools and generators
- `/scripts/` - Node.js build scripts
- `/lib/` - Shared JavaScript utilities

## Scripts
- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run generate:manifest` - Generate manifest
- `npm run generate:sitemap` - Generate sitemap

## Deployment
- **Type**: Static
- **Build Command**: `npm run build`
- **Public Directory**: `dist`

## Recent Changes
- 2025-12-28: Initial Replit setup
  - Fixed malformed package.json
  - Created vite.config.js with proper host/port settings
  - Fixed malformed codex.json
  - Configured static deployment
