export class ULIP {
  async sync(load: { id?: string }) {
    return { ulipSynced: true, loadId: load.id, platform: 'INDIA-ULIP', syncedAt: new Date().toISOString() };
  }
}
