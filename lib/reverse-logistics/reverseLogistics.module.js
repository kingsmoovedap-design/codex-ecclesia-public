/**
 * Dynasty-OS Reverse Logistics Module
 * Handles returns, overgoods, abandoned freight, customs seizures,
 * and distressed logistics inventory.
 */

class ReverseLogisticsModule {
  constructor({ auctionEngine, containerTracker }) {
    this.auctionEngine = auctionEngine;
    this.containerTracker = containerTracker;
    this.processedItems = new Map();
    this.stats = {
      totalProcessed: 0,
      byCategory: {
        retail_return: 0,
        carrier_overgoods: 0,
        abandoned_cargo: 0,
        customs_seizure: 0,
        airport_unclaimed: 0,
        government_surplus: 0,
        unclassified: 0
      }
    };
  }

  classifyItem(item) {
    if (item.status === 'returned') return 'retail_return';
    if (item.status === 'undeliverable' || item.status === 'overgoods') return 'carrier_overgoods';
    if (item.status === 'abandoned') return 'abandoned_cargo';
    if (item.status === 'seized' || item.status === 'confiscated') return 'customs_seizure';
    if (item.status === 'unclaimed' && item.source === 'airport') return 'airport_unclaimed';
    if (item.source === 'government' || item.source === 'gsa') return 'government_surplus';
    return 'unclassified';
  }

  processInbound(item) {
    const category = this.classifyItem(item);
    const valuation = this.auctionEngine.estimateValue(item);
    const eligibleAuctions = this.auctionEngine.matchAuctions(category);
    const complianceStatus = this.validateCompliance(item);

    const processed = {
      id: item.id || `RL-${Date.now().toString(36).toUpperCase()}`,
      originalItem: item,
      category,
      valuation,
      eligibleAuctions,
      compliance: complianceStatus,
      processingTimestamp: new Date().toISOString(),
      recommendedAction: this.recommendAction(category, valuation, complianceStatus)
    };

    this.processedItems.set(processed.id, processed);
    this.stats.totalProcessed++;
    this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;

    return processed;
  }

  validateCompliance(item) {
    return {
      hazmat: item.hazmat === true ? 'requires_special_handling' : 'clear',
      customs: item.customsCleared ? 'cleared' : 'requires_clearance',
      documentation: item.hasDocuments ? 'complete' : 'incomplete',
      eligible: !item.hazmat && (item.customsCleared !== false)
    };
  }

  recommendAction(category, valuation, compliance) {
    if (!compliance.eligible) return 'hold_for_compliance';
    if (valuation.estimated > 1000) return 'priority_auction';
    if (category === 'retail_return' && valuation.conditionFactor > 0.6) return 'resale';
    if (category === 'customs_seizure') return 'government_auction';
    if (valuation.estimated < 50) return 'bulk_liquidation';
    return 'standard_auction';
  }

  trackContainer(containerId) {
    return this.containerTracker.lookup(containerId);
  }

  getStats() {
    return { ...this.stats };
  }

  getProcessedItems() {
    return Array.from(this.processedItems.values());
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReverseLogisticsModule;
}
if (typeof window !== 'undefined') {
  window.ReverseLogisticsModule = ReverseLogisticsModule;
}
