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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
