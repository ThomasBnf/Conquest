# Conquest

Conquest is a comprehensive community management platform that helps organizations track, analyze, and engage with their community members across multiple platforms and channels.

## What is Conquest?

Conquest serves as a **Community CRM** that consolidates member activities, interactions, and data from various sources into a unified dashboard. It's designed for organizations that need to:

- Track member engagement across Discord, Slack, GitHub, and other platforms
- Analyze community sentiment and activity patterns
- Automate workflows based on member interactions
- Manage community events and integrations
- Generate insights about community health and growth

## Key Features

- **Multi-platform Integration**: Connect Discord, Slack, GitHub, Discourse, Livestorm, and more
- **Member Analytics**: Track activities, sentiment analysis, and engagement metrics
- **Workflow Automation**: Automated processes triggered by member activities using Trigger.dev
- **Real-time Dashboard**: Monitor community health with comprehensive analytics
- **Event Management**: Manage and track community events and attendance
- **AI-powered Insights**: Sentiment analysis and categorization of member interactions

## Architecture

Conquest is built as a **Turborepo monorepo** with the following applications:

- **Main App** (`apps/app/`) - Community management dashboard (Next.js)
- **API** (`apps/api/`) - Backend API endpoints
- **Discord Bot** (`apps/discord/`) - Discord integration service
- **Documentation** (`apps/docs/`) - Project documentation
- **Marketing Site** (`apps/web/`) - Public website

### Technology Stack

- **Frontend**: Next.js 15, React Server Components, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with Shadcn/UI components
- **Authentication**: NextAuth.js v5
- **Background Jobs**: Trigger.dev
- **Payments**: Stripe integration

## Prerequisites

- **Bun** (package manager) - version 1.1.26 or higher
- **Node.js** - version 18 or higher
- **PostgreSQL** database

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd conquest
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in the required environment variables including database URLs, API keys, etc.

4. **Set up the database**
   ```bash
   # Generate Prisma client
   bun db:generate
   
   # Run database migrations
   bun db:migrate
   
   # Seed the database (optional)
   bun db:seed
   ```

5. **Start the development server**
   ```bash
   # Start all applications
   bun dev
   
   # Or start specific applications
   bun dev:app      # Main app (port 3000)
   bun dev:api      # API server
   bun dev:discord  # Discord service
   bun dev:web      # Marketing site
   bun dev:docs     # Documentation
   ```

## Development Commands

### Core Commands
- `bun dev` - Start all applications in development mode
- `bun build` - Build all applications
- `bun typecheck` - Run TypeScript type checking
- `bun format-and-lint` - Format and lint code using Biome

### Database Commands
- `bun db:generate` - Generate Prisma client
- `bun db:push` - Push schema changes to database
- `bun db:migrate` - Run database migrations
- `bun db:deploy` - Deploy migrations to production

### Background Jobs
- `bun trigger:dev` - Start Trigger.dev development server

## Project Structure

```
conquest/
├── apps/
│   ├── app/           # Main Next.js application
│   ├── api/           # API server
│   ├── discord/       # Discord integration
│   ├── docs/          # Documentation site
│   └── web/           # Marketing website
├── packages/
│   ├── db/            # Prisma database layer
│   ├── ui/            # Shared UI components
│   ├── trigger/       # Background job processing
│   ├── zod/           # Validation schemas
│   ├── utils/         # Utility functions
│   ├── resend/        # Email functionality
│   └── ai/            # AI/ML features
└── README.md
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For questions and support, please [create an issue](https://github.com/your-org/conquest/issues) in this repository.