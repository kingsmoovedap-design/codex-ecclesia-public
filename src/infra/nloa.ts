import { DivinityV5Core } from '../core/divinityv5-core';

export interface NationalOSContext {
  countryCode: string;
  programName: string;
  apiBaseUrl: string;
}

export class NationalLogisticsOSAdapter extends DivinityV5Core {
  private contexts = new Map<string, NationalOSContext>();

  registerContext(ctx: NationalOSContext) {
    this.contexts.set(ctx.countryCode, ctx);
    this.log('NLOA_REGISTER', ctx);
    return ctx;
  }

  getContext(countryCode: string) {
    return this.contexts.get(countryCode) || null;
  }

  listContexts() {
    return Array.from(this.contexts.values());
  }

  async pushSupplyChainSnapshot(countryCode: string, snapshot: any) {
    const ctx = this.contexts.get(countryCode);
    if (!ctx) {
      this.log('NLOA_NO_CONTEXT', { countryCode });
      return { error: 'No context registered for country', countryCode };
    }
    this.log('NLOA_PUSH_SNAPSHOT', { countryCode, program: ctx.programName, snapshot });
    return { pushed: true, program: ctx.programName, countryCode, ts: Date.now() };
  }
}
