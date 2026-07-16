import { DivinityV5Core } from '../core/divinityv5-core';

export interface GovIncident {
  id: string;
  type: 'ACCIDENT' | 'CONSTRUCTION' | 'CLOSURE' | 'WEATHER';
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  source: 'DOT' | 'FMCSA' | '511' | 'ITS' | 'PORT';
  timestamp: number;
}

export class GovernmentDataIngestionLayer extends DivinityV5Core {
  private incidents: GovIncident[] = [];

  async ingestFeed(source: GovIncident['source'], raw: any[]): Promise<void> {
    const mapped = raw.map((r, idx) => ({
      id: `${source}-${Date.now()}-${idx}`,
      type: (r.type || 'ACCIDENT') as GovIncident['type'],
      location: r.location || 'UNKNOWN',
      severity: (r.severity || 'MEDIUM') as GovIncident['severity'],
      source,
      timestamp: Date.now(),
    }));
    this.incidents.push(...mapped);
    this.log('GDIL_INGEST', { source, count: mapped.length });
  }

  getRecentIncidents(limit = 50): GovIncident[] {
    return this.incidents.slice(-limit);
  }

  clearOld(olderThanMs = 3600000) {
    const cutoff = Date.now() - olderThanMs;
    const before = this.incidents.length;
    this.incidents = this.incidents.filter(i => i.timestamp > cutoff);
    this.log('GDIL_CLEAR_OLD', { removed: before - this.incidents.length });
  }
}
