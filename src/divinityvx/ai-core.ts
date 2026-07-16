export class DivinityVXCore {
  log(event: string, payload: any) {
    const ts = new Date().toISOString();
    console.log(`[DivinityVX:${event}] ${ts}`, JSON.stringify(payload, null, 2));
  }
}
