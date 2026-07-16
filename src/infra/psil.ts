import { DivinityV5Core } from '../core/divinityv5-core';
import { MapPoint } from './rtml';

export interface EmergencyRoute {
  id: string;
  from: MapPoint;
  to: MapPoint;
  priority: 'NORMAL' | 'EMERGENCY';
  etaMinutes: number;
}

export class PublicSafetyIntegrationLayer extends DivinityV5Core {
  private activeRoutes: EmergencyRoute[] = [];

  async planEmergencyRoute(from: MapPoint, to: MapPoint): Promise<EmergencyRoute> {
    const route: EmergencyRoute = {
      id: `EMR-${Date.now()}`,
      from,
      to,
      priority: 'EMERGENCY',
      etaMinutes: 15,
    };
    this.activeRoutes.push(route);
    this.log('PSIL_EMERGENCY_ROUTE', route);
    return route;
  }

  getActiveRoutes() {
    return this.activeRoutes;
  }

  clearRoute(id: string) {
    this.activeRoutes = this.activeRoutes.filter(r => r.id !== id);
    this.log('PSIL_CLEAR_ROUTE', { id });
  }
}
