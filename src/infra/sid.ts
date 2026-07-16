import { DivinityV5Core } from '../core/divinityv5-core';
import { TrafficSegment } from './rtml';
import { GovIncident } from './gdil';

export interface SocietalImpactSnapshot {
  timestamp: number;
  traffic: { segments: TrafficSegment[] };
  congestion: { avgLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE' };
  supplyChain: { healthScore: number };
  emergencyRouting: { activeRoutes: number };
  assets: { availableCount: number };
}

export class SocietalImpactDashboard extends DivinityV5Core {
  private snapshots: SocietalImpactSnapshot[] = [];

  async buildSnapshot(params: {
    trafficSegments: TrafficSegment[];
    incidents: GovIncident[];
    activeEmergencyRoutes: number;
    availableAssets: number;
  }): Promise<SocietalImpactSnapshot> {
    const { trafficSegments, incidents, activeEmergencyRoutes, availableAssets } = params;

    const congestionScore: SocietalImpactSnapshot['congestion']['avgLevel'] =
      trafficSegments.length === 0
        ? 'LOW'
        : trafficSegments.some(s => s.congestionLevel === 'SEVERE')
        ? 'SEVERE'
        : trafficSegments.some(s => s.congestionLevel === 'HIGH')
        ? 'HIGH'
        : trafficSegments.some(s => s.congestionLevel === 'MEDIUM')
        ? 'MEDIUM'
        : 'LOW';

    const supplyChainHealth = incidents.length === 0 ? 95 : Math.max(40, 95 - incidents.length * 3);

    const snapshot: SocietalImpactSnapshot = {
      timestamp: Date.now(),
      traffic: { segments: trafficSegments },
      congestion: { avgLevel: congestionScore },
      supplyChain: { healthScore: supplyChainHealth },
      emergencyRouting: { activeRoutes: activeEmergencyRoutes },
      assets: { availableCount: availableAssets },
    };

    this.snapshots.push(snapshot);
    this.log('SID_SNAPSHOT', snapshot);
    return snapshot;
  }

  latestSnapshot() {
    return this.snapshots[this.snapshots.length - 1] || null;
  }
}
