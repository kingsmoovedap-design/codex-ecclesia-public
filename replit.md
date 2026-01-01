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
- `style.css` - Global styles (2600+ lines with mobile optimization)
- `server/index.ts` - Express server entry point
- `server/routes.ts` - API routes for documents, filings, analytics
- `server/storage.ts` - Database storage layer
- `shared/schema.ts` - Drizzle ORM database schema
- `lib/api.js` - Frontend API client
- `lib/auth.js` - Authentication utilities
- `lib/dynasty-sync.js` - Dynasty ecosystem integration

## Directory Structure
- `/scrolls/` - Scroll HTML documents
- `/codices/` - Codex documents
- `/ministries/` - Ministry HTML documents
- `/tools/` - Utility tools and generators
- `/scripts/` - Node.js build scripts
- `/lib/` - Frontend JavaScript utilities (api.js, auth.js, dynasty-sync.js)
- `/server/` - Express server and API routes
- `/shared/` - Shared schema and types

## Scripts
- `npm run dev` - Start Express server on port 5000
- `npm run dev:vite` - Start Vite dev server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio
- `npm run generate:manifest` - Generate manifest
- `npm run generate:sitemap` - Generate sitemap

## Deployment
- **Type**: Static
- **Build Command**: `npm run build`
- **Public Directory**: `dist`

## Recent Changes
- 2026-01-01: Security Implementation
  - Server-side security headers (X-Content-Type-Options, X-XSS-Protection, CSP)
  - lib/shield.js client-side protection module
  - Copy protection with source attribution
  - Context menu protection for protected content
  - CodexShield.verify() API for integrity checks
  - Cache-Control headers to prevent stale content

- 2026-01-01: Comprehensive Page Creation (19 New Pages)
  - Created all missing linked pages to ensure no broken navigation
  - Council Chamber with Twelve Thrones governance structure
  - Ceremonial Calendar with sacred dates and observances
  - Citizen Portal with membership tiers and registration
  - Ministry Portal with all 6 active ministries
  - Treasury Console with stats, compliance indicators
  - PMA Gateway with membership process steps
  - Court Registry with ecclesiastical court structure
  - Notary Gate with document authentication services
  - Seal Forge with official seal types and verification
  - Genesis Block with CodexChain origin story
  - Founding Ceremony with trust establishment timeline
  - Throne Authority with powers and responsibilities
  - Dynasty Calendar with upcoming events
  - Scroll Index with complete catalog by category
  - Codex Ecclesia Archive, Compact, and variant pages
  - 500+ new CSS lines for new page components

- 2026-01-01: Borders Dynasty Integration
  - Cross-platform navigation to Dynasty Dashboard on all pages
  - Dynasty Ecosystem section on homepage with 6 platform cards
  - Blockchain filing integration in Omega Portal with QFS/ISO-20022 status
  - Gold gradient styling for Dynasty Dashboard navigation link
  - Logistics Dynasty page with full platform modules (ready for external URL)

- 2026-01-01: Logistics Dynasty Platform Page
  - Dedicated logistics-dynasty.html with 6 platform modules
  - Inventory Management, Freight & Shipping, Warehouse Operations
  - Supply Chain Analytics, Vendor Management, Compliance & Documentation
  - Dynasty Ecosystem integration cards (BSC Treasury, Omega Portal, CodexChain, Dashboard)
  - Configuration panel with platform status and compliance indicators
  - Launch buttons ready for external dashboard URL configuration

- 2026-01-01: Full Platform Enhancement (9-Point Upgrade)
  - PostgreSQL database with Drizzle ORM (users, documents, filings, audit_logs, analytics tables)
  - Express server backend with API routes
  - User dashboard page with stats, quick actions, activity log
  - Mobile-responsive CSS (480px, 768px, 1200px breakpoints)
  - Dynasty ecosystem sync module with cross-platform integration
  - Analytics tracking API and audit logging
  - Authentication-ready infrastructure (Replit Auth compatible)
  - Accessibility improvements (focus states, skip links, screen reader support)
  - Blockchain verification endpoint

- 2026-01-01: Unified Navigation & Build Fix
  - Consistent navigation across all pages (Dashboard, Logistics, Dynasty Dashboard)
  - Fixed build script (generate-sitemap.cjs converted to CommonJS)
  - Enhanced 404 page with full navigation and helpful links
  - All pages now flow together: Codex Ecclesia, Coin, Logistics, Dashboard

- 2026-01-01: Cross-Platform Integration with Borders Dynasty
  - Public API endpoints (/api/public/*) for cross-app communication
  - Dynasty Hub floating menu on all major pages (bottom-right crown button)
  - Embeddable widgets for stats, coin ticker, quick navigation
  - Cross-platform sync endpoint for event tracking between apps
  - CORS enabled for cross-origin requests from Dynasty Dashboard
  - Integration with borders-dynasty--kingsmoovedap.replit.app
  
- 2026-01-01: Enhanced Omega Portal System
  - Master Portal with 4 tabs: Lawful Suggestions, Draft Documents, File & Record, Track Filings
  - Lawful Suggestions Wizard: Role-based (Trustee/Heir/Member/Sovereign) + Intent-based recommendations
  - 60+ document templates across 9 categories
  - Trustees Portal: 6-module learning curriculum, checklists, case studies, quick document access
  - Heirs Portal: 5-step nation claiming roadmap, Bill of Rights summary, FAQ, inheritance education
  - Full CSS styling for all new portal components
  
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
