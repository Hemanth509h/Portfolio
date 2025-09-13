import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertPortfolioDataSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import crypto from "crypto";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple rate limiting - Track IPs and submission times
  const submissionTracker = new Map<string, number[]>();
  const MAX_SUBMISSIONS_PER_HOUR = 5;
  const HOUR_IN_MS = 60 * 60 * 1000;

  // Simple session storage for admin authentication
  const sessions = new Map<string, { userId: string; expires: Date }>();
  const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Hash function for passwords
  function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password + 'salt').digest('hex');
  }

  // Create initial admin user if none exists
  async function ensureAdminUser() {
    const existingAdmin = await storage.getUserByUsername('admin');
    if (!existingAdmin) {
      const hashedPassword = hashPassword('admin123'); // Change this password!
      await storage.createUser({
        username: 'admin',
        password: hashedPassword
      });
      console.log('Created initial admin user: admin/admin123 - CHANGE THIS PASSWORD!');
    }
  }

  // Authentication middleware
  function requireAuth(req: any, res: any, next: any) {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const session = sessions.get(sessionId);
    if (!session || session.expires < new Date()) {
      sessions.delete(sessionId);
      return res.status(401).json({ message: 'Session expired' });
    }

    req.userId = session.userId;
    next();
  }

  // Initialize admin user
  await ensureAdminUser();

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const hashedPassword = hashPassword(password);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      const sessionId = crypto.randomUUID();
      const expires = new Date(Date.now() + SESSION_DURATION);
      sessions.set(sessionId, { userId: user.id, expires });

      res.json({ sessionId, message: "Login successful" });
    } catch (error) {
      console.error("Admin login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get portfolio data endpoint
  app.get("/api/portfolio", async (req, res) => {
    try {
      const portfolioData = await storage.getPortfolioData();
      res.json(portfolioData);
    } catch (error) {
      console.error("Get portfolio data error:", error);
      res.status(500).json({ message: "Failed to get portfolio data" });
    }
  });

  // Update portfolio data endpoint (admin only)
  app.put("/api/admin/portfolio", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPortfolioDataSchema.parse(req.body);
      const updatedData = await storage.updatePortfolioData(validatedData);
      res.json(updatedData);
    } catch (error) {
      console.error("Update portfolio data error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update portfolio data" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logout successful" });
  });

  // Create email transporter (uses environment variables for SMTP config)
  let transporter: nodemailer.Transporter;
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // sender gmail
        pass: process.env.SMTP_PASS, // sender app password
      },
    });
  } catch (error) {
    console.warn("Email transporter not configured. Emails will not be sent.", error);
    transporter = null as any;
  }

  // Contact form submission endpoint with rate limiting and email
  app.post("/api/contact", async (req, res) => {
    try {
      // Basic rate limiting by IP
      const clientIP = req.ip || req.connection.remoteAddress || "unknown";
      const now = Date.now();
      
      // Clean old submissions (older than 1 hour)
      const currentSubmissions = submissionTracker.get(clientIP) || [];
      const recentSubmissions = currentSubmissions.filter(time => now - time < HOUR_IN_MS);
      
      if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
        return res.status(429).json({
          success: false,
          message: "Too many submissions. Please try again later."
        });
      }

      // Validate input data
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      
      // Update rate limiting tracker
      recentSubmissions.push(now);
      submissionTracker.set(clientIP, recentSubmissions);
      
      console.log(`New contact submission from ${contact.email}:`, {
        name: contact.name,
        subject: contact.subject,
        message: contact.message,
      });
      
      // Send email notification if transporter is available
      if (transporter && process.env.SMTP_USER && process.env.NOTIFICATION_EMAIL) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.NOTIFICATION_EMAIL, // where you want to receive contact notifications
            subject: `Portfolio Contact: ${contact.subject}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> ${contact.email}</p>
              <p><strong>Subject:</strong> ${contact.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${contact.message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p><small>Submitted on: ${contact.createdAt.toISOString()}</small></p>
            `,
          });
          console.log("Contact notification email sent successfully");
        } catch (emailError) {
          console.error("Failed to send notification email:", emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Thank you for your message! I'll get back to you soon.",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Please check your input and try again.",
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again later."
      });
    }
  });

  // Resume download endpoint
  app.get("/api/resume/download", (req, res) => {
    console.log("📄 Resume download requested");
    try {
      // Use different path resolution approaches
      let resumePath = path.join(process.cwd(), "server", "public", "resume.txt");
      
      // Check if file exists
      if (!fs.existsSync(resumePath)) {
        // Try alternative path
        resumePath = path.join(__dirname, "public", "resume.txt");
        
        if (!fs.existsSync(resumePath)) {
          console.log("❌ Resume file not found");
          return res.status(404).json({
            success: false,
            message: "Resume file not found"
          });
        }
      }
      
      console.log("✅ Resume file found, serving download");
      
      // Set appropriate headers for secure file download
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=Alex_Johnson_Resume.txt");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      
      // Use streaming instead of loading entire file into memory
      res.download(resumePath, "Alex_Johnson_Resume.txt", (err) => {
        if (err) {
          console.error("❌ Resume download stream error:", err.message);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Failed to download resume"
            });
          }
        } else {
          console.log("✅ Resume download completed successfully");
        }
      });
    } catch (error) {
      console.error("❌ Resume download error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to download resume"
      });
    }
  });

  // Note: Removed /api/contacts endpoint for security - contact data should not be exposed

  const httpServer = createServer(app);
  return httpServer;
}
