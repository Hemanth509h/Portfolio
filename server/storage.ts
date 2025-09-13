import { type User, type InsertUser, type Contact, type InsertContact, type PortfolioData, type InsertPortfolioData } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  getPortfolioData(): Promise<PortfolioData | undefined>;
  updatePortfolioData(data: InsertPortfolioData): Promise<PortfolioData>;
  createInitialPortfolioData(): Promise<PortfolioData>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contacts: Map<string, Contact>;
  private portfolioData: PortfolioData | undefined;

  constructor() {
    this.users = new Map();
    this.contacts = new Map();
    this.portfolioData = undefined;
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
      updatedAt: new Date()
    };
    this.portfolioData = initialData;
    return initialData;
  }
}

export const storage = new MemStorage();
