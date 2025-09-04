# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Package Manager
This project uses **bun** as the package manager.

### Development
- `bun dev` - Start all applications in development mode using Turbo
- `bun dev:app` - Start the main Next.js app (port 3000)
- `bun dev:api` - Start the API server  
- `bun dev:docs` - Start the documentation site
- `bun dev:discord` - Start the Discord integration service
- `bun dev:web` - Start the marketing website
- `bun trigger:dev` - Start Trigger.dev development server

### Building & Type Checking
- `bun build` - Build all applications using Turbo
- `bun typecheck` - Run TypeScript type checking across all packages

### Code Quality
- `bun format-and-lint` - Run Biome for formatting and linting
- Use Biome configuration in `biome.json` for code formatting and linting rules

### Database (Prisma)
- `bun db:generate` - Generate Prisma client
- `bun db:push` - Push schema changes to database
- `bun db:migrate` - Run database migrations
- `bun db:deploy` - Deploy migrations to production
- `bun db:seed` - Seed the database

## Architecture Overview

### Monorepo Structure
This is a **Turborepo monorepo** with workspaces in `apps/` and `packages/`:

**Apps:**
- `apps/app/` - Main Next.js application (community management platform)
- `apps/api/` - API routes and endpoints  
- `apps/discord/` - Discord integration service
- `apps/docs/` - Documentation site
- `apps/web/` - Marketing website

**Shared Packages:**
- `packages/db/` - Prisma database layer with all models and operations
- `packages/ui/` - Shared UI components built with Shadcn/UI and Tailwind
- `packages/trigger/` - Background job processing with Trigger.dev
- `packages/zod/` - Shared validation schemas
- `packages/utils/` - Utility functions
- `packages/resend/` - Email templates and sending logic
- `packages/ai/` - AI/ML functionality including sentiment analysis

### Key Technologies
- **Frontend**: Next.js 15 with React Server Components, TypeScript
- **Database**: Prisma ORM with PostgreSQL
- **Styling**: Tailwind CSS with Shadcn/UI components
- **Authentication**: NextAuth.js v5
- **Background Jobs**: Trigger.dev for workflow automation
- **State Management**: Zustand, URL state with nuqs
- **Integrations**: Discord, Slack, GitHub, Discourse, Livestorm APIs
- **Payments**: Stripe integration

### Core Domain Models
The platform manages community data through these key entities:
- **Workspaces** - Top-level organization containers
- **Members** - Community members with profiles across platforms
- **Activities** - Actions performed by members (messages, reactions, etc.)
- **Companies** - Organizations associated with members
- **Workflows** - Automated processes triggered by member activities
- **Integrations** - Connected third-party platforms (Discord, Slack, etc.)

### Data Flow
1. **Integration services** collect data from connected platforms
2. **Trigger.dev jobs** process and normalize the data
3. **Database operations** in `packages/db/` handle data persistence
4. **tRPC API** in `apps/app/server/` provides type-safe data access
5. **React components** consume data via tRPC queries

### Code Conventions
Follow the rules defined in `.cursorrules`:
- Use TypeScript with strict type checking
- Prefer functional programming and React Server Components
- Use arrow functions and descriptive variable names
- Implement proper error handling with Zod validation
- Use Tailwind for styling with mobile-first approach
- Minimize client-side JavaScript usage