# Overview

This project is a full-stack financial technology application built around the SOVR Pay ecosystem, featuring blockchain-based payment processing using ERC-20 tokens on Polygon. The system combines a React frontend with an Express.js backend, utilizing Drizzle ORM for database operations and integrating with the Neon serverless PostgreSQL database. The application focuses on secure payment processing, merchant integrations, and real-time blockchain settlements using the SOVRCreditBridgePOS smart contract.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for development tooling
- **UI Components**: Comprehensive shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and dark mode support
- **State Management**: TanStack React Query for server state management and caching
- **Build System**: Vite with custom configuration for monorepo structure

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework using ES modules
- **API Pattern**: RESTful endpoints with TypeScript for type safety
- **Database Layer**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Build Process**: ESBuild for server bundling and production builds

## Data Storage Solutions
- **Primary Database**: Neon serverless PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with schema-first approach located in `shared/schema.ts`
- **Migrations**: Drizzle Kit for database schema migrations in `./migrations` directory
- **Session Storage**: PostgreSQL-based session storage for authentication persistence

## Authentication and Authorization
- **Session Management**: Server-side sessions with secure cookie handling
- **Password Security**: bcryptjs for password hashing and verification
- **Form Validation**: React Hook Form with Zod resolvers for type-safe validation
- **Security Headers**: Built-in security middleware for production deployments

## External Dependencies
- **Blockchain Integration**: Neon serverless database for Web3 transaction data
- **UI Framework**: Radix UI primitives for accessible, unstyled components
- **Development Tools**: Replit-specific plugins for runtime error handling and debugging
- **Payment Processing**: Integration ready for SOVR Credit blockchain settlements
- **Styling System**: Tailwind CSS with custom color variables and responsive design tokens