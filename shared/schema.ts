import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default("member").notNull(),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  documentNumber: text("document_number").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  templateId: text("template_id"),
  content: text("content"),
  metadata: jsonb("metadata"),
  status: text("status").default("draft").notNull(),
  version: integer("version").default(1).notNull(),
  blockchainHash: text("blockchain_hash"),
  filedAt: timestamp("filed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const filings = pgTable("filings", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  filingType: text("filing_type").notNull(),
  status: text("status").default("pending").notNull(),
  transactionHash: text("transaction_hash"),
  blockNumber: integer("block_number"),
  networkId: text("network_id"),
  certifiedCopy: boolean("certified_copy").default(false),
  publicRecord: boolean("public_record").default(false),
  dynastySync: boolean("dynasty_sync").default(true),
  filedAt: timestamp("filed_at"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  eventName: text("event_name").notNull(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  pageUrl: text("page_url"),
  referrer: text("referrer"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walletConnections = pgTable("wallet_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletAddress: text("wallet_address").notNull(),
  networkId: text("network_id").notNull(),
  isActive: boolean("is_active").default(true),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
});

export const documentVersions = pgTable("document_versions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  version: integer("version").notNull(),
  content: text("content"),
  metadata: jsonb("metadata"),
  changedBy: integer("changed_by").references(() => users.id),
  changeNote: text("change_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const legalEntities = pgTable("legal_entities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  entityType: text("entity_type").notNull(),
  entityName: text("entity_name").notNull(),
  ein: text("ein"),
  stateOfFormation: text("state_of_formation"),
  formationDate: timestamp("formation_date"),
  status: text("status").default("pending").notNull(),
  documents: jsonb("documents"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const logisticsOrders = pgTable("logistics_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  orderNumber: text("order_number").notNull().unique(),
  orderType: text("order_type").notNull(),
  origin: text("origin"),
  destination: text("destination"),
  status: text("status").default("pending").notNull(),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  metadata: jsonb("metadata"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningProgress = pgTable("learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  moduleId: text("module_id").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  filings: many(filings),
  auditLogs: many(auditLogs),
  walletConnections: many(walletConnections),
  sessions: many(sessions),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, { fields: [documents.userId], references: [users.id] }),
  filings: many(filings),
  versions: many(documentVersions),
}));

export const filingsRelations = relations(filings, ({ one }) => ({
  document: one(documents, { fields: [filings.documentId], references: [documents.id] }),
  user: one(users, { fields: [filings.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, { fields: [documentVersions.documentId], references: [documents.id] }),
  changedByUser: one(users, { fields: [documentVersions.changedBy], references: [users.id] }),
}));

// ── Registrations — public-facing signup for drivers, partners, members, heirs
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),                         // driver | partner | member | heir
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  businessName: text("business_name"),
  licenseNumber: text("license_number"),                // CDL# for drivers
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  equipmentType: text("equipment_type"),
  yearsExperience: text("years_experience"),
  walletAddress: text("wallet_address"),
  referralCode: text("referral_code"),
  agreeToTerms: boolean("agree_to_terms").default(false),
  status: text("status").default("pending").notNull(),  // pending | approved | rejected | suspended
  accessCode: text("access_code"),
  adminNotes: text("admin_notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

// ── Token Transactions — BRC/BBI purchase, sellback, reward events
export const tokenTransactions = pgTable("token_transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),          // purchase | sellback | transfer | reward
  walletAddress: text("wallet_address"),
  tokenSymbol: text("token_symbol").notNull(),   // BRC | BBI
  amount: text("amount").notNull(),
  usdValue: text("usd_value"),
  txHash: text("tx_hash"),
  status: text("status").default("pending").notNull(), // pending | confirmed | failed | cancelled
  partnerRef: text("partner_ref"),       // reference ID from partner app
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});

// ── Contractors — 1099 independent contractors on the platform
export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(() => registrations.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  type: text("type").notNull(),           // driver | courier | partner | warehouse | last_mile
  tier: text("tier").notNull(),           // laas | maas | saas | warehouse | reverse
  status: text("status").default("active").notNull(),
  taxId: text("tax_id"),
  cdlNumber: text("cdl_number"),
  vehicleType: text("vehicle_type"),
  serviceArea: text("service_area"),
  totalEarnings: text("total_earnings").default("0"),
  platformFees: text("platform_fees").default("0"),
  loadsCompleted: integer("loads_completed").default(0),
  rating: text("rating").default("5.0"),
  accessCode: text("access_code"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Contractor Enrollments — tier subscription records
export const contractorEnrollments = pgTable("contractor_enrollments", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").references(() => contractors.id),
  tier: text("tier").notNull(),           // laas | maas | saas | warehouse | reverse
  status: text("status").default("pending").notNull(),
  monthlyFee: text("monthly_fee").notNull(),
  enrollmentFee: text("enrollment_fee").notNull(),
  enrollmentPaid: boolean("enrollment_paid").default(false),
  activatedAt: timestamp("activated_at"),
  nextBillingAt: timestamp("next_billing_at"),
  paymentRef: text("payment_ref"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── DVX Messages — DivinityVX ↔ Grand Architect comms channel
export const dvxMessages = pgTable("dvx_messages", {
  id: serial("id").primaryKey(),
  from: text("from").notNull(),           // DIVINITYVX | GRAND_ARCHITECT
  message: text("message").notNull(),
  type: text("type").default("info").notNull(), // info | alert | action | insight | reply
  priority: text("priority").default("normal").notNull(),
  context: jsonb("context"),
  read: boolean("read").default(false),
  actionTaken: text("action_taken"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Tenants — Dynasty entity context (Divine Solutions Logistics, LLC)
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  displayName: text("display_name").notNull(),
  entityType: text("entity_type").default("llc").notNull(),
  ein: text("ein"),
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  insuranceExpiry: text("insurance_expiry"),
  authorityStatus: text("authority_status").default("active"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Vehicles — Fleet management (tractors, trailers, straight trucks)
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  tenantCode: text("tenant_code").default("divine_solutions_logistics"),
  unitNumber: text("unit_number").notNull(),
  vin: text("vin"),
  plate: text("plate"),
  type: text("type").default("tractor").notNull(),
  status: text("status").default("available").notNull(),
  lastInspection: text("last_inspection"),
  make: text("make"),
  model: text("model"),
  year: text("year"),
  mileage: text("mileage"),
  assignedDriverId: integer("assigned_driver_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Dispatch Loads — Full load lifecycle (LaaS spine)
export const dispatchLoads = pgTable("dispatch_loads", {
  id: serial("id").primaryKey(),
  tenantCode: text("tenant_code").default("divine_solutions_logistics"),
  reference: text("reference").unique(),
  shipperName: text("shipper_name"),
  consigneeName: text("consignee_name"),
  originCity: text("origin_city"),
  originState: text("origin_state"),
  destinationCity: text("destination_city"),
  destinationState: text("destination_state"),
  pickupWindowStart: timestamp("pickup_window_start"),
  pickupWindowEnd: timestamp("pickup_window_end"),
  deliveryWindowStart: timestamp("delivery_window_start"),
  deliveryWindowEnd: timestamp("delivery_window_end"),
  weight: text("weight"),
  equipmentRequired: text("equipment_required"),
  rate: text("rate"),
  ratePerMile: text("rate_per_mile"),
  miles: integer("miles"),
  commodity: text("commodity"),
  status: text("status").default("tendered").notNull(),
  source: text("source").default("DIVINITY"),
  tier: text("tier").default("laas"),
  assignedDriverId: integer("assigned_driver_id"),
  routePlan: jsonb("route_plan"),
  podImageUrl: text("pod_image_url"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Load Assignments — Driver + vehicle assignment per load
export const loadAssignments = pgTable("load_assignments", {
  id: serial("id").primaryKey(),
  loadId: integer("load_id").notNull().references(() => dispatchLoads.id),
  driverId: integer("driver_id"),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  driverName: text("driver_name"),
  vehicleUnit: text("vehicle_unit"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  dispatchedAt: timestamp("dispatched_at"),
  pickedUpAt: timestamp("picked_up_at"),
  deliveredAt: timestamp("delivered_at"),
  notes: text("notes"),
  metadata: jsonb("metadata"),
});

// ── Logistics Events — Codex-style event spine (CodexChain)
export const logisticsEvents = pgTable("logistics_events", {
  id: serial("id").primaryKey(),
  loadId: integer("load_id").references(() => dispatchLoads.id),
  driverId: integer("driver_id"),
  driverName: text("driver_name"),
  eventType: text("event_type").notNull(),
  eventTime: timestamp("event_time").defaultNow().notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  notes: text("notes"),
  podImageUrl: text("pod_image_url"),
  dynastyEntity: text("dynasty_entity").default("BD_ECCLESIA_EARTH_TRUST"),
  codexChainHash: text("codex_chain_hash"),
  metadata: jsonb("metadata"),
});

// ── Carriers — registered partner-operators with tier subscription
export const carriers = pgTable("carriers", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(() => registrations.id),
  companyName: text("company_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  equipment: text("equipment").notNull(),          // BOX_TRUCK | CLASS_A | SPRINTER | FLATBED | REEFER
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  cdlNumber: text("cdl_number"),
  serviceArea: text("service_area"),
  role: text("role").default("CARRIER").notNull(), // OWNER | CARRIER | CUSTOMER
  tier: text("tier").default("BASIC").notNull(),   // BASIC | PRO | EMPIRE
  status: text("status").default("pending").notNull(), // pending | active | suspended | churned
  accessCode: text("access_code"),
  loadsCompleted: integer("loads_completed").default(0),
  totalEarnings: text("total_earnings").default("0"),
  rating: text("rating").default("5.0"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  activatedAt: timestamp("activated_at"),
});

// ── Subscriptions — Stripe/billing records per carrier
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  carrierId: integer("carrier_id").notNull().references(() => carriers.id),
  tier: text("tier").notNull(),                    // BASIC | PRO | EMPIRE
  status: text("status").default("pending").notNull(), // pending | active | cancelled | past_due
  stripeSessionId: text("stripe_session_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  monthlyAmount: integer("monthly_amount").notNull(), // cents
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFilingSchema = createInsertSchema(filings).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertRegistrationSchema = createInsertSchema(registrations).omit({ id: true, createdAt: true, updatedAt: true, approvedAt: true, accessCode: true, status: true });
export const insertCarrierSchema = createInsertSchema(carriers).omit({ id: true, createdAt: true, updatedAt: true, activatedAt: true, accessCode: true, status: true, role: true });

export type User = typeof users.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Filing = typeof filings.$inferSelect;
export type InsertFiling = z.infer<typeof insertFilingSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
