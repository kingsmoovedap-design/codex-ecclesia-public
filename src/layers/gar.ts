import { DivinityV5Core } from '../core/divinityv5-core';

export type AssetType = 'TRUCK' | 'TRAILER' | 'CONTAINER' | 'WAREHOUSE_SLOT' | 'VESSEL_SLOT' | 'AIR_BELLY' | 'RAIL_CAR';

export interface AssetRecord {
  id: string;
  type: AssetType;
  ownerId: string;
  valueCents: number;
  status: 'AVAILABLE' | 'LEASED' | 'IN_TRANSIT' | 'DELINQUENT';
  location: string;
}

export class GlobalAssetRegistry extends DivinityV5Core {
  private assets = new Map<string, AssetRecord>();

  register(asset: AssetRecord) {
    this.assets.set(asset.id, asset);
    this.log('GAR_REGISTER', asset);
    return asset;
  }

  updateStatus(id: string, status: AssetRecord['status']) {
    const asset = this.assets.get(id);
    if (!asset) return null;
    asset.status = status;
    this.log('GAR_STATUS_UPDATE', asset);
    return asset;
  }

  listByOwner(ownerId: string) {
    return Array.from(this.assets.values()).filter(a => a.ownerId === ownerId);
  }

  listAll() {
    return Array.from(this.assets.values());
  }

  listAvailable() {
    return Array.from(this.assets.values()).filter(a => a.status === 'AVAILABLE');
  }
}
