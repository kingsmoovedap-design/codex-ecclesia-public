import { DivinityVXCore } from '../divinityvx/ai-core';

export class GlobalMarketplace extends DivinityVXCore {
  private listings: any[] = [];

  async listLoad(load: any) {
    const listing = { listed: true, id: `LOAD-${Date.now()}`, load, listedAt: new Date().toISOString() };
    this.listings.push(listing);
    this.log('MARKETPLACE_LIST_LOAD', listing);
    return listing;
  }

  async matchCarrier(load: any, carriers: any[]) {
    const match = carriers.find(c => !load.equipment || c.equipment === load.equipment) || carriers[0] || null;
    this.log('MARKETPLACE_MATCH_CARRIER', { loadId: load.id, match });
    return match;
  }

  getListings() {
    return this.listings;
  }
}
