type ModuleState = "online" | "ready" | "watch";

export interface PlatformEvent {
  id: string;
  type: string;
  source: string;
  message: string;
  timestamp: string;
  data?: unknown;
}

export interface LogisticsLoad {
  id: string;
  origin: string;
  destination: string;
  commodity: string;
  rateCents: number;
  status: "available" | "assigned" | "in_transit" | "delivered";
  carrier?: string;
  etaHours?: number;
  createdAt: string;
}

export interface NonprofitProject {
  id: string;
  title: string;
  projectType: string;
  targetPopulation: string;
  location: string;
  localConcerns: string;
  desiredOutcomes: string;
  organizationType: "nonprofit" | "community_group" | "public_agency";
  status: "draft" | "active" | "submitted";
}

export interface DynastyPolicy {
  id: string;
  carrier: string;
  insuredName: string;
  faceAmount: number;
  acquisitionCost: number;
  annualPremium: number;
  expectedMaturityYear: number;
  status: "active" | "matured" | "lapsed";
}

export interface MarketPolicy {
  id: string;
  carrier: string;
  insuredAge: number;
  faceAmount: number;
  premiumAnnual: number;
  healthScore: number;
  sellerId: string;
  status: "listed" | "under_review" | "sold" | "closed";
}

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class OmegaPlatform {
  private readonly startedAt = now();
  private events: PlatformEvent[] = [];
  private loads: LogisticsLoad[] = [
    {
      id: "LOAD-ATL-DAL-001",
      origin: "Atlanta, GA",
      destination: "Dallas, TX",
      commodity: "Temperature controlled food",
      rateCents: 250000,
      status: "available",
      etaHours: 36,
      createdAt: now(),
    },
    {
      id: "LOAD-SAV-CHI-002",
      origin: "Savannah, GA",
      destination: "Chicago, IL",
      commodity: "Manufactured goods",
      rateCents: 318000,
      status: "assigned",
      carrier: "Borders Fleet 07",
      etaHours: 29,
      createdAt: now(),
    },
  ];
  private projects: NonprofitProject[] = [
    {
      id: "PRJ-SAFE-001",
      title: "Neighborhood Mobility & Safety Network",
      projectType: "youth_safety",
      targetPopulation: "Youth and families",
      location: "Atlanta, GA",
      localConcerns: "Safe transportation, community response time, and neighborhood connectivity.",
      desiredOutcomes: "Lower response times and create supervised mobility pathways for youth.",
      organizationType: "nonprofit",
      status: "active",
    },
  ];
  private partners: Array<{ id: string; projectId: string; organization: string; role: string; status: string }> = [
    { id: "PARTNER-001", projectId: "PRJ-SAFE-001", organization: "Community Transit Alliance", role: "Mobility partner", status: "active" },
  ];
  private dynastyPolicies: DynastyPolicy[] = [
    { id: "DYN-POL-001", carrier: "Northstar Life", insuredName: "Policyholder A", faceAmount: 1250000, acquisitionCost: 462000, annualPremium: 38400, expectedMaturityYear: 2032, status: "active" },
    { id: "DYN-POL-002", carrier: "Horizon Mutual", insuredName: "Policyholder B", faceAmount: 890000, acquisitionCost: 310000, annualPremium: 27600, expectedMaturityYear: 2029, status: "active" },
  ];
  private marketPolicies: MarketPolicy[] = [
    { id: "MKT-POL-101", carrier: "Evergreen Assurance", insuredAge: 82, faceAmount: 980000, premiumAnnual: 31500, healthScore: 87, sellerId: "BROKER-ATL-4", status: "listed" },
    { id: "MKT-POL-102", carrier: "Civic Life", insuredAge: 76, faceAmount: 640000, premiumAnnual: 22800, healthScore: 72, sellerId: "BROKER-DAL-2", status: "under_review" },
  ];
  private creditListings = [
    { id: "CRD-001", program: "Community Connectivity Credits", issuer: "Ecclesia Impact Rail", available: 18400, priceCents: 1250, status: "open" },
    { id: "CRD-002", program: "Fleet Modernization Credits", issuer: "TreasuryOS", available: 9200, priceCents: 2100, status: "open" },
  ];
  private zones = [
    { id: "ZONE-ATL-01", name: "Atlanta Operations Mesh", type: "MUNICIPAL", coverage: 94, policy: "priority-logistics" },
    { id: "ZONE-DAL-02", name: "Dallas Freight Corridor", type: "FREIGHT", coverage: 88, policy: "verified-identity" },
    { id: "ZONE-SAV-03", name: "Savannah Port Gateway", type: "PORT", coverage: 91, policy: "customs-clearance" },
  ];

  constructor() {
    this.record("PLATFORM_BOOT", "OmegaPlatform", "Omega command plane initialized");
  }

  private record(type: string, source: string, message: string, data?: unknown): PlatformEvent {
    const event = { id: id("EVT"), type, source, message, timestamp: now(), data };
    this.events.push(event);
    if (this.events.length > 200) this.events.shift();
    return event;
  }

  status() {
    return {
      platform: "OMEGA COMMAND PLANE",
      version: "2.0.0",
      owner: "Borders Ecclesia Earth Trust",
      status: "ONLINE",
      uptimeSeconds: Math.floor((Date.now() - new Date(this.startedAt).getTime()) / 1000),
      modules: [
        { id: "LOGISTICS", name: "Sovereign Logistics", status: "online" as ModuleState, detail: `${this.loads.length} active loads` },
        { id: "DIGITAL_TWIN", name: "Global Digital Twin", status: "online" as ModuleState, detail: "Scenario engine ready" },
        { id: "NONPROFIT", name: "Public Safety & Grants", status: "ready" as ModuleState, detail: `${this.projects.length} projects` },
        { id: "LIFE_SETTLEMENT", name: "Life Settlement OS", status: "ready" as ModuleState, detail: "Dual-track controls active" },
        { id: "TREASURY", name: "TreasuryOS", status: "online" as ModuleState, detail: "Liquidity rail connected" },
        { id: "CONNECTIVITY", name: "ConnectivityOS", status: "watch" as ModuleState, detail: "3 mesh zones monitored" },
        { id: "GOVERNANCE", name: "Divinity Governance", status: "online" as ModuleState, detail: "Event spine recording" },
      ],
      counts: {
        loads: this.loads.length,
        availableLoads: this.loads.filter((load) => load.status === "available").length,
        projects: this.projects.length,
        dynastyPolicies: this.dynastyPolicies.length,
        marketListings: this.marketPolicies.filter((policy) => policy.status === "listed").length,
        events: this.events.length,
      },
      timestamp: now(),
    };
  }

  overview() {
    const faceAmount = this.dynastyPolicies.filter((p) => p.status === "active").reduce((sum, p) => sum + p.faceAmount, 0);
    const acquisitionCost = this.dynastyPolicies.filter((p) => p.status === "active").reduce((sum, p) => sum + p.acquisitionCost, 0);
    return {
      ...this.status(),
      loads: this.loads,
      projects: this.projects,
      treasury: {
        availableCredits: 27600,
        dynastyFaceAmount: faceAmount,
        dynastyAcquisitionCost: acquisitionCost,
        commercialPremiumAnnual: this.marketPolicies.reduce((sum, p) => sum + p.premiumAnnual, 0),
        liquidityStatus: "balanced",
      },
      recentEvents: [...this.events].reverse().slice(0, 8),
    };
  }

  orchestrate(input: { id?: string; origin?: string; destination?: string; rateCents?: number; commodity?: string }) {
    const load: LogisticsLoad = {
      id: input.id || id("LOAD"),
      origin: input.origin || "Atlanta, GA",
      destination: input.destination || "Dallas, TX",
      commodity: input.commodity || "General freight",
      rateCents: Number(input.rateCents) || 250000,
      status: "available",
      etaHours: 36,
      createdAt: now(),
    };
    this.loads.unshift(load);
    const event = this.record("ROUTE_DECISION", "Sovereign Logistics", `Route optimized ${load.origin} → ${load.destination}`, load);
    return {
      accepted: true,
      auto: {
        route: { optimized: true, chain: ["GROUND", "AIR", "GROUND"], etaHours: 36, costCents: Math.round(load.rateCents * 0.92), loadId: load.id },
        assignment: { loadId: load.id, assigned: null, confidence: 0.92 },
        settlement: { settled: true, loadId: load.id, carrierNetCents: Math.round(load.rateCents * 0.97) },
      },
      governance: { eventId: event.id, coherence: "stable", compliance: "pre-cleared" },
      global: { chain: ["GROUND", "AIR", "RAIL", "MARITIME", "DRAYAGE"], etaHours: 72, globalClearance: true, regions: ["US", "EU", "AFRICA", "ASIA"] },
    };
  }

  createLoad(input: Partial<LogisticsLoad>) {
    return this.orchestrate(input);
  }

  assignLoad(loadId: string, carrier: string) {
    const load = this.loads.find((item) => item.id === loadId);
    if (!load) return null;
    load.status = "assigned";
    load.carrier = carrier;
    this.record("DISPATCH_ASSIGNED", "Dispatch Federation", `${loadId} assigned to ${carrier}`, { loadId, carrier });
    return load;
  }

  twinSnapshot() {
    return {
      id: id("TWIN"),
      snapshotTime: now(),
      state: { loads: this.loads, carriers: ["Borders Fleet 07", "Atlantic Carrier Group"], ports: ["Savannah", "Long Beach"], congestion: { atlanta: 0.31, dallas: 0.22 }, treasury: this.overview().treasury },
    };
  }

  simulateTwin(type: "REROUTE" | "REPRICE" | "INCENTIVES") {
    const available = this.loads.filter((load) => load.status === "available");
    const factor = type === "REROUTE" ? 0.88 : type === "REPRICE" ? 1.08 : 0.96;
    const result = {
      type,
      simulatedAt: now(),
      impactOnLoads: { affected: available.length, projectedEtaHours: type === "REROUTE" ? 31 : 36 },
      impactOnCarriers: { eligible: 12, projectedUtilization: `${Math.round(78 * factor)}%` },
      impactOnFees: { projectedNetworkFeesCents: Math.round(available.reduce((sum, load) => sum + load.rateCents, 0) * 0.03 * factor) },
      impactOnCredits: { recommendedIssuance: type === "INCENTIVES" ? 2400 : 800 },
      impactOnCongestion: { corridorDelta: type === "REROUTE" ? "-12%" : "+0%" },
    };
    this.record("TWIN_SCENARIO", "Global Digital Twin", `${type} scenario simulated`, result);
    return result;
  }

  getProjects() { return this.projects; }

  private getProject(projectId: string) { return this.projects.find((project) => project.id === projectId) || this.projects[0]; }

  eligibility(projectId: string) {
    const project = this.getProject(projectId);
    const safetyTypes = ["crime_prevention", "youth_safety", "community_engagement", "tech", "neighborhood_watch"];
    const pathway = safetyTypes.includes(project.projectType) ? "Option A" : project.organizationType === "community_group" ? "Option C" : "Option B";
    return { project, pathway, requiredDocuments: ["Project narrative", "Organization profile", "Budget and sustainability plan"], requiredPartners: pathway === "Option A" ? ["Law enforcement or public safety partner"] : ["Community or agency partner"] };
  }

  priorities(projectId: string) {
    const project = this.getProject(projectId);
    return {
      project,
      priorities: [
        { id: "PRIORITY-01", agency: "Regional Safety Council", name: "Youth safety and mobility", level: "regional", match: 94 },
        { id: "PRIORITY-02", agency: "Connectivity Office", name: "Resilient community infrastructure", level: "state", match: 81 },
      ],
      grants: [
        { id: "GRANT-01", name: "Community Safety Innovation Fund", agency: "Regional Safety Council", fit: 92, deadline: "Rolling" },
        { id: "GRANT-02", name: "Connected Corridors Pilot", agency: "Connectivity Office", fit: 78, deadline: "2026-10-15" },
      ],
    };
  }

  addPartner(projectId: string, organization: string, role: string) {
    const partner = { id: id("PARTNER"), projectId, organization, role, status: "draft" };
    this.partners.push(partner);
    this.record("PARTNERSHIP_DRAFTED", "Public Safety & Grants", `${organization} added to project`, partner);
    return partner;
  }

  grantPackage(projectId: string) {
    const project = this.getProject(projectId);
    const partnerships = this.partners.filter((partner) => partner.projectId === project.id);
    return {
      project,
      partnerships,
      needsAssessment: `Based on local concerns: ${project.localConcerns}`,
      problemStatement: `This project addresses ${project.projectType} issues in ${project.location}.`,
      narrative: `The project titled "${project.title}" aims to ${project.desiredOutcomes}`,
      budgetTemplate: { lineItems: [{ label: "Program delivery", amount: 50000 }, { label: "Community coordination", amount: 18000 }], total: 68000 },
      sustainabilityPlan: "Sustainability will be achieved through ongoing partnerships, diversified funding, and measured outcomes.",
      generatedAt: now(),
    };
  }

  compliance(projectId: string) {
    return { projectId, score: 86, status: "review", checks: [{ label: "Organization profile", status: "pass" }, { label: "Partner evidence", status: "pass" }, { label: "Budget detail", status: "review" }, { label: "Outcome measures", status: "pass" }] };
  }

  dynastyPortfolio() {
    const policies = this.dynastyPolicies.filter((policy) => policy.status !== "lapsed");
    return {
      policies,
      controls: { allowExternalInvestors: false, allowMarketplaceListing: false, allowDynastyCapitalOnly: true, requireTrustOwnership: true, ledgerRail: "DYNASTY", safetyProfile: "DYNASTY_ACTUARIAL" },
      snapshot: {
        totalFaceAmount: policies.filter((p) => p.status === "active").reduce((sum, p) => sum + p.faceAmount, 0),
        totalAcquisitionCost: policies.filter((p) => p.status === "active").reduce((sum, p) => sum + p.acquisitionCost, 0),
        totalPremiumAnnual: policies.filter((p) => p.status === "active").reduce((sum, p) => sum + p.annualPremium, 0),
        activeCount: policies.filter((p) => p.status === "active").length,
        maturedCount: policies.filter((p) => p.status === "matured").length,
      },
    };
  }

  marketListings() {
    return {
      listings: this.marketPolicies.filter((policy) => policy.status === "listed").map((policy) => ({
        policy,
        underwriting: this.underwrite(policy),
        quote: { bidPrice: Math.round(policy.faceAmount * 0.65), askPrice: Math.round(policy.faceAmount * 0.6825), impliedYield: 0.12 },
      })),
      controls: { allowExternalInvestors: true, allowMarketplaceListing: true, requireComplianceChecks: true, ledgerRail: "COMMERCE", safetyProfile: "COMMERCIAL_ACTUARIAL" },
    };
  }

  private underwrite(policy: MarketPolicy) {
    const approved = (policy.healthScore > 80 && policy.insuredAge > 75) || (policy.healthScore > 60 && policy.insuredAge > 70);
    return { policyId: policy.id, approved, riskClass: policy.healthScore > 80 ? "low" : policy.healthScore > 60 ? "medium" : "high", notes: approved ? "Meets demo underwriting thresholds" : "Requires additional review" };
  }

  riskDashboard() {
    return { overall: "moderate", score: 72, concentration: "within policy", longevity: "monitored", premiumStress: "low", tracks: [{ name: "Dynasty / Trust", score: 78, rail: "DYNASTY" }, { name: "Commerce / Market", score: 66, rail: "COMMERCE" }] };
  }

  runWealthCycle() {
    const portfolio = this.dynastyPortfolio().snapshot;
    const result = { cycleId: id("CYCLE"), status: "completed", dynastyPremiumDue: Math.round(portfolio.totalPremiumAnnual / 12), projectedFaceValue: portfolio.totalFaceAmount, timestamp: now() };
    this.record("WEALTH_CYCLE", "DynastyOS Wealth", "Dynasty wealth cycle completed", result);
    return result;
  }

  treasurySnapshot() {
    const portfolio = this.dynastyPortfolio().snapshot;
    return { dynastyFaceAmount: portfolio.totalFaceAmount, dynastyAcquisitionCost: portfolio.totalAcquisitionCost, dynastyPremiumMonthly: Math.round(portfolio.totalPremiumAnnual / 12), commercialPremiumMonthly: Math.round(this.marketPolicies.reduce((sum, policy) => sum + policy.premiumAnnual, 0) / 12), availableCredits: 27600, liquidityStatus: "balanced", timestamp: now() };
  }

  connectivity() {
    return { zones: this.zones, credits: this.creditListings, meshNodes: [{ id: "MESH-ATL-01", zoneId: "ZONE-ATL-01", status: "online", utilization: 61 }, { id: "MESH-DAL-01", zoneId: "ZONE-DAL-02", status: "online", utilization: 47 }, { id: "MESH-SAV-01", zoneId: "ZONE-SAV-03", status: "degraded", utilization: 82 }] };
  }

  issueCredit(domain: string, amount: number) {
    const credit = { id: id("CREDIT"), domain, amount: clamp(Math.round(amount || 0), 1, 100000), status: "issued", issuedAt: now() };
    this.record("CREDIT_ISSUED", "TreasuryOS", `${credit.amount} credits issued for ${domain}`, credit);
    return credit;
  }

  events(limit = 25) { return [...this.events].reverse().slice(0, clamp(limit, 1, 100)); }
}

export const omegaPlatform = new OmegaPlatform();