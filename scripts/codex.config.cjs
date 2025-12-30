/**
 * Codex Kernel Configuration
 * Unified configuration for:
 *  - manifest generation
 *  - scroll metadata extraction
 *  - section routing
 *  - tag derivation
 *  - default values for missing metadata
 */

module.exports = {
  // ------------------------------------------------------------
  // Sections recognized by the Codex
  // ------------------------------------------------------------
  sections: [
    'core',
    'scrolls',
    'ministries',
    'treaties',
    'codices',
    'tools'
  ],

  // ------------------------------------------------------------
  // Default date used when scrolls lack a frontmatter date
  // ------------------------------------------------------------
  defaultDate: '2025-01-01',

  // ------------------------------------------------------------
  // Base path for resolving scroll paths
  // (Used by manifest generator + index builder)
  // ------------------------------------------------------------
  basePath: './',

  // ------------------------------------------------------------
  // Metadata defaults applied to every scroll
  // ------------------------------------------------------------
  metadataDefaults: {
    // Auto‑generated summary if none is provided
    summary: 'Placeholder summary for {{title}}.',

    // Automatically derive tags from folder structure
    // Example: /scrolls/faith/scroll.html → tags: ['faith']
    tagsFromPath: true,

    // Normalize section names (lowercase, trimmed)
    normalizeSection: true,

    // Automatically generate slug if missing
    autoSlug: true
  },

  // ------------------------------------------------------------
  // Reserved for future Codex Kernel expansions
  // ------------------------------------------------------------
  experimental: {
    // Enable future fuzzy‑search index generation
    enableSearchIndex: false,

    // Enable auto‑generated breadcrumbs
    enableBreadcrumbs: false
  }
};
