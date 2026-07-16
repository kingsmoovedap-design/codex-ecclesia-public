import { DivinityVXRouting } from './ai-routing';
import { DivinityVXDispatch } from './ai-dispatch';
import { DivinityVXSettlement } from './ai-settlement';

export class DivinityVXAutonomy {
  routing = new DivinityVXRouting();
  dispatch = new DivinityVXDispatch();
  settlement = new DivinityVXSettlement();

  async fullAutonomy(load: { id: string; rateCents: number; origin?: string; destination?: string }, drivers: any[]) {
    const route = await this.routing.optimizeRoute(load);
    const assignment = await this.dispatch.autoAssign(load, drivers);
    const settlement = await this.settlement.autoSettle(load);
    return { route, assignment, settlement, autonomyLevel: 'FULL', ts: new Date().toISOString() };
  }
}
