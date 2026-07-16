import { DivinityVXCore } from '../divinityvx/ai-core';

export interface Bid {
  bidderId: string;
  name: string;
  bid: number;
}

export class AuctionEngine extends DivinityVXCore {
  private auctions: any[] = [];

  async runAuction(load: any, bidders: Bid[]) {
    const sorted = bidders.sort((a, b) => b.bid - a.bid);
    const winner = sorted[0] || null;
    const auction = { id: `AUC-${Date.now()}`, load, winner, allBids: sorted, closedAt: new Date().toISOString() };
    this.auctions.push(auction);
    this.log('AUCTION_RESULT', auction);
    return auction;
  }

  getAuctions() { return this.auctions; }
}
