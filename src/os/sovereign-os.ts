import { DivinityV5Core } from '../core/divinityv5-core';
import { GlobalIdentityLayer } from '../layers/gil';
import { GlobalAssetRegistry } from '../layers/gar';
import { GlobalComplianceGraph } from '../layers/gcg';
import { GlobalSettlementMesh } from '../layers/gsm';
import { GlobalRoutingFederation } from '../layers/grf';
import { DivinityV5Governance } from '../core/governance';

import { RealTimeMappingLayer } from '../infra/rtml';
import { GovernmentDataIngestionLayer } from '../infra/gdil';
import { PublicSafetyIntegrationLayer } from '../infra/psil';
import { NationalLogisticsOSAdapter } from '../infra/nloa';
import { SocietalImpactDashboard } from '../infra/sid';

import { DivinityVXAutonomy } from '../divinityvx/ai-autonomy';
import { DivinityVXGlobal } from '../divinityvx/ai-global';
import { DivinityVXGovernment } from '../divinityvx/ai-government';

import { GlobalMarketplace } from '../marketplace/global-marketplace';
import { AuctionEngine } from '../marketplace/auctions';
import { ReverseLogistics } from '../marketplace/reverse-logistics';
import { FleetLeasing } from '../marketplace/fleet-leasing';
import { ComplianceMarket } from '../marketplace/compliance-market';

import { EFTI } from '../government/efti';
import { ULIP } from '../government/ulip';
import { AfCFTA } from '../government/afcfta';
import { Customs } from '../government/customs';
import { PortAuthority } from '../government/ports';

export class SovereignOS extends DivinityV5Core {
  // ── DivinityV5 Core Layers ─────────────────────────────────────
  gil   = new GlobalIdentityLayer();
  gar   = new GlobalAssetRegistry();
  gcg   = new GlobalComplianceGraph();
  gsm   = new GlobalSettlementMesh();
  grf   = new GlobalRoutingFederation();
  governance = new DivinityV5Governance(
    this.gil, this.gar, this.gcg, this.gsm, this.grf
  );

  // ── Infrastructure Modules ─────────────────────────────────────
  rtml  = new RealTimeMappingLayer();
  gdil  = new GovernmentDataIngestionLayer();
  psil  = new PublicSafetyIntegrationLayer();
  nloa  = new NationalLogisticsOSAdapter();
  sid   = new SocietalImpactDashboard();

  // ── DivinityVX AI Evolution ────────────────────────────────────
  autonomy = new DivinityVXAutonomy();
  global   = new DivinityVXGlobal();
  govAI    = new DivinityVXGovernment();

  // ── Global Marketplace ─────────────────────────────────────────
  marketplace = new GlobalMarketplace();
  auctions    = new AuctionEngine();
  reverse     = new ReverseLogistics();
  fleet       = new FleetLeasing();
  compliance  = new ComplianceMarket();

  // ── Government Integrations ────────────────────────────────────
  efti    = new EFTI();
  ulip    = new ULIP();
  afcfta  = new AfCFTA();
  customs = new Customs();
  ports   = new PortAuthority();

  constructor() {
    super();
    // Seed NLOA with default national OS contexts
    this.nloa.registerContext({ countryCode: 'US',  programName: 'FMCSA-Connect',  apiBaseUrl: 'https://ai.fmcsa.dot.gov/api' });
    this.nloa.registerContext({ countryCode: 'EU',  programName: 'eFTI',           apiBaseUrl: 'https://efti.eu/api' });
    this.nloa.registerContext({ countryCode: 'IN',  programName: 'ULIP',           apiBaseUrl: 'https://ulip.dpiit.gov.in/api' });
    this.nloa.registerContext({ countryCode: 'AF',  programName: 'AfCFTA-Digital', apiBaseUrl: 'https://au.int/afcfta/api' });
    this.log('SOVEREIGN_OS_BOOT', { modules: ['GIL','GAR','GCG','GSM','GRF','RTML','GDIL','PSIL','NLOA','SID','DVX-Autonomy','Marketplace','Gov-Integrations'], ts: new Date().toISOString() });
  }

