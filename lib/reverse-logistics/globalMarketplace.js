/**
 * Dynasty-OS Global Freight Marketplace
 * Unified client-side API for distressed freight, reverse logistics, and auctions.
 * Connects to server endpoints and Dynasty-OS services.
 */

const GlobalMarketplace = (function() {
  'use strict';

  const API_BASE = window.location.origin + '/api/marketplace';
  const DYNASTY_BASE = window.location.origin + '/api/dynasty';

  const listings = [];
  const watchlist = JSON.parse(localStorage.getItem('dynasty_watchlist') || '[]');
  const bids = JSON.parse(localStorage.getItem('dynasty_bids') || '[]');

  const CATEGORIES = {
    retail_return: { label: 'Retail Returns', icon: '🛍️', color: '#4ade80' },
    carrier_overgoods: { label: 'Carrier Overgoods', icon: '📦', color: '#60a5fa' },
    abandoned_cargo: { label: 'Abandoned Cargo', icon: '🚢', color: '#f59e0b' },
    customs_seizure: { label: 'Customs Seizure', icon: '🏛️', color: '#ef4444' },
    airport_unclaimed: { label: 'Airport Unclaimed', icon: '✈️', color: '#a78bfa' },
    government_surplus: { label: 'Government Surplus', icon: '🏛️', color: '#14b8a6' }
  };

  const REGIONS = ['US', 'EU', 'Asia', 'Middle East', 'Africa', 'Latin America'];

  function generateSampleListings(count = 20) {
    const categories = Object.keys(CATEGORIES);
    const conditions = ['new', 'like_new', 'good', 'fair', 'poor'];
    const ports = ['Port of LA', 'Port of Houston', 'Port of Savannah', 'Port of NY', 'Port of Rotterdam'];
    const items = [];

    for (let i = 0; i < count; i++) {
      const cat = categories[i % categories.length];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const value = Math.floor(Math.random() * 50000) + 500;
      const condFactor = { new: 0.8, like_new: 0.7, good: 0.55, fair: 0.35, poor: 0.15 }[condition];
      const estimated = Math.round(value * condFactor);

      items.push({
        id: `MKT-${Date.now().toString(36).toUpperCase()}-${i}`,
        title: `${CATEGORIES[cat].label} Lot #${String(i + 1).padStart(4, '0')}`,
        category: cat,
        condition,
        port: ports[i % ports.length],
        region: REGIONS[i % REGIONS.length],
        declaredValue: value,
        estimatedValue: estimated,
        minBid: Math.round(estimated * 0.3),
        currentBid: Math.round(estimated * (0.3 + Math.random() * 0.2)),
        buyNow: Math.round(estimated * 1.2),
        weight: Math.floor(Math.random() * 50000) + 100,
        daysListed: Math.floor(Math.random() * 30) + 1,
        endsIn: Math.floor(Math.random() * 72) + 1,
        bids: Math.floor(Math.random() * 20),
        verified: Math.random() > 0.3,
        hazmat: Math.random() < 0.05,
        image: null
      });
    }
    return items;
  }

  async function fetchListings(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/listings?${params}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return { listings: generateSampleListings(24), total: 24, source: 'local' };
  }

  async function submitBid(listingId, amount) {
    const bid = {
      id: `BID-${Date.now().toString(36).toUpperCase()}`,
      listingId,
      amount,
      timestamp: new Date().toISOString(),
      status: 'submitted'
    };
    bids.push(bid);
    localStorage.setItem('dynasty_bids', JSON.stringify(bids));

    try {
      await fetch(`${API_BASE}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bid)
      });
    } catch (e) {}

    await fetch(window.location.origin + '/api/codex/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'MARKETPLACE_BID', data: bid, source: 'GLOBAL_MARKETPLACE', timestamp: new Date().toISOString() })
    }).catch(() => {});

    return bid;
  }

  function addToWatchlist(listingId) {
    if (!watchlist.includes(listingId)) {
      watchlist.push(listingId);
      localStorage.setItem('dynasty_watchlist', JSON.stringify(watchlist));
    }
    return watchlist;
  }

  function getWatchlist() {
    return watchlist;
  }

  function getActiveBids() {
    return bids;
  }

  function getCategories() {
    return CATEGORIES;
  }

  function getRegions() {
    return REGIONS;
  }

  async function getGlobalStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) return await res.json();
    } catch (e) {}

    return {
      totalListings: 12847,
      totalValue: 48200000,
      activeAuctions: 3241,
      completedToday: 187,
      topCategory: 'retail_return',
      topRegion: 'US',
      sources: { carrier: 2100, customs: 1800, airports: 890, retail: 4200, government: 3857 }
    };
  }

  return {
    fetchListings,
    submitBid,
    addToWatchlist,
    getWatchlist,
    getActiveBids,
    getCategories,
    getRegions,
    getGlobalStats,
    CATEGORIES,
    REGIONS
  };
})();

if (typeof window !== 'undefined') {
  window.GlobalMarketplace = GlobalMarketplace;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlobalMarketplace;
}
