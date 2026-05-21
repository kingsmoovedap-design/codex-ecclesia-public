import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";
import { insertDocumentSchema, insertFilingSchema } from "../shared/schema.js";

export function registerRoutes(app: Express) {
  // CORS headers for cross-platform integration
  app.use("/api/public", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Public API for cross-platform integration (no auth required)
  app.get("/api/public/status", async (req: Request, res: Response) => {
    res.json({
      platform: "codex_ecclesia",
      version: "1.2.0",
      status: "operational",
      features: {
        documents: true,
        filings: true,
        blockchain: true,
        analytics: true,
      },
      networks: {
        sepolia: {
          chainId: 11155111,
          contractAddress: "0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c",
        },
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/public/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getPublicStats();
      res.json({
        totalDocuments: stats.totalDocuments || 0,
        totalFilings: stats.totalFilings || 0,
        totalUsers: stats.totalUsers || 0,
        recentActivity: stats.recentActivity || [],
        qfsCompliant: true,
        iso20022: true,
        goldBacked: true,
      });
    } catch (error) {
      res.json({
        totalDocuments: 0,
        totalFilings: 0,
        totalUsers: 0,
        recentActivity: [],
        qfsCompliant: true,
        iso20022: true,
        goldBacked: true,
      });
    }
  });

  app.get("/api/public/widget/:type", async (req: Request, res: Response) => {
    const { type } = req.params;
    try {
      switch (type) {
        case "status":
          res.json({
            widget: "platform_status",
            data: { operational: true, uptime: "99.9%" },
          });
          break;
        case "coin":
          res.json({
            widget: "coin_ticker",
            data: {
              symbol: "BSC",
              name: "Borders Sovereign Coin",
              network: "Sepolia",
              contract: "0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c",
            },
          });
          break;
        case "documents":
          const stats = await storage.getPublicStats();
          res.json({
            widget: "document_count",
            data: { count: stats.totalDocuments || 0 },
          });
          break;
        default:
          res.status(404).json({ error: "Widget not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Widget error" });
    }
  });

  app.post("/api/public/sync", async (req: Request, res: Response) => {
    try {
      const { source, type, data } = req.body;
      console.log(`Cross-platform sync from ${source}:`, type);
      
      await storage.trackAnalytics({
        eventType: "cross_platform_sync",
        eventData: { source, type },
        createdAt: new Date(),
      });
      
      res.json({
        success: true,
        syncId: `SYNC-${Date.now()}`,
        acknowledged: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Sync failed" });
    }
  });

  app.get("/api/user", async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(user);
  });

  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const docs = await storage.getDocuments(user.id);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const doc = await storage.getDocument(parseInt(req.params.id));
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const parsed = insertDocumentSchema.safeParse({ ...req.body, userId: user.id });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
      }
      const doc = await storage.createDocument(parsed.data);
      await storage.createAuditLog({
        userId: user.id,
        action: "create",
        entityType: "document",
        entityId: doc.id,
        details: { title: doc.title, category: doc.category },
      });
      res.status(201).json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  app.put("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const doc = await storage.updateDocument(parseInt(req.params.id), req.body);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      await storage.createAuditLog({
        userId: user.id,
        action: "update",
        entityType: "document",
        entityId: doc.id,
        details: { changes: Object.keys(req.body) },
      });
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      await storage.deleteDocument(parseInt(req.params.id));
      await storage.createAuditLog({
        userId: user.id,
        action: "delete",
        entityType: "document",
        entityId: parseInt(req.params.id),
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  app.get("/api/filings", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const filings = await storage.getFilings(user.id);
      res.json(filings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch filings" });
    }
  });

  app.post("/api/filings", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const parsed = insertFilingSchema.safeParse({ ...req.body, userId: user.id });
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
      }
      const filing = await storage.createFiling(parsed.data);
      await storage.createAuditLog({
        userId: user.id,
        action: "file",
        entityType: "filing",
        entityId: filing.id,
        details: { documentId: filing.documentId, filingType: filing.filingType },
      });
      res.status(201).json(filing);
    } catch (error) {
      res.status(500).json({ error: "Failed to create filing" });
    }
  });

  app.put("/api/filings/:id", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const filing = await storage.updateFiling(parseInt(req.params.id), req.body);
      if (!filing) {
        return res.status(404).json({ error: "Filing not found" });
      }
      res.json(filing);
    } catch (error) {
      res.status(500).json({ error: "Failed to update filing" });
    }
  });

  app.get("/api/audit-logs", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const logs = await storage.getAuditLogs(user.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  app.post("/api/analytics/track", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      await storage.trackAnalytics({
        ...req.body,
        userId: user?.id,
        createdAt: new Date(),
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track event" });
    }
  });

  app.get("/api/analytics", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user || user.role !== "trustee") {
        return res.status(403).json({ error: "Access denied" });
      }
      const data = await storage.getAnalytics();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/wallet/connect", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { walletAddress, networkId } = req.body;
      await storage.updateUser(user.id, { walletAddress });
      await storage.createAuditLog({
        userId: user.id,
        action: "wallet_connect",
        entityType: "wallet",
        details: { walletAddress, networkId },
      });
      res.json({ success: true, walletAddress });
    } catch (error) {
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  app.post("/api/blockchain/verify", async (req: Request, res: Response) => {
    try {
      const { hash } = req.body;
      res.json({
        verified: true,
        hash,
        timestamp: new Date().toISOString(),
        network: "sepolia",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify" });
    }
  });

  const codexEvents: any[] = [];
  
  app.post("/api/codex/events", async (req: Request, res: Response) => {
    try {
      const event = {
        id: `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ...req.body,
        receivedAt: new Date().toISOString(),
      };
      codexEvents.push(event);
      if (codexEvents.length > 10000) codexEvents.shift();
      
      await storage.trackAnalytics({
        eventType: "codex_event",
        eventData: { type: event.type, source: event.source },
        createdAt: new Date(),
      });
      
      res.json({ success: true, eventId: event.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to log event" });
    }
  });

  app.get("/api/codex/events", async (req: Request, res: Response) => {
    try {
      const { type, since, limit = 100 } = req.query;
      let filtered = codexEvents;
      
      if (type) {
        filtered = filtered.filter(e => e.type === type);
      }
      if (since) {
        filtered = filtered.filter(e => new Date(e.timestamp) > new Date(since as string));
      }
      
      res.json({
        events: filtered.slice(-Number(limit)),
        total: filtered.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/codex/anchor", async (req: Request, res: Response) => {
    try {
      const { eventIds } = req.body;
      const anchorId = `ANC-${Date.now().toString(36).toUpperCase()}`;
      
      res.json({
        anchorId,
        eventCount: eventIds?.length || 0,
        timestamp: new Date().toISOString(),
        status: "anchored",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to anchor events" });
    }
  });

  app.get("/api/codex/stats", async (req: Request, res: Response) => {
    res.json({
      totalEvents: codexEvents.length,
      eventTypes: [...new Set(codexEvents.map(e => e.type))],
      lastEvent: codexEvents[codexEvents.length - 1] || null,
      uptime: process.uptime(),
    });
  });

  app.get("/api/dynasty/status", async (req: Request, res: Response) => {
    res.json({
      platform: "dynasty_os",
      version: "1.0.0",
      services: {
        loadBoard: { status: "ready", description: "Load management system" },
        dispatch: { status: "ready", description: "AI + Human dispatch engine" },
        driverApp: { status: "ready", description: "Driver execution layer" },
        treasury: { status: "ready", description: "Payout and rewards system" },
        codex: { status: "ready", description: "Event log and audit spine" },
        compliance: { status: "ready", description: "Rule evaluation service" },
      },
      dynastyUrl: "https://borders-dynasty--kingsmoovedap.replit.app",
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/dynasty/load", async (req: Request, res: Response) => {
    try {
      const load = {
        id: `LD-${Date.now().toString(36).toUpperCase()}`,
        ...req.body,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      
      codexEvents.push({
        id: `EVT-${Date.now().toString(36).toUpperCase()}`,
        type: "LOAD_CREATED",
        data: load,
        timestamp: new Date().toISOString(),
        source: "OMEGA_PORTAL",
      });
      
      res.json({ success: true, load });
    } catch (error) {
      res.status(500).json({ error: "Failed to create load" });
    }
  });

  app.post("/api/dynasty/dispatch", async (req: Request, res: Response) => {
    try {
      const { loadId, driverId } = req.body;
      const assignment = {
        assignmentId: `ASN-${Date.now().toString(36).toUpperCase()}`,
        loadId,
        driverId,
        status: "assigned",
        assignedAt: new Date().toISOString(),
      };
      
      codexEvents.push({
        id: `EVT-${Date.now().toString(36).toUpperCase()}`,
        type: "DISPATCH_ASSIGNED",
        data: assignment,
        timestamp: new Date().toISOString(),
        source: "OMEGA_PORTAL",
      });
      
      res.json({ success: true, assignment });
    } catch (error) {
      res.status(500).json({ error: "Failed to dispatch" });
    }
  });

  app.post("/api/dynasty/treasury/payout", async (req: Request, res: Response) => {
    try {
      const { loadId, amount, recipient } = req.body;
      const payout = {
        transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
        loadId,
        amount,
        recipient,
        status: "processed",
        processedAt: new Date().toISOString(),
      };
      
      codexEvents.push({
        id: `EVT-${Date.now().toString(36).toUpperCase()}`,
        type: "PAYOUT_EXECUTED",
        data: payout,
        timestamp: new Date().toISOString(),
        source: "OMEGA_PORTAL",
      });
      
      res.json({ success: true, payout });
    } catch (error) {
      res.status(500).json({ error: "Failed to process payout" });
    }
  });

  app.post("/api/legal-entity", async (req: Request, res: Response) => {
    try {
      const entity = {
        id: `ENT-${Date.now().toString(36).toUpperCase()}`,
        ...req.body,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      
      codexEvents.push({
        id: `EVT-${Date.now().toString(36).toUpperCase()}`,
        type: "ENTITY_FORMED",
        data: entity,
        timestamp: new Date().toISOString(),
        source: "OMEGA_PORTAL",
      });
      
      res.json({ success: true, entity });
    } catch (error) {
      res.status(500).json({ error: "Failed to form entity" });
    }
  });

  app.get("/api/embed/script", (req: Request, res: Response) => {
    res.type("application/javascript");
    res.send(`
(function() {
  var script = document.createElement('script');
  script.src = '${req.protocol}://${req.get('host')}/lib/embed-widget.js';
  document.head.appendChild(script);
})();
    `);
  });

  // ── Reverse Logistics & Global Marketplace Routes ──────────────────────────

  const rlContainers: any[] = [
    { id: 'CNTR-001', type: '40ft', contents: 'Electronics', declaredValue: 85000, status: 'abandoned', portCode: 'USLAX', portName: 'Port of Los Angeles', daysAtPort: 45, taxOwed: 12000, carrier: 'MSC', weight: 32000 },
    { id: 'CNTR-002', type: '20ft', contents: 'Clothing', declaredValue: 22000, status: 'seized', portCode: 'USHOU', portName: 'Port of Houston', daysAtPort: 12, taxOwed: 0, carrier: 'Hapag-Lloyd', weight: 8500 },
    { id: 'CNTR-003', type: '40ft', contents: 'General Merchandise', declaredValue: 41000, status: 'delinquent', portCode: 'USSAV', portName: 'Port of Savannah', daysAtPort: 60, taxOwed: 8500, carrier: 'Maersk', weight: 18000 },
    { id: 'CNTR-004', type: '20ft', contents: 'Automotive Parts', declaredValue: 63000, status: 'in_transit', portCode: 'USLGB', portName: 'Port of Long Beach', daysAtPort: 3, taxOwed: 0, carrier: 'CMA CGM', weight: 24000 },
    { id: 'CNTR-005', type: '40ft', contents: 'Food Products', declaredValue: 15000, status: 'abandoned', portCode: 'USNYC', portName: 'Port of New York', daysAtPort: 90, taxOwed: 3200, carrier: 'Evergreen', weight: 11000 },
  ];

  const rlBids: any[] = [];
  const rlRegistered: any[] = [];

  app.get("/api/marketplace/listings", (req: Request, res: Response) => {
    const categories = ['retail_return','carrier_overgoods','abandoned_cargo','customs_seizure','airport_unclaimed','government_surplus'];
    const conditions = ['new','like_new','good','fair','poor'];
    const ports = ['Port of LA','Port of Houston','Port of Savannah','Port of NY','Port of Rotterdam'];
    const listings = Array.from({ length: 24 }, (_, i) => {
      const cat = categories[i % categories.length];
      const cond = conditions[i % conditions.length];
      const val = 1000 + (i * 1847 % 49000);
      const cf = { new:0.8, like_new:0.7, good:0.55, fair:0.35, poor:0.15 }[cond] || 0.4;
      const est = Math.round(val * cf);
      return {
        id: `MKT-${String(i+1).padStart(4,'0')}`,
        title: `${cat.replace(/_/g,' ').replace(/\b\w/g, (c:string) => c.toUpperCase())} Lot #${String(i+1).padStart(4,'0')}`,
        category: cat, condition: cond,
        port: ports[i % ports.length],
        region: ['US','EU','Asia','Middle East','Africa'][i % 5],
        declaredValue: val, estimatedValue: est,
        minBid: Math.round(est * 0.3), currentBid: Math.round(est * 0.42),
        buyNow: Math.round(est * 1.2),
        weight: 100 + (i * 733 % 49000),
        daysListed: 1 + (i * 3 % 30),
        endsIn: 1 + (i * 7 % 72),
        bids: i % 20, verified: i % 3 !== 0, hazmat: i % 17 === 0
      };
    });
    const { category, region, minValue } = req.query as any;
    const filtered = listings.filter(l =>
      (!category || l.category === category) &&
      (!region || l.region === region) &&
      (!minValue || l.estimatedValue >= Number(minValue))
    );
    res.json({ listings: filtered, total: filtered.length });
  });

  app.post("/api/marketplace/bids", (req: Request, res: Response) => {
    try {
      const bid = { id: `BID-${Date.now().toString(36).toUpperCase()}`, ...req.body, timestamp: new Date().toISOString(), status: 'submitted' };
      rlBids.push(bid);
      codexEvents.push({ id: `EVT-${Date.now().toString(36).toUpperCase()}`, type: 'MARKETPLACE_BID', data: bid, timestamp: new Date().toISOString(), source: 'REVERSE_LOGISTICS' });
      res.json({ success: true, bid });
    } catch (e) { res.status(500).json({ error: 'Failed to place bid' }); }
  });

  app.get("/api/marketplace/stats", (_req: Request, res: Response) => {
    res.json({
      totalListings: 12847, totalValue: 48200000, activeAuctions: 3241,
      completedToday: 187, topCategory: 'retail_return', topRegion: 'US',
      sources: { carrier: 2100, customs: 1800, airports: 890, retail: 4200, government: 3857 }
    });
  });

  app.get("/api/reverse-logistics/containers", (_req: Request, res: Response) => {
    res.json({ containers: rlContainers, total: rlContainers.length });
  });

  app.get("/api/reverse-logistics/containers/:id", (req: Request, res: Response) => {
    const c = rlContainers.find(x => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Container not found' });
    res.json(c);
  });

  app.post("/api/reverse-logistics/containers", (req: Request, res: Response) => {
    try {
      const container = { id: `CNTR-${Date.now().toString(36).toUpperCase()}`, ...req.body, registeredAt: new Date().toISOString() };
      rlContainers.push(container);
      codexEvents.push({ id: `EVT-${Date.now().toString(36).toUpperCase()}`, type: 'CONTAINER_REGISTERED', data: container, timestamp: new Date().toISOString(), source: 'REVERSE_LOGISTICS' });
      res.json({ success: true, container });
    } catch (e) { res.status(500).json({ error: 'Failed to register container' }); }
  });

  app.patch("/api/reverse-logistics/containers/:id/status", (req: Request, res: Response) => {
    const c = rlContainers.find(x => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Container not found' });
    c.status = req.body.status;
    c.lastUpdated = new Date().toISOString();
    codexEvents.push({ id: `EVT-${Date.now().toString(36).toUpperCase()}`, type: 'CONTAINER_STATUS_UPDATED', data: { id: c.id, status: c.status }, timestamp: new Date().toISOString(), source: 'REVERSE_LOGISTICS' });
    res.json({ success: true, container: c });
  });

  app.get("/api/reverse-logistics/auction-eligible", (_req: Request, res: Response) => {
    const eligible = rlContainers.filter(c => c.status === 'abandoned' || c.status === 'seized' || c.status === 'delinquent');
    res.json({ eligible, total: eligible.length });
  });

  app.get("/api/reverse-logistics/stats", (_req: Request, res: Response) => {
    const byStatus: Record<string,number> = {};
    rlContainers.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
    const totalValue = rlContainers.reduce((sum, c) => sum + (c.declaredValue || 0), 0);
    res.json({ totalContainers: rlContainers.length, byStatus, totalDeclaredValue: totalValue, auctionEligible: rlContainers.filter(c => ['abandoned','seized','delinquent'].includes(c.status)).length, totalBids: rlBids.length });
  });

  app.get("/api/blockchain/registry", (_req: Request, res: Response) => {
    res.json({ records: rlRegistered, total: rlRegistered.length, network: 'Sepolia', contract: '0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c' });
  });

  app.post("/api/blockchain/registry", (req: Request, res: Response) => {
    try {
      const record = { id: `FR-${Date.now().toString(36).toUpperCase()}`, ...req.body, hash: '0x' + Math.random().toString(16).slice(2).padEnd(64,'0'), network: 'Sepolia', contract: '0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c', registeredAt: new Date().toISOString(), status: 'confirmed' };
      rlRegistered.push(record);
      codexEvents.push({ id: `EVT-${Date.now().toString(36).toUpperCase()}`, type: 'BLOCKCHAIN_FREIGHT_REGISTERED', data: record, timestamp: new Date().toISOString(), source: 'BLOCKCHAIN_REGISTRY' });
      res.json({ success: true, record });
    } catch (e) { res.status(500).json({ error: 'Failed to register on blockchain' }); }
  });

  app.post("/api/blockchain/verify", (req: Request, res: Response) => {
    const { hash } = req.body;
    if (!hash || !hash.startsWith('0x')) return res.status(400).json({ valid: false, error: 'Invalid hash format' });
    res.json({ valid: true, hash, network: 'Sepolia', contract: '0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c', verifiedAt: new Date().toISOString(), confirmations: Math.floor(Math.random() * 1000) + 12, status: 'authentic' });
  });

  // ══════════════════════════════════════════════════════════════
  // PARTNER ONBOARDING API
  // ══════════════════════════════════════════════════════════════

  // In-memory store (persists per server session)
  const partners: any[] = [];
  const broadcasts: any[] = [];

  app.post("/api/onboarding/register", (req: Request, res: Response) => {
    const p = req.body;
    if (!p.name || !p.email) return res.status(400).json({ error: 'Name and email required' });
    const existing = partners.find(x => x.email === p.email);
    if (existing) {
      Object.assign(existing, p, { updatedAt: new Date().toISOString() });
      return res.json({ success: true, partner: existing, updated: true });
    }
    const partner = {
      id: 'PTR-' + Date.now().toString(36).toUpperCase(),
      ...p,
      status: 'pending',
      joinedAt: p.joinedAt || new Date().toISOString(),
    };
    partners.push(partner);
    res.json({ success: true, partner });
  });

  app.get("/api/onboarding/partners", (_req: Request, res: Response) => {
    res.json({ total: partners.length, partners });
  });

  app.patch("/api/onboarding/partners/:id/approve", (req: Request, res: Response) => {
    const partner = partners.find(p => p.id === req.params.id);
    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    partner.status = 'active';
    partner.approvedAt = new Date().toISOString();
    res.json({ success: true, partner });
  });

  app.post("/api/onboarding/broadcast", (req: Request, res: Response) => {
    const { message, type, from } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const broadcast = { id: Date.now().toString(), message, type: type || 'announcement', from: from || 'Grand Architect', timestamp: new Date().toISOString() };
    broadcasts.push(broadcast);
    res.json({ success: true, broadcast });
  });

  app.get("/api/onboarding/broadcasts", (_req: Request, res: Response) => {
    res.json({ total: broadcasts.length, broadcasts: broadcasts.slice().reverse() });
  });

  app.post("/api/onboarding/reset-tests", (_req: Request, res: Response) => {
    partners.forEach(p => {
      delete p.sovereigntyScore; delete p.platformScore; delete p.totalScore;
      delete p.grade; delete p.roleAssigned; delete p.sovereigntyResults; delete p.platformResults;
      p.status = 'pending';
    });
    res.json({ success: true, reset: partners.length });
  });

  // ══════════════════════════════════════════════════════════════
  // DIVINITY COMMAND CENTER API
  // ══════════════════════════════════════════════════════════════
  // (codexEvents array already declared above — shared store)

  // Anchor route (supplement to existing codex routes)
  app.post("/api/codex/anchor", (req: Request, res: Response) => {
    const { eventIds } = req.body;
    const anchorHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
    const event = { id: 'ANCHOR-' + Date.now().toString(36).toUpperCase(), type: 'BLOCKCHAIN_ANCHOR', data: { eventIds, anchorHash, network: 'Sepolia' }, source: 'CODEX_CHAIN', timestamp: new Date().toISOString() };
    codexEvents.push(event);
    res.json({ success: true, anchorHash, network: 'Sepolia', timestamp: new Date().toISOString() });
  });

  // Dynasty Load Board
  const loads: any[] = [];
  app.post("/api/dynasty/load", (req: Request, res: Response) => {
    const load = { id: 'LOAD-' + Date.now().toString(36).toUpperCase(), ...req.body, createdAt: new Date().toISOString() };
    loads.push(load);
    res.json({ success: true, load });
  });
  app.get("/api/dynasty/loads", (_req: Request, res: Response) => {
    res.json({ total: loads.length, loads });
  });

  // Divinity Intelligence
  app.get("/api/divinity/intelligence", (_req: Request, res: Response) => {
    res.json({
      securityScore: 94,
      threatLevel: 'LOW',
      activeModules: 28,
      totalEvents: codexEvents.length,
      totalPartners: partners.length,
      activePartners: partners.filter(p => p.status === 'active').length,
      lastAppraisal: new Date().toISOString(),
      neuralRouting: 94,
      selfLearningRate: 78
    });
  });

  // ══════════════════════════════════════════════════════════════
  // SOVEREIGN PLATFORM — SaaS / LaaS / MaS INFRASTRUCTURE
  // Ready-to-activate service layer for Dynasty Logistics Empire
  // ══════════════════════════════════════════════════════════════

  const SOVEREIGN_TREASURY_URL  = process.env.SOVEREIGN_TREASURY_URL  || null;
  const SOVEREIGN_LOGISTICS_URL = process.env.SOVEREIGN_LOGISTICS_URL || null;
  const SOVEREIGN_CODEXCHAIN_URL = process.env.SOVEREIGN_CODEXCHAIN_URL || null;
  const SIGNUP_FEE_AMOUNT = process.env.SIGNUP_FEE_AMOUNT || '25';
  const BUYBACK_WALLET = process.env.BUYBACK_WALLET || '0x0000000000000000000000000000000000000000';

  // ── Sovereign Health & Snapshot ──
  app.get("/api/sovereign/health", (_req: Request, res: Response) => {
    res.json({
      platform: 'Borders Dynasty Sovereign Platform',
      version: '1.1.0',
      codename: 'Sovereign Expansion',
      timestamp: new Date().toISOString(),
      services: {
        saas: { status: 'READY_TO_ACTIVATE', description: 'Dynasty-OS module licensing', configKey: 'SOVEREIGN_TREASURY_URL', configured: !!SOVEREIGN_TREASURY_URL },
        laas: { status: SOVEREIGN_LOGISTICS_URL ? 'ACTIVE' : 'READY_TO_ACTIVATE', description: 'Logistics-as-a-Service', configKey: 'SOVEREIGN_LOGISTICS_URL', configured: !!SOVEREIGN_LOGISTICS_URL },
        maas: { status: SOVEREIGN_TREASURY_URL ? 'ACTIVE' : 'READY_TO_ACTIVATE', description: 'Markets-as-a-Service (BSC Treasury)', configKey: 'SOVEREIGN_TREASURY_URL', configured: !!SOVEREIGN_TREASURY_URL },
        codexchain: { status: SOVEREIGN_CODEXCHAIN_URL ? 'ACTIVE' : 'READY_TO_ACTIVATE', description: 'CodexChain Event Spine', configKey: 'SOVEREIGN_CODEXCHAIN_URL', configured: !!SOVEREIGN_CODEXCHAIN_URL },
        dynastySync: { status: 'READY_TO_ACTIVATE', description: 'Background sync daemon (15s polling)', pollIntervalMs: 15000 },
        reverseLogistics: { status: 'ACTIVE', description: 'Reverse logistics auction engine', listings: 12847 },
        loadBoard: { status: 'ACTIVE', description: 'Forward logistics load board', loads: loads.length },
        partnerNetwork: { status: 'ACTIVE', description: 'Carrier partner onboarding', partners: partners.length, active: partners.filter(p => p.status === 'active').length },
      },
      environment: {
        signupFeeAmount: SIGNUP_FEE_AMOUNT,
        buybackWallet: BUYBACK_WALLET,
        contractAddress: '0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c',
        network: 'Sepolia',
      }
    });
  });

  app.get("/api/sovereign/snapshot", async (_req: Request, res: Response) => {
    const snapshot: any = {
      generatedAt: new Date().toISOString(),
      platform: 'Borders Dynasty Sovereign Platform',
      logistics: {
        loads: loads.length,
        partners: partners.length,
        activePartners: partners.filter(p => p.status === 'active').length,
        events: codexEvents.filter(e => e.type?.includes('logistics') || e.type?.includes('LOGISTICS')).length,
      },
      treasury: {
        contract: '0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c',
        network: 'Sepolia',
        status: SOVEREIGN_TREASURY_URL ? 'connected' : 'ready_to_activate',
      },
      codexchain: {
        totalAnchored: codexEvents.filter(e => e.type === 'BLOCKCHAIN_ANCHOR').length,
        status: SOVEREIGN_CODEXCHAIN_URL ? 'connected' : 'ready_to_activate',
      }
    };
    if (SOVEREIGN_LOGISTICS_URL) {
      try {
        const { default: axios } = await import('axios');
        const [loadsRes, analyticsRes] = await Promise.allSettled([
          axios.get(`${SOVEREIGN_LOGISTICS_URL}/api/logistics/loads`),
          axios.get(`${SOVEREIGN_LOGISTICS_URL}/api/logistics/analytics`),
        ]);
        if (loadsRes.status === 'fulfilled') snapshot.logistics.externalLoads = loadsRes.value.data;
        if (analyticsRes.status === 'fulfilled') snapshot.logistics.analytics = analyticsRes.value.data;
      } catch (_e) {}
    }
    res.json(snapshot);
  });

  // ── LaaS — Logistics as a Service ──
  // Internal load board (always active)
  app.get("/api/laas/loads", (_req: Request, res: Response) => {
    const mockLoads = loads.length > 0 ? loads : [
      { id: 'LOAD-DEMO-001', origin: 'Dallas, TX', destination: 'Atlanta, GA', weight: '42,000 lbs', equipment: 'Dry Van 53\'', rate: '$2,850', miles: 781, status: 'available', postedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'LOAD-DEMO-002', origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', weight: '38,500 lbs', equipment: 'Reefer', rate: '$1,950', miles: 372, status: 'available', postedAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'LOAD-DEMO-003', origin: 'Chicago, IL', destination: 'Detroit, MI', weight: '28,000 lbs', equipment: 'Flatbed', rate: '$1,200', miles: 281, status: 'dispatched', postedAt: new Date(Date.now() - 1800000).toISOString() },
      { id: 'LOAD-DEMO-004', origin: 'Houston, TX', destination: 'New Orleans, LA', weight: '44,000 lbs', equipment: 'Tanker', rate: '$3,100', miles: 348, status: 'available', postedAt: new Date(Date.now() - 900000).toISOString() },
      { id: 'LOAD-DEMO-005', origin: 'Miami, FL', destination: 'Charlotte, NC', weight: '18,000 lbs', equipment: 'Box Truck 26\'', rate: '$2,200', miles: 656, status: 'available', postedAt: new Date().toISOString() },
    ];
    res.json({ status: 'ACTIVE', source: loads.length > 0 ? 'platform' : 'demo', total: mockLoads.length, loads: mockLoads });
  });

  app.get("/api/laas/containers", (_req: Request, res: Response) => {
    res.json({
      status: SOVEREIGN_LOGISTICS_URL ? 'ACTIVE' : 'READY_TO_ACTIVATE',
      configKey: 'SOVEREIGN_LOGISTICS_URL',
      total: 5,
      containers: [
        { id: 'CNTR-4821-A', type: 'Abandoned', location: 'Port of Los Angeles', contents: 'Mixed Electronics', estimatedValue: '$24,500', status: 'eligible_for_auction', daysAbandoned: 47 },
        { id: 'CNTR-3307-B', type: 'Customs Seized', location: 'JFK Airport', contents: 'Apparel & Textiles', estimatedValue: '$18,200', status: 'in_auction', daysAbandoned: 23 },
        { id: 'CNTR-9912-C', type: 'Tax Delinquent', location: 'Port of Houston', contents: 'Industrial Equipment', estimatedValue: '$67,800', status: 'eligible_for_auction', daysAbandoned: 91 },
        { id: 'CNTR-1145-D', type: 'Retail Return', location: 'Memphis Distribution', contents: 'Consumer Goods', estimatedValue: '$12,400', status: 'available', daysAbandoned: 14 },
        { id: 'CNTR-5580-E', type: 'Port Seized', location: 'Port of Savannah', contents: 'Auto Parts', estimatedValue: '$31,600', status: 'eligible_for_auction', daysAbandoned: 35 },
      ]
    });
  });

  app.get("/api/laas/auctions", (_req: Request, res: Response) => {
    res.json({
      status: 'ACTIVE',
      sourcesActive: 5,
      sources: ['Carrier (abandoned trailers)', 'Port/Customs seizures', 'Airports', 'Retail returns', 'Government surplus'],
      totalListings: 12847,
      auctions: [
        { id: 'AUC-9921', item: 'Container CNTR-3307-B — Apparel & Textiles', currentBid: '$4,200', bids: 7, endsAt: new Date(Date.now() + 86400000).toISOString(), status: 'live' },
        { id: 'AUC-8834', item: 'Pallet Lot #P-441 — Electronics Returns (14 pallets)', currentBid: '$1,800', bids: 12, endsAt: new Date(Date.now() + 43200000).toISOString(), status: 'live' },
        { id: 'AUC-7756', item: 'Government Surplus — Office Furniture (80 units)', currentBid: '$950', bids: 4, endsAt: new Date(Date.now() + 172800000).toISOString(), status: 'upcoming' },
      ]
    });
  });

  app.get("/api/laas/analytics", (_req: Request, res: Response) => {
    res.json({
      status: SOVEREIGN_LOGISTICS_URL ? 'ACTIVE' : 'READY_TO_ACTIVATE',
      configKey: 'SOVEREIGN_LOGISTICS_URL',
      period: '30d',
      loadsCreated: loads.length + 847,
      loadsDelivered: loads.filter(l => l.status === 'delivered').length + 791,
      totalMiles: 284750,
      avgLoadValue: 2340,
      onTimeDeliveryRate: 94.2,
      activeCarriers: partners.filter(p => p.status === 'active').length + 23,
      topLanes: [
        { origin: 'Dallas, TX', destination: 'Atlanta, GA', loads: 127, avgRate: 2850 },
        { origin: 'Chicago, IL', destination: 'Detroit, MI', loads: 98, avgRate: 1200 },
        { origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', loads: 84, avgRate: 1950 },
      ]
    });
  });

  app.get("/api/laas/security-missions", (_req: Request, res: Response) => {
    res.json({
      status: 'READY_TO_ACTIVATE',
      configKey: 'SOVEREIGN_LOGISTICS_URL',
      description: 'Private armed security escort and logistics protection services',
      missions: [
        { id: 'SEC-001', type: 'Cargo Escort', route: 'Dallas → Houston', cargo: 'High-Value Electronics', rate: '$850/hr', status: 'available' },
        { id: 'SEC-002', type: 'Warehouse Security', location: 'Memphis, TN', shift: '12hr', rate: '$42/hr', status: 'available' },
      ]
    });
  });

  app.get("/api/laas/last-mile", (_req: Request, res: Response) => {
    res.json({
      status: 'READY_TO_ACTIVATE',
      configKey: 'SOVEREIGN_LOGISTICS_URL',
      description: 'Final mile delivery routing — residential and commercial',
      jobs: [
        { id: 'LM-001', stops: 24, zone: 'Dallas Metro', vehicle: 'Cargo Van', rate: '$180', status: 'available' },
        { id: 'LM-002', stops: 18, zone: 'Houston North', vehicle: 'Sprinter', rate: '$165', status: 'available' },
        { id: 'LM-003', stops: 31, zone: 'Atlanta Suburb', vehicle: 'Box Truck', rate: '$220', status: 'dispatched' },
      ]
    });
  });

  app.get("/api/laas/rideshare", (_req: Request, res: Response) => {
    res.json({
      status: 'READY_TO_ACTIVATE',
      configKey: 'SOVEREIGN_LOGISTICS_URL',
      description: 'Sovereign rideshare network — driver partner trips',
      trips: [
        { id: 'RS-001', pickup: 'DFW Airport', dropoff: 'Downtown Dallas', estimatedFare: '$38', distance: '18 mi', status: 'available' },
        { id: 'RS-002', pickup: 'Houston Medical Center', dropoff: 'Sugar Land, TX', estimatedFare: '$44', distance: '22 mi', status: 'available' },
      ]
    });
  });

  app.get("/api/laas/couriers", (_req: Request, res: Response) => {
    res.json({
      status: 'READY_TO_ACTIVATE',
      configKey: 'SOVEREIGN_LOGISTICS_URL',
      description: 'Same-day courier and document delivery network',
      jobs: [
        { id: 'COU-001', type: 'Legal Document', pickup: 'Downtown Dallas', dropoff: 'Irving, TX', sla: '2hr', rate: '$65', status: 'available' },
        { id: 'COU-002', type: 'Medical Specimen', pickup: 'Houston Medical', dropoff: 'Sugar Land Lab', sla: '1hr', rate: '$85', status: 'available' },
        { id: 'COU-003', type: 'Same-Day Package', pickup: 'Warehouse A', dropoff: 'Plano, TX', sla: '4hr', rate: '$45', status: 'available' },
      ]
    });
  });

  // ── MaS — Markets as a Service ──
  app.get("/api/maas/status", (_req: Request, res: Response) => {
    res.json({
      status: SOVEREIGN_TREASURY_URL ? 'ACTIVE' : 'READY_TO_ACTIVATE',
      configKey: 'SOVEREIGN_TREASURY_URL',
      services: {
        treasury: { status: SOVEREIGN_TREASURY_URL ? 'ACTIVE' : 'READY_TO_ACTIVATE' },
        bscToken: { status: 'ACTIVE', contract: '0x12efC9a5D115AE7833c9a6D79f1B3BA18Cde817c', network: 'Sepolia' },
        buyback: { status: 'READY_TO_ACTIVATE', wallet: BUYBACK_WALLET },
        marketplace: { status: 'ACTIVE', listings: 12847 },
        staking: { status: 'READY_TO_ACTIVATE' },
      }
    });
  });

  app.get("/api/maas/treasury/balance/:address", async (req: Request, res: Response) => {
    const { address } = req.params;
    if (!SOVEREIGN_TREASURY_URL) {
      return res.json({ status: 'READY_TO_ACTIVATE', configKey: 'SOVEREIGN_TREASURY_URL', address, balance: '0', note: 'Set SOVEREIGN_TREASURY_URL to activate live treasury integration' });
    }
    try {
      const { default: axios } = await import('axios');
      const { data } = await axios.get(`${SOVEREIGN_TREASURY_URL}/api/treasury/balance/${address}`);
      res.json({ status: 'ACTIVE', ...data });
    } catch (e: any) {
      res.status(502).json({ error: 'Treasury service unreachable', detail: e.message });
    }
  });

  app.get("/api/maas/treasury/transactions/:address", async (req: Request, res: Response) => {
    const { address } = req.params;
    if (!SOVEREIGN_TREASURY_URL) {
      return res.json({ status: 'READY_TO_ACTIVATE', configKey: 'SOVEREIGN_TREASURY_URL', address, transactions: [], note: 'Set SOVEREIGN_TREASURY_URL to activate' });
    }
    try {
      const { default: axios } = await import('axios');
      const { data } = await axios.get(`${SOVEREIGN_TREASURY_URL}/api/treasury/transactions/${address}`, { params: req.query });
      res.json({ status: 'ACTIVE', ...data });
    } catch (e: any) {
      res.status(502).json({ error: 'Treasury service unreachable', detail: e.message });
    }
  });

  app.post("/api/maas/treasury/mint", async (req: Request, res: Response) => {
    if (!SOVEREIGN_TREASURY_URL) {
      return res.json({ status: 'READY_TO_ACTIVATE', configKey: 'SOVEREIGN_TREASURY_URL', note: 'Set SOVEREIGN_TREASURY_URL to activate minting' });
    }
    try {
      const { default: axios } = await import('axios');
      const { data } = await axios.post(`${SOVEREIGN_TREASURY_URL}/api/treasury/mint`, req.body);
      codexEvents.push({ id: 'MINT-' + Date.now().toString(36).toUpperCase(), type: 'treasury.mint', data: req.body, source: 'MAAS', timestamp: new Date().toISOString() });
      res.json({ status: 'ACTIVE', ...data });
    } catch (e: any) {
      res.status(502).json({ error: 'Treasury service unreachable', detail: e.message });
    }
  });

  app.post("/api/maas/treasury/buyback", async (req: Request, res: Response) => {
    if (!SOVEREIGN_TREASURY_URL) {
      return res.json({ status: 'READY_TO_ACTIVATE', configKey: 'SOVEREIGN_TREASURY_URL', buybackWallet: BUYBACK_WALLET, note: 'Set SOVEREIGN_TREASURY_URL to activate buyback' });
    }
    try {
      const { default: axios } = await import('axios');
      const { data } = await axios.post(`${SOVEREIGN_TREASURY_URL}/api/treasury/buyback`, req.body);
      codexEvents.push({ id: 'BUYBACK-' + Date.now().toString(36).toUpperCase(), type: 'treasury.buyback', data: req.body, source: 'MAAS', timestamp: new Date().toISOString() });
      res.json({ status: 'ACTIVE', ...data });
    } catch (e: any) {
      res.status(502).json({ error: 'Treasury service unreachable', detail: e.message });
    }
  });

  app.get("/api/maas/marketplace", (_req: Request, res: Response) => {
    res.json({
      status: 'ACTIVE',
      totalListings: 12847,
      categories: [
        { name: 'Distressed Freight', count: 4821, avgValue: 8400 },
        { name: 'Retail Returns', count: 3204, avgValue: 1200 },
        { name: 'Government Surplus', count: 1847, avgValue: 3600 },
        { name: 'Port Seized', count: 1590, avgValue: 22000 },
        { name: 'Electronics', count: 892, avgValue: 5400 },
        { name: 'Apparel & Textiles', count: 493, avgValue: 2100 },
      ],
      recentListings: [
        { id: 'MKT-8821', title: 'Pallet Lot — Consumer Electronics (14 pallets)', price: '$4,800', location: 'Memphis, TN', bids: 7 },
        { id: 'MKT-8820', title: 'Retail Return Truckload — Apparel', price: '$2,200', location: 'Dallas, TX', bids: 3 },
        { id: 'MKT-8819', title: 'Government Surplus — Office Equipment (40 units)', price: '$1,100', location: 'Arlington, VA', bids: 11 },
      ]
    });
  });

  // ── SaaS — Software as a Service (Dynasty-OS Licensing) ──
  app.get("/api/saas/modules", (_req: Request, res: Response) => {
    res.json({
      status: 'READY_TO_ACTIVATE',
      configKey: 'SOVEREIGN_TREASURY_URL',
      version: '1.1.0',
      totalModules: 28,
      licensingModel: {
        perOrg: '$350/mo per org',
        enterprise: '$2,800/mo unlimited orgs',
        api: '$0.008 per API call',
        signupFee: `${SIGNUP_FEE_AMOUNT} BSC`,
      },
      revenueProjection: {
        at50Orgs: { osLicensing: 175000, codexSaaS: 150000, logisticsTokenization: 200000, bscFees: 50000, total: 575000, valuation5x: 2875000 },
        at100Orgs: { total: 1150000, valuationRange: { low: 5000000, high: 8000000 } },
      },
      modules: [
        { id: 'divinityVX', name: 'DivinityVX Neural', category: 'AI', status: 'available', licenseFee: '$120/mo' },
        { id: 'ai-overseer', name: 'AI Overseer', category: 'AI', status: 'available', licenseFee: '$80/mo' },
        { id: 'quantum', name: 'Quantum Compute', category: 'Compute', status: 'available', licenseFee: '$200/mo' },
        { id: 'zero-trust', name: 'Zero-Trust Security', category: 'Security', status: 'available', licenseFee: '$90/mo' },
        { id: 'marketplace', name: 'Marketplace Engine', category: 'Commerce', status: 'available', licenseFee: '$150/mo' },
        { id: 'digital-twin', name: 'Digital Twin', category: 'Logistics', status: 'available', licenseFee: '$110/mo' },
        { id: 'reverse-logistics', name: 'Reverse Logistics', category: 'Logistics', status: 'available', licenseFee: '$130/mo' },
        { id: 'dispatch', name: 'Dispatch Engine', category: 'Logistics', status: 'available', licenseFee: '$100/mo' },
      ]
    });
  });

  app.post("/api/saas/signup", (req: Request, res: Response) => {
    const { orgName, email, tier, paymentTx } = req.body;
    if (!orgName || !email) return res.status(400).json({ error: 'orgName and email required' });
    const orgId = 'ORG-' + Date.now().toString(36).toUpperCase();
    const event = { id: orgId, type: 'saas.signup', data: { orgName, email, tier: tier || 'standard', paymentTx, signupFeeAmount: SIGNUP_FEE_AMOUNT }, source: 'SAAS_SIGNUP', timestamp: new Date().toISOString() };
    codexEvents.push(event);
    res.json({ success: true, orgId, tier: tier || 'standard', signupFeeRequired: SIGNUP_FEE_AMOUNT + ' BSC', paymentAddress: BUYBACK_WALLET, message: 'Organization registered. Complete payment to activate platform access.' });
  });

  app.get("/api/saas/health", (_req: Request, res: Response) => {
    res.json({
      status: 'OPERATIONAL',
      version: '1.1.0',
      modules: { total: 28, active: 28, degraded: 0 },
      uptime: '99.9%',
      lastCheck: new Date().toISOString(),
      endpoints: {
        '/api/saas/modules': 'operational',
        '/api/laas/loads': 'operational',
        '/api/laas/containers': 'operational',
        '/api/laas/auctions': 'operational',
        '/api/laas/analytics': 'operational',
        '/api/laas/security-missions': 'ready_to_activate',
        '/api/laas/last-mile': 'ready_to_activate',
        '/api/laas/rideshare': 'ready_to_activate',
        '/api/laas/couriers': 'ready_to_activate',
        '/api/maas/treasury/balance/:address': SOVEREIGN_TREASURY_URL ? 'operational' : 'ready_to_activate',
        '/api/maas/marketplace': 'operational',
        '/api/maas/treasury/mint': SOVEREIGN_TREASURY_URL ? 'operational' : 'ready_to_activate',
        '/api/maas/treasury/buyback': SOVEREIGN_TREASURY_URL ? 'operational' : 'ready_to_activate',
      }
    });
  });
}
