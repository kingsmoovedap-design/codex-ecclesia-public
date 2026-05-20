/**
 * Dynasty-OS Reverse Logistics Suite — Entry Point
 * Initializes and wires all reverse logistics modules together.
 */

(function() {
  'use strict';

  function initReverseLogs() {
    if (typeof AuctionEngine === 'undefined' || typeof ContainerTracker === 'undefined' || typeof ReverseLogisticsModule === 'undefined') {
      console.warn('DynastyRL: Core modules not loaded yet — check script order.');
      return null;
    }

    const auctionEngine = new AuctionEngine();
    const containerTracker = new ContainerTracker();
    const reverseModule = new ReverseLogisticsModule({ auctionEngine, containerTracker });

    // Seed demo containers
    const demoContainers = [
      { id: 'CNTR-001', type: '40ft', contents: 'Electronics', declaredValue: 85000, status: 'abandoned', portCode: 'USLAX', daysAtPort: 45, taxOwed: 12000, carrier: 'MSC' },
      { id: 'CNTR-002', type: '20ft', contents: 'Clothing', declaredValue: 22000, status: 'seized', portCode: 'USHOU', daysAtPort: 12, taxOwed: 0, carrier: 'Hapag-Lloyd' },
      { id: 'CNTR-003', type: '40ft', contents: 'General Merchandise', declaredValue: 41000, status: 'delinquent', portCode: 'USSAV', daysAtPort: 60, taxOwed: 8500, carrier: 'Maersk' },
      { id: 'CNTR-004', type: '20ft', contents: 'Automotive Parts', declaredValue: 63000, status: 'in_transit', portCode: 'USLGB', daysAtPort: 3, taxOwed: 0, carrier: 'CMA CGM' },
      { id: 'CNTR-005', type: '40ft', contents: 'Food Products', declaredValue: 15000, status: 'abandoned', portCode: 'USNYC', daysAtPort: 90, taxOwed: 3200, carrier: 'Evergreen' }
    ];
    demoContainers.forEach(c => containerTracker.register(c));

    const DynastyRL = {
      auctionEngine,
      containerTracker,
      reverseModule,
      marketplace: typeof GlobalMarketplace !== 'undefined' ? GlobalMarketplace : null,
      blockchain: typeof BlockchainRegistry !== 'undefined' ? BlockchainRegistry : null,

      processItem(item) {
        return reverseModule.processInbound(item);
      },

      trackContainer(id) {
        return containerTracker.lookup(id);
      },

      async getMarketStats() {
        if (this.marketplace) return this.marketplace.getGlobalStats();
        return {};
      },

      async ingestAllFeeds() {
        return auctionEngine.ingestAllFeeds();
      },

      getAuctionEligible() {
        return containerTracker.getAuctionEligible();
      },

      getStats() {
        return {
          reverseLogistics: reverseModule.getStats(),
          containerTracker: containerTracker.getStats(),
          auctionEngine: auctionEngine.getGlobalInventory(),
          blockchain: this.blockchain ? this.blockchain.getNetworkInfo() : null
        };
      }
    };

    window.DynastyRL = DynastyRL;

    // Log init event to Codex
    fetch(window.location.origin + '/api/codex/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'REVERSE_LOGISTICS_INITIALIZED',
        data: DynastyRL.getStats(),
        source: 'DYNASTY_RL_SUITE',
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});

    console.log('Dynasty-OS Reverse Logistics Suite initialized.', DynastyRL.getStats());
    return DynastyRL;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReverseLogs);
  } else {
    initReverseLogs();
  }
})();
