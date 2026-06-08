import { 
  users, documents, filings, auditLogs, analytics, walletConnections, documentVersions,
  registrations, tokenTransactions,
  type User, type InsertUser, 
  type Document, type InsertDocument,
  type Filing, type InsertFiling,
  type AuditLog, type InsertAuditLog,
  type Registration, type InsertRegistration,
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, and, count, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  getDocuments(userId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  getFilings(userId: number): Promise<Filing[]>;
  getFiling(id: number): Promise<Filing | undefined>;
  createFiling(filing: InsertFiling): Promise<Filing>;
  updateFiling(id: number, updates: Partial<InsertFiling>): Promise<Filing | undefined>;
  
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(userId?: number, limit?: number): Promise<AuditLog[]>;
  
  trackAnalytics(event: any): Promise<void>;
  getAnalytics(filters?: any): Promise<any[]>;
  getPublicStats(): Promise<{ totalDocuments: number; totalFilings: number; totalUsers: number; recentActivity: any[] }>;

  createRegistration(reg: InsertRegistration): Promise<Registration>;
  getRegistration(id: number): Promise<Registration | undefined>;
  getRegistrations(status?: string): Promise<Registration[]>;
  updateRegistration(id: number, updates: Partial<Registration>): Promise<Registration | undefined>;
  getPendingRegistrationCount(): Promise<number>;
  createTokenTransaction(tx: any): Promise<any>;
  getTokenTransactions(limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getDocuments(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.updatedAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc || undefined;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const docNumber = `BEET-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const [created] = await db.insert(documents).values({ ...doc, documentNumber: docNumber }).returning();
    return created;
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [doc] = await db.update(documents).set({ ...updates, updatedAt: new Date() }).where(eq(documents.id, id)).returning();
    return doc || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  async getFilings(userId: number): Promise<Filing[]> {
    return await db.select().from(filings).where(eq(filings.userId, userId)).orderBy(desc(filings.createdAt));
  }

  async getFiling(id: number): Promise<Filing | undefined> {
    const [filing] = await db.select().from(filings).where(eq(filings.id, id));
    return filing || undefined;
  }

  async createFiling(filing: InsertFiling): Promise<Filing> {
    const [created] = await db.insert(filings).values(filing).returning();
    return created;
  }

  async updateFiling(id: number, updates: Partial<InsertFiling>): Promise<Filing | undefined> {
    const [filing] = await db.update(filings).set(updates).where(eq(filings.id, id)).returning();
    return filing || undefined;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAuditLogs(userId?: number, limit: number = 100): Promise<AuditLog[]> {
    if (userId) {
      return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt)).limit(limit);
    }
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async trackAnalytics(event: any): Promise<void> {
    await db.insert(analytics).values(event);
  }

  async getAnalytics(filters?: any): Promise<any[]> {
    return await db.select().from(analytics).orderBy(desc(analytics.createdAt)).limit(1000);
  }

  async getPublicStats(): Promise<{ totalDocuments: number; totalFilings: number; totalUsers: number; recentActivity: any[] }> {
    try {
      const [docResult] = await db.select({ count: count() }).from(documents);
      const [filingResult] = await db.select({ count: count() }).from(filings);
      const [userResult] = await db.select({ count: count() }).from(users);
      const recentLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(5);
      return {
        totalDocuments: docResult?.count || 0,
        totalFilings: filingResult?.count || 0,
        totalUsers: userResult?.count || 0,
        recentActivity: recentLogs.map(log => ({ action: log.action, entityType: log.entityType, createdAt: log.createdAt })),
      };
    } catch (error) {
      return { totalDocuments: 0, totalFilings: 0, totalUsers: 0, recentActivity: [] };
    }
  }

  async createRegistration(reg: InsertRegistration): Promise<Registration> {
    const [created] = await db.insert(registrations).values(reg).returning();
    return created;
  }

  async getRegistration(id: number): Promise<Registration | undefined> {
    const [reg] = await db.select().from(registrations).where(eq(registrations.id, id));
    return reg || undefined;
  }

  async getRegistrations(status?: string): Promise<Registration[]> {
    if (status) {
      return await db.select().from(registrations).where(eq(registrations.status, status)).orderBy(desc(registrations.createdAt));
    }
    return await db.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  async updateRegistration(id: number, updates: Partial<Registration>): Promise<Registration | undefined> {
    const [reg] = await db.update(registrations).set({ ...updates, updatedAt: new Date() }).where(eq(registrations.id, id)).returning();
    return reg || undefined;
  }

  async getPendingRegistrationCount(): Promise<number> {
    try {
      const [result] = await db.select({ count: count() }).from(registrations).where(eq(registrations.status, 'pending'));
      return result?.count || 0;
    } catch { return 0; }
  }

  async createTokenTransaction(tx: any): Promise<any> {
    const [created] = await db.insert(tokenTransactions).values(tx).returning();
    return created;
  }

  async getTokenTransactions(limit: number = 50): Promise<any[]> {
    return await db.select().from(tokenTransactions).orderBy(desc(tokenTransactions.createdAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
