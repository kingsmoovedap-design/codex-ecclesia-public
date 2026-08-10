import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";
import { insertDocumentSchema, insertFilingSchema } from "../shared/schema.js";
import { omegaPlatform } from "./omega-platform.js";

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

  // Unified Omega command plane routes.
  app.get("/api/omega/status", (_req, res) => res.json(omegaPlatform.status()));
  app.get("/api/omega/overview", (_req, res) => res.json(omegaPlatform.overview()));
  app.get("/api/omega/events", (req, res) => res.json({ events: omegaPlatform.events(Number(req.query.limit) || 25) }));
  app.post("/api/omega/operation", (req, res) => res.json(omegaPlatform.orchestrate(req.body || {})));
  app.post("/api/sovereign/orchestrate", (req, res) => res.json(omegaPlatform.orchestrate(req.body || {})));

  app.get("/api/loads", (_req, res) => res.json(omegaPlatform.overview().loads));
  app.post("/api/loads", (req, res) => res.status(201).json(omegaPlatform.createLoad(req.body || {})));
  app.post("/api/loads/:id/assign", (req, res) => {
    const load = omegaPlatform.assignLoad(req.params.id, String(req.body?.carrier || "Unassigned carrier"));
    return load ? res.json(load) : res.status(404).json({ error: "Load not found" });
  });

  app.get("/api/digital-twin/snapshot", (_req, res) => res.json(omegaPlatform.twinSnapshot()));
  app.post("/api/digital-twin/simulate", (req, res) => {
    const type = ["REROUTE", "REPRICE", "INCENTIVES"].includes(req.body?.type) ? req.body.type : "REROUTE";
    res.json(omegaPlatform.simulateTwin(type));
  });

  app.get("/api/nonprofit/projects", (_req, res) => res.json(omegaPlatform.getProjects()));
  app.get("/api/nonprofit/projects/:projectId/eligibility", (req, res) => res.json(omegaPlatform.eligibility(req.params.projectId)));
  app.get("/api/nonprofit/projects/:projectId/priorities", (req, res) => res.json(omegaPlatform.priorities(req.params.projectId)));
  app.post("/api/nonprofit/projects/:projectId/partnerships", (req, res) => res.status(201).json(omegaPlatform.addPartner(req.params.projectId, String(req.body?.organization || "New partner"), String(req.body?.role || "Community partner"))));
  app.get("/api/nonprofit/projects/:projectId/grant-package", (req, res) => res.json(omegaPlatform.grantPackage(req.params.projectId)));
  app.get("/api/nonprofit/projects/:projectId/compliance", (req, res) => res.json(omegaPlatform.compliance(req.params.projectId)));

  app.get("/api/life/dynasty/portfolio", (_req, res) => res.json(omegaPlatform.dynastyPortfolio()));
  app.get("/api/life/market/listings", (_req, res) => res.json(omegaPlatform.marketListings()));
  app.get("/api/life/risk/dashboard", (_req, res) => res.json(omegaPlatform.riskDashboard()));
  app.post("/api/life/wealth/run", (_req, res) => res.json(omegaPlatform.runWealthCycle()));
  app.get("/api/life/premium/cycle", (_req, res) => res.json(omegaPlatform.treasurySnapshot()));
  app.get("/api/ecclesia/wealth", (_req, res) => res.json({
    rail: "ECCLESIA",
    reportingPeriod: new Date().toISOString().slice(0, 10),
    dynasty: omegaPlatform.dynastyPortfolio().snapshot,
    risk: omegaPlatform.riskDashboard(),
    status: "internal reporting view",
  }));
  app.get("/api/treasury/life/snapshot", (_req, res) => res.json(omegaPlatform.treasurySnapshot()));

  app.get("/api/connectivity/snapshot", (_req, res) => res.json(omegaPlatform.connectivity()));
  app.get("/api/connectivity/zones", (_req, res) => res.json(omegaPlatform.connectivity().zones));
  app.get("/api/connectivity/credits", (_req, res) => res.json(omegaPlatform.connectivity().credits));
  app.get("/api/connectivity/mesh-nodes", (_req, res) => res.json(omegaPlatform.connectivity().meshNodes));
  app.post("/api/treasury/credits/issue", (req, res) => res.status(201).json(omegaPlatform.issueCredit(String(req.body?.domain || "GENERAL"), Number(req.body?.amount || 1000))));
  app.get("/api/treasury/credits", (_req, res) => res.json({ balance: 27600, listings: omegaPlatform.connectivity().credits, rail: "TREASURYOS" }));

  // Administrative Fabric and Divinity operator routes.
  app.get("/api/fabric/overview", (_req, res) => res.json(omegaPlatform.fabricOverview()));
  app.get("/api/infrastructure/domains", (_req, res) => res.json(omegaPlatform.infrastructureDomains()));
  app.get("/api/emergency/snapshot", (_req, res) => res.json(omegaPlatform.incidentSnapshot()));
  app.post("/api/emergency/incidents", (req, res) => res.status(201).json(omegaPlatform.createIncident(req.body || {})));
  app.get("/api/missions", (_req, res) => res.json(omegaPlatform.listMissions()));
  app.get("/api/fleet/snapshot", (_req, res) => res.json(omegaPlatform.fleetSnapshot()));
  app.post("/api/fleet/vehicles/:id/dispatch", (req, res) => {
    const result = omegaPlatform.dispatchVehicle(req.params.id, req.body?.loadId);
    return result ? res.json(result) : res.status(404).json({ error: "Vehicle not found" });
  });
  app.get("/api/continuity/snapshot", (_req, res) => res.json(omegaPlatform.continuitySnapshot()));
  app.get("/api/modernization/overview", (_req, res) => res.json(omegaPlatform.modernizationOverview()));
  app.post("/api/fabric/telemetry", (req, res) => res.json(omegaPlatform.processTelemetry(req.body || {})));

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
}
