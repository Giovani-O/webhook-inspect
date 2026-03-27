# Webhook Inspect

A tool for capturing and inspecting webhook requests.

## Tech Stack

- **API**: Fastify + TypeScript + Zod + Drizzle ORM + PostgreSQL
- **Web**: React + Vite + TypeScript + TanStack Router + Tailwind CSS v4
- **Docs**: Swagger/OpenAPI with Scalar UI

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for PostgreSQL)

## Installation

```bash
pnpm install
```

## Quick Start

```bash
cd api && docker compose up -d && pnpm db:migrate && pnpm dev
```

Then in another terminal:

```bash
cd web && pnpm dev
```

## Services

| Service | URL |
|---------|-----|
| API Server | http://localhost:3333 |
| API Docs | http://localhost:3333/docs |
| Web App | http://localhost:5173 |
| PostgreSQL | localhost:5432 |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/webhooks` | List webhooks (paginated) |
| GET | `/api/webhooks/:id` | Get webhook by ID |
| DELETE | `/api/webhooks/:id` | Delete webhook |
| ALL | `/capture/*` | Capture incoming webhooks |
| POST | `/api/generate` | Generate AI response handler |

## Scripts

### API (run from `api/`)

```bash
pnpm dev              # Start development server
pnpm start            # Start production server (requires build)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database
pnpm biome:fix        # Format + lint + fix
```

### Web (run from `web/`)

```bash
pnpm dev              # Start Vite development server
pnpm build            # Build for production
pnpm preview           # Preview production build
pnpm biome:fix        # Format + lint + fix
```
