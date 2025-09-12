import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple rate limiting - Track IPs and submission times
  const submissionTracker = new Map<string, number[]>();
  const MAX_SUBMISSIONS_PER_HOUR = 5;
  const HOUR_IN_MS = 60 * 60 * 1000;

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

  // Note: Removed /api/contacts endpoint for security - contact data should not be exposed

  const httpServer = createServer(app);
  return httpServer;
}
