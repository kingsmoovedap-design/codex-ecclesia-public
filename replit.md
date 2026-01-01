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
- 2026-01-01: Complete Web3 DeFi Integration Rebuild
  - Full index.html with BSC coin showcase, wallet connection, transfers, DeFi tools
  - treasury-widget.js module for all blockchain interactions via ethers.js
  - Omega Portal with 47 legal document types across 8 categories
  - Complete Codex Constitution with 10 articles + Bill of Rights
  - Legal Definitions page with categorized terminology
  - Borders Sovereign Coin details page
  - Minting Altar for treasury administration
  - Professional responsive CSS styling for all components
  - manifest.webmanifest for PWA functionality
  - Contract: 0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c (Sepolia)
- 2025-12-28: Initial Replit setup
  - Fixed malformed package.json
  - Created vite.config.js with proper host/port settings
  - Fixed malformed codex.json
  - Configured static deployment
