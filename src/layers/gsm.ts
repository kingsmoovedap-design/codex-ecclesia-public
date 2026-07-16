import { DivinityV5Core } from '../core/divinityv5-core';

export type Currency = 'USD' | 'USDC' | 'BSC';

export interface SettlementEvent {
  id: string;
  loadId: string;
  payerId: string;
  payeeId: string;
  amountCents: number;
  currency: Currency;
  channel: 'STRIPE' | 'CIRCLE' | 'BSC_CONTRACT';
  timestamp: number;
}

export class GlobalSettlementMesh extends DivinityV5Core {
  private events: SettlementEvent[] = [];

  settle(event: Omit<SettlementEvent, 'id' | 'timestamp'>) {
    const record: SettlementEvent = {
      ...event,
      id: `SET-${Date.now()}`,
      timestamp: Date.now(),
    };
    this.events.push(record);
    this.log('GSM_SETTLE', record);
    return record;
  }

  listByLoad(loadId: string) {
    return this.events.filter(e => e.loadId === loadId);
  }

  volumeByCurrency(currency: Currency) {
    return this.events
      .filter(e => e.currency === currency)
      .reduce((sum, e) => sum + e.amountCents, 0);
  }

  totalVolume() {
    return this.events.reduce((sum, e) => sum + e.amountCents, 0);
  }

  recentEvents(limit = 20) {
    return this.events.slice(-limit).reverse();
  }
}
