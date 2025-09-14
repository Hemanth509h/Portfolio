import { 
  type User, type InsertUser, 
  type Contact, type InsertContact, 
  type PortfolioData, type InsertPortfolioData,
  type Media, type InsertMedia,
  type Analytics, type InsertAnalytics,
  type AdminSettings, type InsertAdminSettings,
  type AuditLog, type InsertAuditLog
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

// CRITICAL PRODUCTION SECURITY CHECKS
const isProduction = process.env.NODE_ENV === 'production';
const WEAK_PASSWORDS = ['admin123', 'password', '123456789', 'admin', 'root', 'test', 'demo'];

// Production startup security validation
function validateProductionSecurity() {
  if (isProduction) {
    const adminCode = process.env.ADMIN_CODE;
    
    if (!adminCode) {
      console.error('🚨 CRITICAL SECURITY ERROR: ADMIN_CODE environment variable is required in production!');
      console.error('Application startup blocked for security reasons.');
      process.exit(1);
    }
    
    if (WEAK_PASSWORDS.includes(adminCode.toLowerCase())) {
      console.error('🚨 CRITICAL SECURITY ERROR: Weak admin code detected in production!');
      console.error('Admin code cannot be a common password:', adminCode);
      console.error('Application startup blocked for security reasons.');
      process.exit(1);
    }
    
    if (adminCode.length < 12) {
      console.error('🚨 CRITICAL SECURITY ERROR: Admin code too short for production!');
      console.error('Admin code must be at least 12 characters in production.');
      console.error('Application startup blocked for security reasons.');
      process.exit(1);
    }
    
    // Check password strength
    const hasUppercase = /[A-Z]/.test(adminCode);
    const hasLowercase = /[a-z]/.test(adminCode);
    const hasNumbers = /\d/.test(adminCode);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(adminCode);
    
    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChars) {
      console.error('🚨 CRITICAL SECURITY ERROR: Admin code does not meet production security requirements!');
      console.error('Admin code must contain uppercase, lowercase, numbers, and special characters.');
      console.error('Application startup blocked for security reasons.');
      process.exit(1);
    }
    
    console.log('✅ Production security validation passed');
  }
}

