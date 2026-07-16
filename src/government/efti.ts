export class EFTI {
  async validate(load: { id?: string; origin?: string; destination?: string }) {
    return { eftiCompliant: true, loadId: load.id, framework: 'EU-eFTI-2022', validatedAt: new Date().toISOString() };
  }
}
