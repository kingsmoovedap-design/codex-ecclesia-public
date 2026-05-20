/**
 * Dynasty-OS Container Seizure & Abandonment Tracker
 * Tracks abandoned, seized, or tax-delinquent containers across global ports.
 */

class ContainerTracker {
  constructor() {
    this.registry = new Map();
    this.alerts = [];
    this.statusHistory = new Map();
    this.stats = {
      totalTracked: 0,
      byStatus: { abandoned: 0, seized: 0, delinquent: 0, cleared: 0, in_transit: 0, unknown: 0 }
    };

    this.portRegistry = {
      USLAX: { name: 'Port of Los Angeles', country: 'US', region: 'West Coast' },
      USLGB: { name: 'Port of Long Beach', country: 'US', region: 'West Coast' },
      USHOU: { name: 'Port of Houston', country: 'US', region: 'Gulf Coast' },
      USSAV: { name: 'Port of Savannah', country: 'US', region: 'East Coast' },
      USNYC: { name: 'Port of New York', country: 'US', region: 'East Coast' },
      DEHAM: { name: 'Port of Hamburg', country: 'DE', region: 'Europe' },
      NLRTM: { name: 'Port of Rotterdam', country: 'NL', region: 'Europe' },
      CNSHA: { name: 'Port of Shanghai', country: 'CN', region: 'Asia' },
      SGSIN: { name: 'Port of Singapore', country: 'SG', region: 'Asia' },
      AEDXB: { name: 'Port of Dubai (Jebel Ali)', country: 'AE', region: 'Middle East' }
    };
  }

  register(container) {
    const entry = {
      id: container.id,
      type: container.type || 'standard',
      contents: container.contents || 'unknown',
      weight: container.weight || null,
      declaredValue: container.declaredValue || null,
      origin: container.origin || null,
      destination: container.destination || null,
      portCode: container.portCode || null,
      carrier: container.carrier || null,
      status: container.status || 'unknown',
      daysAtPort: container.daysAtPort || 0,
      taxOwed: container.taxOwed || 0,
      ownerContact: container.ownerContact || null,
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      alerts: []
    };

    this.registry.set(entry.id, entry);
    this.statusHistory.set(entry.id, [{ status: entry.status, timestamp: entry.registeredAt }]);
    this.stats.totalTracked++;
    this.stats.byStatus[entry.status] = (this.stats.byStatus[entry.status] || 0) + 1;

    this._checkAlerts(entry);
    return entry;
  }

  lookup(containerId) {
    const entry = this.registry.get(containerId);
    if (!entry) {
      return {
        id: containerId,
        status: 'not_found',
        message: 'No record found in Dynasty-OS registry.',
        suggestion: 'Register this container or query external port databases.'
      };
    }
    return {
      ...entry,
      port: entry.portCode ? this.portRegistry[entry.portCode] : null,
      history: this.statusHistory.get(containerId) || [],
      auctionEligible: this._isAuctionEligible(entry)
    };
  }

  updateStatus(containerId, newStatus, note = '') {
    if (!this.registry.has(containerId)) return { error: 'Container not found' };

    const entry = this.registry.get(containerId);
    const oldStatus = entry.status;
    entry.status = newStatus;
    entry.lastUpdated = new Date().toISOString();
    this.registry.set(containerId, entry);

    const history = this.statusHistory.get(containerId) || [];
    history.push({ status: newStatus, from: oldStatus, timestamp: entry.lastUpdated, note });
    this.statusHistory.set(containerId, history);

    this.stats.byStatus[oldStatus] = Math.max(0, (this.stats.byStatus[oldStatus] || 1) - 1);
    this.stats.byStatus[newStatus] = (this.stats.byStatus[newStatus] || 0) + 1;

    this._checkAlerts(entry);
    return entry;
  }

  _checkAlerts(entry) {
    const alerts = [];
    if (entry.daysAtPort > 30) alerts.push({ level: 'critical', message: `Container ${entry.id} has been at port ${entry.daysAtPort} days — abandon threshold exceeded.` });
    if (entry.taxOwed > 5000) alerts.push({ level: 'high', message: `Container ${entry.id} has $${entry.taxOwed} in unpaid duties.` });
    if (entry.status === 'seized') alerts.push({ level: 'critical', message: `Container ${entry.id} has been seized by authorities.` });
    if (entry.status === 'abandoned' && entry.declaredValue > 1000) alerts.push({ level: 'high', message: `High-value abandoned container ${entry.id} — eligible for auction.` });

    if (alerts.length > 0) {
      entry.alerts = alerts;
      this.alerts.push(...alerts.map(a => ({ ...a, containerId: entry.id, timestamp: new Date().toISOString() })));
    }
  }

  _isAuctionEligible(entry) {
    return (
      (entry.status === 'abandoned' && entry.daysAtPort > 30) ||
      entry.status === 'seized' ||
      entry.status === 'delinquent'
    );
  }

  getAbandonedContainers() {
    return Array.from(this.registry.values()).filter(c => c.status === 'abandoned');
  }

  getSeizedContainers() {
    return Array.from(this.registry.values()).filter(c => c.status === 'seized');
  }

  getAuctionEligible() {
    return Array.from(this.registry.values()).filter(c => this._isAuctionEligible(c));
  }

  getActiveAlerts() {
    return this.alerts.slice(-100);
  }

  getStats() {
    return { ...this.stats, alerts: this.alerts.length };
  }

  getAllContainers() {
    return Array.from(this.registry.values());
  }

  getPorts() {
    return this.portRegistry;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContainerTracker;
}
if (typeof window !== 'undefined') {
  window.ContainerTracker = ContainerTracker;
}
