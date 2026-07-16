export class DivinityV5Core {
  protected log(event: string, payload: any) {
    const ts = new Date().toISOString();
    console.log(`[DivinityV5:${event}] ${ts}`, JSON.stringify(payload, null, 2));
  }
}