  // ── Full Sovereign Orchestration ──────────────────────────────
  async orchestrate(load: {
    id: string;
    rateCents: number;
    origin: string;
    destination: string;
  }, drivers: any[] = [], carriers: any[] = []) {
    this.log('SOVEREIGN_ORCHESTRATE_START', { load });

    const [auto, global, gov, listing, match, efti, ulip, afcfta, customs, port] = await Promise.all([
      this.autonomy.fullAutonomy(load, drivers),
      this.global.globalOptimize(load),
      this.govAI.applyCompliance(load),
      this.marketplace.listLoad(load),
      this.marketplace.matchCarrier(load, carriers),
      this.efti.validate(load),
      this.ulip.sync(load),
      this.afcfta.authorize(load),
      this.customs.clear(load),
      this.ports.process(load),
    ]);

    const result = { auto, global, gov, listing, match, efti, ulip, afcfta, customs, port };
    this.log('SOVEREIGN_ORCHESTRATE_COMPLETE', { loadId: load.id });
    return result;
  }

  // ── Full Orchestration with Societal View ─────────────────────
  async orchestrateWithSocietalView(load: {
    id: string;
    rateCents: number;
    origin: { lat: number; lng: number; label: string };
    destination: { lat: number; lng: number; label: string };
  }) {
    const core = await this.governance.governLoad({
      id: load.id,
      rateCents: load.rateCents,
      origin: load.origin.label,
      destination: load.destination.label,
    });

    const [trafficSegments, emergencyRoute] = await Promise.all([
      this.rtml.getTrafficBetween({ lat: load.origin.lat, lng: load.origin.lng }, { lat: load.destination.lat, lng: load.destination.lng }),
      this.psil.planEmergencyRoute({ lat: load.origin.lat, lng: load.origin.lng }, { lat: load.destination.lat, lng: load.destination.lng }),
    ]);

    const incidents = this.gdil.getRecentIncidents(50);
    const snapshot = await this.sid.buildSnapshot({
      trafficSegments,
      incidents,
      activeEmergencyRoutes: this.psil.getActiveRoutes().length,
      availableAssets: this.gar.listAvailable().length,
    });

    this.log('SOVEREIGN_ORCHESTRATE_SOCIAL', { core, snapshot, emergencyRoute });
    return { core, snapshot, emergencyRoute };
  }

  // ── Global Health Snapshot ─────────────────────────────────────
  globalSnapshot() {
    const govSnap = this.governance.snapshot();
    const sidSnap = this.sid.latestSnapshot();
    const incidents = this.gdil.getRecentIncidents(10);
    const activeEmergency = this.psil.getActiveRoutes().length;
    const allAssets = this.gar.listAll();
    const allIdentities = this.gil.listAll();
    const allNodes = this.gcg.listAll();
    const recentSettlements = this.gsm.recentEvents(10);
    const totalVolume = this.gsm.totalVolume();
    const nloa = this.nloa.listContexts();

    return {
      ts: new Date().toISOString(),
      modules: {
        GIL: { identities: allIdentities.length },
        GAR: { assets: allAssets.length, available: allAssets.filter(a => a.status === 'AVAILABLE').length },
        GCG: { complianceNodes: allNodes.length },
        GSM: { totalVolumeUSD: (totalVolume / 100).toFixed(2), recentSettlements: recentSettlements.length },
        GRF: { status: 'ACTIVE' },
        RTML: { status: 'LIVE' },
        GDIL: { recentIncidents: incidents.length },
        PSIL: { activeEmergencyRoutes: activeEmergency },
        NLOA: { registeredPrograms: nloa.length, programs: nloa.map(c => c.programName) },
        SID: { lastSnapshot: sidSnap?.timestamp || null, supplyChainHealth: sidSnap?.supplyChain.healthScore || 95 },
      },
      settlement: govSnap.settlement,
      latestSID: sidSnap,
      recentIncidents: incidents,
      nloa,
      operationalStatus: 'ONLINE',
      dynastyEntity: 'Borders Ecclesia Earth Trust (508c1A)',
    };
  }
}

// Singleton — shared across all route handlers
export const sovereignOS = new SovereignOS();
