import { DivinityV5Core } from '../core/divinityv5-core';

export type Mode = 'GROUND' | 'AIR' | 'RAIL' | 'MARITIME' | 'DRAYAGE';

export interface RoutePlan {
  loadId: string;
  chain: Mode[];
  etaHours: number;
  costCents: number;
  regions: string[];
}

export class GlobalRoutingFederation extends DivinityV5Core {
  async plan(load: { id: string; rateCents: number; origin: string; destination: string }) {
    const chain: Mode[] = ['GROUND', 'AIR', 'GROUND'];
    const plan: RoutePlan = {
      loadId: load.id,
      chain,
      etaHours: 48,
      costCents: Math.round(load.rateCents * 0.9),
      regions: ['US', 'EU'],
    };
    this.log('GRF_PLAN', plan);
    return plan;
  }

  planRoute(origin: string, destination: string, mode: string) {
    const etaMinutes = 120;
    this.log('GRF_PLAN_ROUTE', { origin, destination, mode, etaMinutes });
    return { origin, destination, mode, etaMinutes };
  }
}
