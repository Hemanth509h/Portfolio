import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertPortfolioDataSchema, adminVerifySchema, adminCodeRotationSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Rate limiting - Track IPs and submission times for contact form AND admin auth
  const submissionTracker = new Map<string, number[]>();
  const adminAuthTracker = new Map<string, {attempts: number[], lastFailTime: number, backoffLevel: number}>();
  const MAX_SUBMISSIONS_PER_HOUR = 5;
  const BASE_ADMIN_ATTEMPTS = 3;
  const HOUR_IN_MS = 60 * 60 * 1000;
  const FIFTEEN_MIN_MS = 15 * 60 * 1000;
  
  // Exponential backoff for admin auth
  const EXPONENTIAL_BACKOFF_BASE = 2; // Base multiplier
  const MAX_BACKOFF_TIME = 30 * 60 * 1000; // 30 minutes max

  // CRITICAL SECURITY: Block default admin codes in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !process.env.ADMIN_CODE) {
    console.error('🚨 SECURITY ERROR: ADMIN_CODE environment variable MUST be set in production!');
    console.error('Application will not start without proper admin code configuration.');
    process.exit(1);
  }
  
  if (!process.env.ADMIN_CODE) {
    console.log('⚠️  Using default admin code "admin123" for development ONLY');
    console.log('💡 Set ADMIN_CODE environment variable for production');
  }

  // Rate limiting helper for admin authentication with exponential backoff
  function isAdminRateLimited(ip: string): { limited: boolean; waitTime?: number } {
    const now = Date.now();
    const data = adminAuthTracker.get(ip) || { attempts: [], lastFailTime: 0, backoffLevel: 0 };
    
    // Remove old attempts outside the 15-minute window
    const recentAttempts = data.attempts.filter(time => now - time < FIFTEEN_MIN_MS);
    data.attempts = recentAttempts;
    
    // Calculate current backoff time based on failure level
    const backoffTime = Math.min(
      Math.pow(EXPONENTIAL_BACKOFF_BASE, data.backoffLevel) * 1000, // Start with 1s, 2s, 4s, 8s...
      MAX_BACKOFF_TIME
    );
    
    // Check if still in backoff period
    if (data.lastFailTime && (now - data.lastFailTime) < backoffTime) {
      return { limited: true, waitTime: Math.ceil((backoffTime - (now - data.lastFailTime)) / 1000) };
    }
    
    // Check if exceeded max attempts in window
    const maxAttempts = BASE_ADMIN_ATTEMPTS + Math.floor(data.backoffLevel / 3); // Slight increase after multiple failures
    if (recentAttempts.length >= maxAttempts) {
      return { limited: true, waitTime: Math.ceil(backoffTime / 1000) };
    }
    
    adminAuthTracker.set(ip, data);
    return { limited: false };
  }

  // Record failed admin attempt with exponential backoff
  function recordFailedAdminAttempt(ip: string) {
    const now = Date.now();
    const data = adminAuthTracker.get(ip) || { attempts: [], lastFailTime: 0, backoffLevel: 0 };
    
    data.attempts.push(now);
    data.lastFailTime = now;
    data.backoffLevel = Math.min(data.backoffLevel + 1, 10); // Cap at level 10
    
    adminAuthTracker.set(ip, data);
  }
  
  // Reset admin attempts on successful login
  function resetAdminAttempts(ip: string) {
    adminAuthTracker.delete(ip);
  }

  // Simple rate limiting for contact form
  function isContactRateLimited(ip: string): boolean {
    const now = Date.now();
    const attempts = submissionTracker.get(ip) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < HOUR_IN_MS);
    submissionTracker.set(ip, recentAttempts);
    
    return recentAttempts.length >= MAX_SUBMISSIONS_PER_HOUR;
  }

  // SECURE SESSION-BASED ADMIN AUTHENTICATION MIDDLEWARE
  async function requireAdminSession(req: any, res: any, next: any) {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Check if session exists and is valid
    if (!req.session || !req.session.isAdminAuthenticated || !req.session.adminId) {
      // Log unauthorized access attempt
      await storage.createAuditLog({
        action: 'auth_failed',
        resource: 'admin',
        resourceId: undefined,
        adminCode: 'session-invalid',
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'],
        changes: JSON.stringify({ reason: 'no_session' })
      });
      return res.status(401).json({ message: 'Admin session required. Please log in.' });
    }
    
    // Check session expiry (additional security layer)
    const sessionAge = Date.now() - (req.session.loginTime || 0);
    const MAX_SESSION_AGE = 30 * 60 * 1000; // 30 minutes
    
    if (sessionAge > MAX_SESSION_AGE) {
      // Session expired, destroy it
      req.session.destroy((err: any) => {
        if (err) console.error('Session destruction error:', err);
      });
      
      await storage.createAuditLog({
        action: 'session_expired',
        resource: 'admin',
        resourceId: req.session.adminId,
        adminCode: 'session-expired',
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'],
        changes: JSON.stringify({ sessionAge })
      });
      
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    
    // Update session activity timestamp
    req.session.lastActivity = Date.now();
    next();
  }

  // SECURE ADMIN LOGIN ENDPOINT WITH SESSION CREATION
  app.post("/api/admin/login", async (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Check exponential backoff rate limiting
    const rateLimitResult = isAdminRateLimited(clientIP);
    if (rateLimitResult.limited) {
      return res.status(429).json({ 
        success: false, 
        message: `Too many failed attempts. Please wait ${rateLimitResult.waitTime} seconds before trying again.`,
        waitTime: rateLimitResult.waitTime
      });
    }

    try {
      // Validate input using Zod schema
      const validatedData = adminVerifySchema.parse(req.body);
      const { code, totpCode } = validatedData;
      
      // Verify admin code
      const isCodeValid = await storage.verifyAdminCode(code);
      if (!isCodeValid) {
        recordFailedAdminAttempt(clientIP);
        
        // Log failed authentication
        await storage.createAuditLog({
          action: 'auth_failed',
          resource: 'admin',
          resourceId: undefined,
          adminCode: 'failed-attempt',
          ipAddress: clientIP,
          userAgent: req.headers['user-agent'],
          changes: JSON.stringify({ reason: 'invalid_code', method: 'login_endpoint' })
        });
        
        return res.status(401).json({ success: false, message: "Invalid admin credentials" });
      }
      
      // Check TOTP if enabled
      const adminSettings = await storage.getAdminSettings();
      if (adminSettings?.totpSecret && !totpCode) {
        return res.status(400).json({ 
          success: false, 
          message: "TOTP verification code required",
          requiresTotp: true 
        });
      }
      
      if (adminSettings?.totpSecret && totpCode) {
        // TODO: Implement TOTP verification here
        // For now, we'll skip TOTP validation but the structure is ready
      }
      
      // Create secure admin session
      const adminId = adminSettings?.id || 'admin';
      req.session.isAdminAuthenticated = true;
      req.session.adminId = adminId;
      req.session.loginTime = Date.now();
      req.session.lastActivity = Date.now();
      
      // Reset failed attempts on successful login
      resetAdminAttempts(clientIP);
      
      // Log successful authentication
      await storage.createAuditLog({
        action: 'auth_success',
        resource: 'admin',
        resourceId: adminId,
        adminCode: 'admin-****',
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'],
        changes: JSON.stringify({ method: 'session_login' })
      });
      
      res.json({ 
        success: true, 
        message: "Admin authentication successful",
        sessionInfo: {
          loginTime: req.session.loginTime,
          maxAge: 30 * 60 * 1000 // 30 minutes
        }
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid input data",
          errors: error.errors 
        });
      }
      
      console.error("Admin login error:", error);
      recordFailedAdminAttempt(clientIP);
      res.status(500).json({ success: false, message: "Authentication failed" });
    }
  });
  
  // ADMIN LOGOUT ENDPOINT
  app.post("/api/admin/logout", async (req, res) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const adminId = req.session?.adminId;
    
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        
        // Log logout
        if (adminId) {
          storage.createAuditLog({
            action: 'logout',
            resource: 'admin',
            resourceId: adminId,
            adminCode: 'admin-****',
            ipAddress: clientIP,
            userAgent: req.headers['user-agent'],
            changes: JSON.stringify({ method: 'logout_endpoint' })
          }).catch(err => console.error('Audit log error:', err));
        }
        
        res.json({ success: true, message: 'Logged out successfully' });
      });
    } else {
      res.json({ success: true, message: 'Already logged out' });
    }
  });
  
  // ADMIN SESSION STATUS ENDPOINT
  app.get("/api/admin/session", async (req, res) => {
    if (req.session?.isAdminAuthenticated) {
      const sessionAge = Date.now() - (req.session.loginTime || 0);
      const remainingTime = Math.max(0, (30 * 60 * 1000) - sessionAge);
      
      res.json({
        authenticated: true,
        loginTime: req.session.loginTime,
        lastActivity: req.session.lastActivity,
        remainingTime
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // CRITICAL SECURITY: Admin code rotation endpoint
  app.post("/api/admin/settings/rotate-code", requireAdminSession, async (req, res) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      // Validate input using Zod schema
      const validatedData = adminCodeRotationSchema.parse(req.body);
      const { currentCode, newCode } = validatedData;

      // Verify current code again for security
      const isCurrentValid = await storage.verifyAdminCode(currentCode);
      if (!isCurrentValid) {
        await storage.createAuditLog({
          action: 'code_rotation_failed',
          resource: 'admin_settings',
          resourceId: undefined,
          adminCode: 'admin-****',
          ipAddress: clientIP,
          userAgent: req.headers['user-agent'],
          changes: JSON.stringify({ reason: 'invalid_current_code' })
        });
        return res.status(401).json({ message: 'Current admin code is invalid' });
      }

      // Update admin code
      const adminSettings = await storage.getAdminSettings();
      if (!adminSettings) {
        return res.status(500).json({ message: 'Admin settings not found' });
      }

      await storage.updateAdminSettings({
        adminCode: newCode,
        totpSecret: adminSettings.totpSecret || undefined,
        autoReplyTemplates: adminSettings.autoReplyTemplates,
        brokenLinks: adminSettings.brokenLinks,
        backupSettings: adminSettings.backupSettings,
        lastBackup: adminSettings.lastBackup || undefined
      });

      // Log successful code rotation
      await storage.createAuditLog({
        action: 'code_rotation_success',
        resource: 'admin_settings',
        resourceId: adminSettings.id,
        adminCode: 'admin-****',
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'],
        changes: JSON.stringify({ action: 'admin_code_changed' })
      });

      res.json({ success: true, message: 'Admin code successfully updated' });
    } catch (error) {
      console.error("Admin code rotation error:", error);
      res.status(500).json({ message: 'Failed to update admin code' });
    }
  });

  // Get public admin settings (excludes sensitive data)
  app.get("/api/admin/settings", requireAdminSession, async (req, res) => {
    try {
      const publicSettings = await storage.getPublicAdminSettings();
      res.json(publicSettings);
    } catch (error) {
      console.error("Get admin settings error:", error);
      res.status(500).json({ message: 'Failed to get admin settings' });
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
  app.put("/api/admin/portfolio", requireAdminSession, async (req, res) => {
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