// Validate admin code strength
function validateAdminCodeStrength(code: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (code.length < (isProduction ? 12 : 8)) {
    errors.push(`Admin code must be at least ${isProduction ? 12 : 8} characters long`);
  }
  
  if (WEAK_PASSWORDS.includes(code.toLowerCase())) {
    errors.push('Admin code cannot be a common password');
  }
  
  if (isProduction) {
    if (!/[A-Z]/.test(code)) {
      errors.push('Admin code must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(code)) {
      errors.push('Admin code must contain at least one lowercase letter');
    }
    if (!/\d/.test(code)) {
      errors.push('Admin code must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(code)) {
      errors.push('Admin code must contain at least one special character');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Run production security validation on module load
validateProductionSecurity();

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getPortfolioData(): Promise<PortfolioData | undefined>;
  updatePortfolioData(data: InsertPortfolioData): Promise<PortfolioData>;
  createInitialPortfolioData(): Promise<PortfolioData>;
  
  // Media Library
  createMedia(media: InsertMedia): Promise<Media>;
  getMedia(): Promise<Media[]>;
  getMediaById(id: string): Promise<Media | undefined>;
  updateMedia(id: string, media: Partial<InsertMedia>): Promise<Media | undefined>;
  deleteMedia(id: string): Promise<boolean>;
  
  // Analytics
  createAnalyticsEvent(event: InsertAnalytics): Promise<Analytics>;
  getAnalytics(filters?: { type?: string; target?: string; startDate?: Date; endDate?: Date }): Promise<Analytics[]>;
  getAnalyticsSummary(): Promise<any>;
  
  // Admin Settings
  getAdminSettings(): Promise<AdminSettings | undefined>;
  getPublicAdminSettings(): Promise<Omit<AdminSettings, 'adminCode' | 'totpSecret'> | undefined>;
  updateAdminSettings(settings: InsertAdminSettings): Promise<AdminSettings>;
  createInitialAdminSettings(): Promise<AdminSettings>;
  verifyAdminCode(plainCode: string): Promise<boolean>;
  validateAdminCodeStrength(code: string): { valid: boolean; errors: string[] };
  generateTotpSecret(): string;
  verifyTotpCode(secret: string, token: string): boolean;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contacts: Map<string, Contact>;
  private portfolioData: PortfolioData | undefined;
  private media: Map<string, Media>;
  private analytics: Map<string, Analytics>;
  private adminSettings: AdminSettings | undefined;
  private auditLogs: Map<string, AuditLog>;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.portfolioData = undefined;
    this.media = new Map();
    this.analytics = new Map();
    this.adminSettings = undefined;
    this.auditLogs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = { 
      ...insertContact, 
      id, 
      createdAt: new Date() 
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPortfolioData(): Promise<PortfolioData | undefined> {
    if (!this.portfolioData) {
      // Create initial data if it doesn't exist
      return await this.createInitialPortfolioData();
    }
    return this.portfolioData;
  }

  async updatePortfolioData(insertData: InsertPortfolioData): Promise<PortfolioData> {
    const id = this.portfolioData?.id || randomUUID();
    const updatedData: PortfolioData = {
      id,
      name: insertData.name,
      role: insertData.role,
      bio: insertData.bio,
      email: insertData.email,
      phone: insertData.phone || null,
      location: insertData.location || null,
      githubUrl: insertData.githubUrl || null,
      linkedinUrl: insertData.linkedinUrl || null,
      websiteUrl: insertData.websiteUrl || null,
      resumeUrl: insertData.resumeUrl || null,
      skills: insertData.skills,
      projects: insertData.projects,
      workExperience: insertData.workExperience,
      education: insertData.education,
      // New admin features with defaults
      isDraft: insertData.isDraft || false,
      publishAt: insertData.publishAt || null,
      themeSettings: insertData.themeSettings || '{}',
      seoSettings: insertData.seoSettings || '{}',
      siteSettings: insertData.siteSettings || '{}',
      contentBlocks: insertData.contentBlocks || '[]',
      testimonials: insertData.testimonials || '[]',
      ctaButtons: insertData.ctaButtons || '[]',
      updatedAt: new Date()
    };
    this.portfolioData = updatedData;
    return updatedData;
  }

  async createInitialPortfolioData(): Promise<PortfolioData> {
    const id = randomUUID();
    const initialData: PortfolioData = {
      id,
      name: "Your Name",
      role: "Full Stack Developer",
      bio: "Passionate developer building amazing applications with modern technologies.",
      email: "your.email@example.com",
      phone: null,
      location: null,
      githubUrl: null,
      linkedinUrl: null,
      websiteUrl: null,
      resumeUrl: null,
      skills: ["JavaScript", "TypeScript", "React", "Node.js"],
      projects: JSON.stringify([
        {
          id: "1",
          title: "Sample Project",
          description: "A sample project description",
          technologies: ["React", "TypeScript"],
          githubUrl: "",
          liveUrl: "",
          imageUrl: ""
        }
      ]),
      workExperience: JSON.stringify([]),
      education: JSON.stringify([]),
      // New admin features with sensible defaults
      isDraft: false,
      publishAt: null,
      themeSettings: JSON.stringify({
        primaryColor: "hsl(230, 100%, 60%)",
        darkMode: true,
        font: "Inter"
      }),
      seoSettings: JSON.stringify({
        title: "Your Portfolio | Full Stack Developer",
        description: "Passionate developer building amazing applications with modern technologies.",
        keywords: ["developer", "portfolio", "full stack", "react", "typescript"]
      }),
      siteSettings: JSON.stringify({
        showSkills: true,
        showProjects: true,
        showExperience: true,
        showEducation: true,
        sectionsOrder: ["hero", "skills", "projects", "experience", "education", "contact"]
      }),
      contentBlocks: JSON.stringify([]),
      testimonials: JSON.stringify([]),
      ctaButtons: JSON.stringify([
        { id: "1", label: "View My Work", link: "#projects", style: "primary" },
        { id: "2", label: "Get In Touch", link: "#contact", style: "outline" }
      ]),
      updatedAt: new Date()
    };
    this.portfolioData = initialData;
    return initialData;
  }

  // Media Library Methods
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = randomUUID();
    const media: Media = {
      id,
      url: insertMedia.url,
      alt: insertMedia.alt || '',
      title: insertMedia.title || '',
      description: insertMedia.description || '',
      tags: insertMedia.tags || [],
      fileSize: insertMedia.fileSize || null,
      width: insertMedia.width || null,
      height: insertMedia.height || null,
      createdAt: new Date()
    };
    this.media.set(id, media);
    return media;
  }

  async getMedia(): Promise<Media[]> {
    return Array.from(this.media.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getMediaById(id: string): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async updateMedia(id: string, updates: Partial<InsertMedia>): Promise<Media | undefined> {
    const existing = this.media.get(id);
    if (!existing) return undefined;

    const updated: Media = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt // Preserve creation date
    };
    this.media.set(id, updated);
    return updated;
  }

  async deleteMedia(id: string): Promise<boolean> {
    return this.media.delete(id);
  }

  // Analytics Methods
  async createAnalyticsEvent(insertEvent: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const event: Analytics = {
      id,
      type: insertEvent.type,
      target: insertEvent.target || null,
      referrer: insertEvent.referrer || null,
      userAgent: insertEvent.userAgent || null,
      ipHash: insertEvent.ipHash || null,
      utmSource: insertEvent.utmSource || null,
      utmMedium: insertEvent.utmMedium || null,
      utmCampaign: insertEvent.utmCampaign || null,
      metadata: insertEvent.metadata || '{}',
      createdAt: new Date()
    };
    this.analytics.set(id, event);
    return event;
  }

  async getAnalytics(filters?: { type?: string; target?: string; startDate?: Date; endDate?: Date }): Promise<Analytics[]> {
    let events = Array.from(this.analytics.values());

    if (filters) {
      if (filters.type) {
        events = events.filter(e => e.type === filters.type);
      }
      if (filters.target) {
        events = events.filter(e => e.target === filters.target);
      }
      if (filters.startDate) {
        events = events.filter(e => e.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(e => e.createdAt <= filters.endDate!);
      }
    }

    return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAnalyticsSummary(): Promise<any> {
    const events = Array.from(this.analytics.values());
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent = events.filter(e => e.createdAt >= last30Days);
    
    return {
      totalEvents: events.length,
      recentEvents: recent.length,
      pageviews: events.filter(e => e.type === 'pageview').length,
      clicks: events.filter(e => e.type === 'click').length,
      topPages: this.getTopTargets(events.filter(e => e.type === 'pageview')),
      topReferrers: this.getTopReferrers(events)
    };
  }

  private getTopTargets(events: Analytics[]): Array<{ target: string; count: number }> {
    const counts = new Map<string, number>();
    events.forEach(e => {
      if (e.target) {
        counts.set(e.target, (counts.get(e.target) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([target, count]) => ({ target, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTopReferrers(events: Analytics[]): Array<{ referrer: string; count: number }> {
    const counts = new Map<string, number>();
    events.forEach(e => {
      if (e.referrer) {
        counts.set(e.referrer, (counts.get(e.referrer) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Admin Settings Methods
  async getAdminSettings(): Promise<AdminSettings | undefined> {
    if (!this.adminSettings) {
      return await this.createInitialAdminSettings();
    }
    return this.adminSettings;
  }

  async updateAdminSettings(insertSettings: InsertAdminSettings): Promise<AdminSettings> {
    const id = this.adminSettings?.id || randomUUID();
    
    // Validate admin code strength
    const validation = this.validateAdminCodeStrength(insertSettings.adminCode);
    if (!validation.valid) {
      throw new Error(`Admin code validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Hash the admin code before storing
    const hashedAdminCode = await bcrypt.hash(insertSettings.adminCode, 12); // Increase cost for production security
    
    const settings: AdminSettings = {
      id,
      adminCode: hashedAdminCode,
      totpSecret: insertSettings.totpSecret || null,
      autoReplyTemplates: insertSettings.autoReplyTemplates || '[]',
      brokenLinks: insertSettings.brokenLinks || '[]',
      backupSettings: insertSettings.backupSettings || '{}',
      lastBackup: insertSettings.lastBackup || null,
      createdAt: this.adminSettings?.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.adminSettings = settings;
    return settings;
  }

  async createInitialAdminSettings(): Promise<AdminSettings> {
    const id = randomUUID();
    
    // CRITICAL SECURITY: Get admin code from environment
    const initialAdminCode = process.env.ADMIN_CODE;
    
    if (!initialAdminCode) {
      if (isProduction) {
        throw new Error('ADMIN_CODE environment variable is required in production!');
      }
      // Development fallback with warning
      console.warn('⚠️  Using default admin code "admin123" for development ONLY');
      console.warn('🔒 Set ADMIN_CODE environment variable for production security');
    }
    
    const adminCode = initialAdminCode || "admin123";
    
    // Validate admin code strength
    const validation = this.validateAdminCodeStrength(adminCode);
    if (!validation.valid) {
      throw new Error(`Initial admin code validation failed: ${validation.errors.join(', ')}`);
    }
    
    const hashedAdminCode = await bcrypt.hash(adminCode, 12); // Higher cost for security
    
    const settings: AdminSettings = {
      id,
      adminCode: hashedAdminCode,
      totpSecret: null,
      autoReplyTemplates: JSON.stringify([
        {
          id: "1",
          name: "Default Auto Reply",
          subject: "Thank you for contacting me!",
          body: "Hi {{name}},\n\nThank you for reaching out! I've received your message and will get back to you within 24 hours.\n\nBest regards,\nYour Name"
        }
      ]),
      brokenLinks: '[]',
      backupSettings: JSON.stringify({
        enabled: true,
        frequency: 'daily',
        retentionDays: 30
      }),
      lastBackup: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.adminSettings = settings;
    return settings;
  }

  async verifyAdminCode(plainCode: string): Promise<boolean> {
    const settings = await this.getAdminSettings();
    if (!settings) return false;
    return await bcrypt.compare(plainCode, settings.adminCode);
  }

  async getPublicAdminSettings(): Promise<Omit<AdminSettings, 'adminCode' | 'totpSecret'> | undefined> {
    const settings = await this.getAdminSettings();
    if (!settings) return undefined;
    
    // Return admin settings without sensitive fields
    const { adminCode, totpSecret, ...publicSettings } = settings;
    return publicSettings;
  }

  // Audit Log Methods
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    // Security: Never store the actual admin code, use a masked identifier instead
    const maskedAdminId = "admin-****";
    
    const log: AuditLog = {
      id,
      action: insertLog.action,
      resource: insertLog.resource,
      resourceId: insertLog.resourceId || null,
      adminCode: maskedAdminId, // Always use safe identifier, ignore provided adminCode
      ipAddress: insertLog.ipAddress || null,
      userAgent: insertLog.userAgent || null,
      changes: insertLog.changes || '{}',
      createdAt: new Date()
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  // TOTP/MFA Support Methods
  validateAdminCodeStrength(code: string): { valid: boolean; errors: string[] } {
    return validateAdminCodeStrength(code);
  }
  
  generateTotpSecret(): string {
    // Generate a 32-character base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  }
  
  verifyTotpCode(secret: string, token: string): boolean {
    // Simple TOTP verification implementation
    // In a real production app, you'd use speakeasy or similar library
    // For now, we'll implement a basic time-based verification
    
    if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
      return false;
    }
    
    // Get current 30-second window
    const timeWindow = Math.floor(Date.now() / 30000);
    
    // Simple hash-based verification (replace with proper TOTP in production)
    const expectedToken = this.generateTotpToken(secret, timeWindow);
    const previousToken = this.generateTotpToken(secret, timeWindow - 1);
    const nextToken = this.generateTotpToken(secret, timeWindow + 1);
    
    // Allow current window and ±1 window for clock skew
    return token === expectedToken || token === previousToken || token === nextToken;
  }
  
  private generateTotpToken(secret: string, timeWindow: number): string {
    // Very basic TOTP-like token generation for demonstration
    // In production, use a proper TOTP library like speakeasy
    const crypto = require('crypto');
    const hash = crypto.createHash('sha1');
    hash.update(secret + timeWindow.toString());
    const digest = hash.digest('hex');
    const token = parseInt(digest.substring(0, 6), 16) % 1000000;
    return token.toString().padStart(6, '0');
  }
}

export const storage = new MemStorage();
