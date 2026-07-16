import { DivinityV5Core } from '../core/divinityv5-core';

export type IdentityType = 'CARRIER' | 'DRIVER' | 'ASSET' | 'WAREHOUSE' | 'PORT' | 'CUSTOMS';

export interface IdentityProfile {
  id: string;
  type: IdentityType;
  name: string;
  country: string;
  complianceScore: number;
  routingProfile?: any;
  settlementProfile?: any;
}

export class GlobalIdentityLayer extends DivinityV5Core {
  private registry = new Map<string, IdentityProfile>();

  register(profile: IdentityProfile) {
    this.registry.set(profile.id, profile);
    this.log('GIL_REGISTER', profile);
    return profile;
  }

  get(id: string) {
    return this.registry.get(id) || null;
  }

  listByType(type: IdentityType) {
    return Array.from(this.registry.values()).filter(p => p.type === type);
  }

  listAll() {
    return Array.from(this.registry.values());
  }

  verifyGovernmentIdentity(id: string) {
    const profile = this.registry.get(id);
    this.log('GIL_VERIFY_GOV_ID', { id, found: !!profile });
    return { id, verified: !!profile, profile: profile || null };
  }
}
