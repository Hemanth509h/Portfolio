import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioData = pgTable("portfolio_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),
  resumeUrl: text("resume_url"),
  skills: text("skills").array().notNull().default([]),
  projects: text("projects").notNull().default('[]'), // JSON string for project data
  workExperience: text("work_experience").notNull().default('[]'), // JSON string for work experience data
  education: text("education").notNull().default('[]'), // JSON string for education data
  // New admin features
  isDraft: boolean("is_draft").notNull().default(false),
  publishAt: timestamp("publish_at"),
  themeSettings: text("theme_settings").notNull().default('{}'), // JSON string for theme config
  seoSettings: text("seo_settings").notNull().default('{}'), // JSON string for SEO meta data
  siteSettings: text("site_settings").notNull().default('{}'), // JSON string for site configuration
  contentBlocks: text("content_blocks").notNull().default('[]'), // JSON string for reusable content blocks
  testimonials: text("testimonials").notNull().default('[]'), // JSON string for testimonials
  ctaButtons: text("cta_buttons").notNull().default('[]'), // JSON string for CTA management
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaLibrary = pgTable("media_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(''),
  title: text("title").notNull().default(''),
  description: text("description").notNull().default(''),
  tags: text("tags").array().notNull().default([]),
  fileSize: integer("file_size"),
  width: integer("width"),
  height: integer("height"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'pageview', 'click', 'skill_view', etc.
  target: text("target"), // page path, skill name, project id, etc.
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipHash: text("ip_hash"), // Hashed IP for privacy
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  metadata: text("metadata").notNull().default('{}'), // JSON for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminCode: text("admin_code").notNull(),
  totpSecret: text("totp_secret"),
  autoReplyTemplates: text("auto_reply_templates").notNull().default('[]'), // JSON string
  brokenLinks: text("broken_links").notNull().default('[]'), // JSON string for broken link checker
  backupSettings: text("backup_settings").notNull().default('{}'), // JSON string for backup config
  lastBackup: timestamp("last_backup"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(), // 'create', 'update', 'delete', 'login', etc.
  resource: text("resource").notNull(), // 'portfolio', 'media', 'settings', etc.
  resourceId: text("resource_id"),
  adminCode: text("admin_code").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  changes: text("changes").notNull().default('{}'), // JSON string for change details
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSchema = createInsertSchema(contacts)
  .pick({
    name: true,
    email: true,
    subject: true,
    message: true,
  })
  .extend({
    name: z.string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .trim()
      .refine(val => val.length > 0, "Name cannot be empty"),
    email: z.string()
      .email("Please enter a valid email address")
      .max(254, "Email address is too long")
      .toLowerCase()
      .trim(),
    subject: z.string()
      .min(1, "Subject is required")
      .max(200, "Subject must be less than 200 characters")
      .trim()
      .refine(val => val.length > 0, "Subject cannot be empty"),
    message: z.string()
      .min(10, "Message must be at least 10 characters long")
      .max(5000, "Message must be less than 5000 characters")
      .trim()
      .refine(val => val.length >= 10, "Please provide a more detailed message"),
  });

export const insertPortfolioDataSchema = createInsertSchema(portfolioData)
  .pick({
    name: true,
    role: true,
    bio: true,
    email: true,
    phone: true,
    location: true,
    githubUrl: true,
    linkedinUrl: true,
    websiteUrl: true,
    resumeUrl: true,
    skills: true,
    projects: true,
    workExperience: true,
    education: true,
    isDraft: true,
    publishAt: true,
    themeSettings: true,
    seoSettings: true,
    siteSettings: true,
    contentBlocks: true,
    testimonials: true,
    ctaButtons: true,
  })
  .extend({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    role: z.string().min(1, "Role is required").max(100, "Role too long"),
    bio: z.string().min(1, "Bio is required").max(1000, "Bio too long"),
    email: z.string().email("Invalid email").max(254, "Email too long"),
    phone: z.string().optional(),
    location: z.string().optional(),
    githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
    linkedinUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
    websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
    resumeUrl: z.string().url("Invalid resume URL").optional().or(z.literal("")),
    skills: z.array(z.string()).default([]),
    projects: z.string().default('[]'),
    workExperience: z.string().default('[]'),
    education: z.string().default('[]'),
    // New admin features (all optional)
    isDraft: z.boolean().optional(),
    publishAt: z.date().optional(),
    themeSettings: z.string().optional(),
    seoSettings: z.string().optional(),
    siteSettings: z.string().optional(),
    contentBlocks: z.string().optional(),
    testimonials: z.string().optional(),
    ctaButtons: z.string().optional(),
  });

// Additional schemas for new tables
export const insertMediaSchema = createInsertSchema(mediaLibrary)
  .pick({
    url: true,
    alt: true,
    title: true,
    description: true,
    tags: true,
    fileSize: true,
    width: true,
    height: true,
  })
  .extend({
    url: z.string().url("Invalid URL"),
    alt: z.string().max(200, "Alt text too long"),
    title: z.string().max(200, "Title too long"),
    description: z.string().max(1000, "Description too long"),
    tags: z.array(z.string()).default([]),
    fileSize: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  });

export const insertAnalyticsSchema = createInsertSchema(analytics)
  .pick({
    type: true,
    target: true,
    referrer: true,
    userAgent: true,
    ipHash: true,
    utmSource: true,
    utmMedium: true,
    utmCampaign: true,
    metadata: true,
  })
  .extend({
    type: z.string().min(1, "Type is required"),
    target: z.string().optional(),
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
    ipHash: z.string().optional(),
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    metadata: z.string().default('{}'),
  });

export const insertAdminSettingsSchema = createInsertSchema(adminSettings)
  .pick({
    adminCode: true,
    totpSecret: true,
    autoReplyTemplates: true,
    brokenLinks: true,
    backupSettings: true,
    lastBackup: true,
  })
  .extend({
    adminCode: z.string().min(8, "Admin code must be at least 8 characters"),
    totpSecret: z.string().optional(),
    autoReplyTemplates: z.string().default('[]'),
    brokenLinks: z.string().default('[]'),
    backupSettings: z.string().default('{}'),
    lastBackup: z.date().optional(),
  });

export const insertAuditLogSchema = createInsertSchema(auditLogs)
  .pick({
    action: true,
    resource: true,
    resourceId: true,
    adminCode: true,
    ipAddress: true,
    userAgent: true,
    changes: true,
  })
  .extend({
    action: z.string().min(1, "Action is required"),
    resource: z.string().min(1, "Resource is required"),
    resourceId: z.string().optional(),
    adminCode: z.string().min(1, "Admin code is required"),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    changes: z.string().default('{}'),
  });

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Admin authentication schemas
export const adminVerifySchema = z.object({
  code: z.string()
    .min(8, "Admin code must be at least 8 characters")
    .max(128, "Admin code too long")
    .trim()
    .refine(val => val !== "admin123", "Default admin code not allowed")
    .refine(val => val !== "password", "Common passwords not allowed")
    .refine(val => val !== "123456789", "Common passwords not allowed")
    .refine(val => !/^(test|demo|admin|root|user)$/i.test(val), "Common usernames not allowed as passwords"),
  totpCode: z.string().length(6, "TOTP code must be 6 digits").regex(/^\d{6}$/, "TOTP code must be numeric").optional(),
});

export const adminCodeRotationSchema = z.object({
  currentCode: z.string().min(1, "Current admin code is required"),
  newCode: z.string()
    .min(12, "New admin code must be at least 12 characters for production")
    .max(128, "New admin code too long")
    .trim()
    .refine(val => val !== "admin123", "Default admin code not allowed")
    .refine(val => val !== "password", "Common passwords not allowed")
    .refine(val => val !== "123456789", "Common passwords not allowed")
    .refine(val => !/^(test|demo|admin|root|user)$/i.test(val), "Common usernames not allowed as passwords")
    .refine(val => /[A-Z]/.test(val), "Must contain at least one uppercase letter")
    .refine(val => /[a-z]/.test(val), "Must contain at least one lowercase letter")
    .refine(val => /\d/.test(val), "Must contain at least one number")
    .refine(val => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(val), "Must contain at least one special character"),
});

export const totpSetupSchema = z.object({
  secret: z.string().min(1, "TOTP secret is required"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits").regex(/^\d{6}$/, "Verification code must be numeric"),
});

export const sessionValidationSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  lastActivity: z.date(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertPortfolioData = z.infer<typeof insertPortfolioDataSchema>;
export type PortfolioData = typeof portfolioData.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Media = typeof mediaLibrary.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type AdminVerifyRequest = z.infer<typeof adminVerifySchema>;
export type AdminCodeRotationRequest = z.infer<typeof adminCodeRotationSchema>;
export type TotpSetupRequest = z.infer<typeof totpSetupSchema>;
export type SessionValidationRequest = z.infer<typeof sessionValidationSchema>;
