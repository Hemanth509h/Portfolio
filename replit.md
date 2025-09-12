# Developer Portfolio

## Overview

A modern, full-stack developer portfolio website built with React and Express.js. This single-page application showcases projects, skills, and professional information with a dark-theme design inspired by Linear, GitHub, and Vercel aesthetics. The portfolio includes animated sections, project filtering, and a secure contact form with email notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with React 18, TypeScript, and Vite for fast development and optimized builds
- **Component Library**: Shadcn/UI components built on Radix UI primitives for consistent, accessible design
- **Styling**: TailwindCSS with a custom dark theme using CSS variables for dynamic theming
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Custom scroll reveal components with intersection observer API for performance

### Backend Architecture
- **Express.js Server**: RESTful API with TypeScript support
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Storage Interface**: Abstracted storage layer supporting both in-memory and database implementations
- **Security**: Input validation with Zod schemas, IP-based rate limiting, and CORS protection

### Design System
- **Color Palette**: Dark-first design with navy-black backgrounds and blue accent system
- **Typography**: Inter font for UI, JetBrains Mono for code elements
- **Layout**: Responsive grid system with consistent spacing using Tailwind scale
- **Components**: Reusable UI components with hover effects, glass morphism, and elevation patterns

### Contact Form System
- **Validation**: Comprehensive client and server-side validation using Zod schemas
- **Rate Limiting**: IP-based throttling (5 submissions per hour) to prevent abuse
- **Data Storage**: Contact submissions stored in PostgreSQL with timestamps
- **Security**: Input sanitization, length limits, and email format validation

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **express**: Web application framework for Node.js backend

### UI and Design
- **@radix-ui/***: Accessible component primitives for complex UI elements
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library with consistent design

### Email Integration
- **nodemailer**: SMTP email sending functionality for contact form notifications
- **@types/nodemailer**: TypeScript definitions for email service

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **zod**: Schema validation for forms and API endpoints
- **wouter**: Lightweight routing library for React

### Cross-Platform Compatibility
- **cross-env**: Cross-platform environment variable handling for Windows, macOS, and Linux compatibility
- **Universal Scripts**: All npm scripts work consistently across operating systems using cross-env wrapper

### Optional Services
- **SMTP Provider**: Gmail, Outlook, or custom SMTP server for email notifications (configured via environment variables)
- **Replit Integration**: Development environment support with error overlay and cartographer plugins