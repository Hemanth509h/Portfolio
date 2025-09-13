import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  });

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertPortfolioData = z.infer<typeof insertPortfolioDataSchema>;
export type PortfolioData = typeof portfolioData.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
