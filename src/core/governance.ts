import { DivinityV5Core } from './divinityv5-core';
import { GlobalIdentityLayer, IdentityProfile } from '../layers/gil';
import { GlobalAssetRegistry, AssetRecord } from '../layers/gar';
import { GlobalComplianceGraph } from '../layers/gcg';
import { GlobalSettlementMesh, Currency } from '../layers/gsm';
import { GlobalRoutingFederation } from '../layers/grf';

export class DivinityV5Governance extends DivinityV5Core {
  gil: GlobalIdentityLayer;
  gar: GlobalAssetRegistry;
  gcg: GlobalComplianceGraph;
  gsm: GlobalSettlementMesh;
  grf: GlobalRoutingFederation;

  constructor(
    gil: GlobalIdentityLayer,
    gar: GlobalAssetRegistry,
    gcg: GlobalComplianceGraph,
    gsm: GlobalSettlementMesh,
    grf: GlobalRoutingFederation
  ) {
    super();
    this.gil = gil;
    this.gar = gar;
    this.gcg = gcg;
    this.gsm = gsm;
    this.grf = grf;
  }

  async governLoad(load: { id: string; rateCents: number; origin: string; destination: string }) {
    this.log('GOVERN_LOAD_START', load);

    const route = await this.grf.plan(load);

    const complianceNode = this.gcg.upsert({
      id: load.id,
      type: 'LOAD',
      region: 'GLOBAL',
      efti: true,
      ulip: true,
      afcfta: true,
      customsCleared: true,
      portProcessed: true,
      score: 0,
    });
    const evaluatedCompliance = this.gcg.evaluateLoad(load.id);

    const settlement = this.gsm.settle({
      loadId: load.id,
      payerId: 'SHIPPER-1',
      payeeId: 'CARRIER-1',
      amountCents: load.rateCents,
      currency: 'USD' as Currency,
      channel: 'STRIPE',
    });

    this.log('GOVERN_LOAD_COMPLETE', { route, compliance: evaluatedCompliance, settlement });
    return { route, compliance: evaluatedCompliance, settlement };
  }

  registerIdentity(profile: IdentityProfile) {
    const res = this.gil.register(profile);
    this.log('GOVERN_IDENTITY_REGISTER', res);
    return res;
  }

  registerAsset(asset: AssetRecord) {
    const res = this.gar.register(asset);
    this.log('GOVERN_ASSET_REGISTER', res);
    return res;
  }

  updateAssetStatus(id: string, status: AssetRecord['status']) {
    const res = this.gar.updateStatus(id, status);
    this.log('GOVERN_ASSET_STATUS_UPDATE', res);
    return res;
  }

  snapshot() {
    const usdVolume = this.gsm.volumeByCurrency('USD');
    const usdcVolume = this.gsm.volumeByCurrency('USDC');
    const bscVolume = this.gsm.volumeByCurrency('BSC');
    const snap = { settlement: { usdVolume, usdcVolume, bscVolume } };
    this.log('GOVERN_SNAPSHOT', snap);
    return snap;
  }
}
