export class PortAuthority {
  async process(load: { id?: string; origin?: string }) {
    return { portProcessed: true, loadId: load.id, portRef: `PORT-${Date.now()}`, processedAt: new Date().toISOString() };
  }
}
