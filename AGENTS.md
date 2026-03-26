# AGENTS.md

Guidelines for agentic coding agents working in this repository.

## Project Overview

Webhook Inspect - A tool for capturing and inspecting webhook requests.

- **API**: Fastify + TypeScript + Zod + Drizzle ORM + PostgreSQL
- **Web**: React + Vite + TypeScript + TanStack Router + Tailwind CSS v4
- **Docs**: Swagger/OpenAPI with Scalar UI

## Monorepo Structure

```
webhook-inspect/
├── api/           # Fastify backend
├── web/           # React frontend
└── package.json   # pnpm workspace root
```

## Package Manager

**pnpm 10+** (defined in package.json). Always use `pnpm`, not npm or yarn.

## Build/Lint/Test Commands

### API (run from `api/` directory)

```bash
pnpm dev              # Start development server with hot reload
pnpm start            # Start production server (requires build)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database
pnpm biome:format     # Format code with Biome
pnpm biome:lint       # Lint code with Biome
pnpm biome:fix        # Format + lint + fix
```

### Web (run from `web/` directory)

```bash
pnpm dev              # Start Vite development server
pnpm build            # Build for production (typecheck + vite build)
pnpm preview          # Preview production build
pnpm biome:format     # Format code with Biome
pnpm biome:lint       # Lint code with Biome
pnpm biome:fix        # Format + lint + fix
```

### Testing

No test framework is currently configured. When tests are added, update this section.

## Database Setup

```bash
cd api
docker compose up -d          # Start PostgreSQL
pnpm db:migrate               # Run migrations
pnpm dev                      # Start API server
```

Database runs on port 5432, API on port 3333.

## Code Style

### Biome Configuration

This project uses **Biome** for formatting and linting (not ESLint/Prettier).

Key rules (from root `biome.json`):
- Indent: 2 spaces
- Line width: 80 characters
- Quotes: single quotes
- Semicolons: as needed (omit when unnecessary)
- Linter: recommended rules enabled
- Import organization: enabled (auto-organize imports)

**Always run `pnpm biome:fix` before committing.**

### TypeScript

- **Strict mode** enabled in all tsconfig files
- Target: ES2024 (API), ES2023 (web)
- Module: NodeNext (API), ESNext (web)

### Import Conventions

```typescript
// API - use @/* path alias
import { db } from '@/db'
import { webhooks } from '@/db/schema'

// External imports first, then internal
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
```

```typescript
// Web - use relative imports for components
import { Badge } from './ui/badge'
import { Sidebar } from '../components/sidebar'

// External imports first
import { createFileRoute } from '@tanstack/react-router'
import { StrictMode } from 'react'
```

### Naming Conventions

- **Files**: kebab-case (e.g., `capture-webhook.ts`, `webhooks-list.tsx`)
- **Components**: PascalCase (e.g., `WebhooksList`, `CodeBlock`)
- **Functions**: camelCase (e.g., `captureWebhook`, `listWebhooks`)
- **Routes**: kebab-case files, exported as camelCase (e.g., `captureWebhook`)
- **Database tables**: lowercase plural (e.g., `webhooks`)
- **Types/Interfaces**: PascalCase (e.g., `BadgeProps`, `ZodTypeProvider`)

### React Components

```tsx
// Component structure
interface ComponentProps extends ComponentProps<'div'> {
  // props
}

export function Component({ className, ...props }: Readonly<ComponentProps>) {
  return (
    <div className={twMerge('base-classes', className)} {...props} />
  )
}
```

- Use `Readonly<T>` for props types
- Extend native element props when appropriate
- Use `twMerge` for conditional class merging
- Destructure props in function signature

### API Routes

```typescript
// Route file pattern
import { db } from '@/db'
import { webhooks } from '@/db/schema'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const routeName: FastifyPluginAsyncZod = async (app) => {
  app.get('/api/path', {
    schema: {
      summary: 'Description',
      tags: ['category'],
      response: { 200: z.object({}) },
    },
  }, async (request, reply) => {
    // handler
  })
}
```

### Error Handling

- Use Zod for validation (automatic via fastify-type-provider-zod)
- Let validation errors propagate (handled by Fastify)
- Use TypeScript strict null checks

### Environment Variables

Defined in `api/src/env.ts` with Zod validation:

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url(),
})
```

Always access via `env` import, not `process.env` directly.

## File Organization

### API (`api/src/`)

```
src/
├── db/
│   ├── index.ts           # Drizzle instance
│   ├── schema/            # Table definitions
│   └── seed.ts            # Seed data
├── routes/                # Route handlers (one file per route)
├── env.ts                 # Environment config
└── server.ts              # App entry point
```

### Web (`web/src/`)

```
src/
├── components/
│   ├── ui/                # Reusable UI components
│   └── *.tsx              # Feature components
├── routes/
│   ├── __root.tsx         # Root layout
│   └── index.tsx          # Route components
├── main.tsx               # App entry
└── index.css              # Global styles
```

## API Endpoints

- `GET /api/webhooks` - List webhooks (paginated)
- `GET /api/webhooks/:id` - Get webhook by ID
- `DELETE /api/webhooks/:id` - Delete webhook
- `ALL /capture/*` - Capture incoming webhooks

API docs available at `/docs` when running.

## Tech Stack Notes

### Tailwind CSS v4

Uses `@tailwindcss/vite` plugin. No `tailwind.config.js` needed. Tailwind directives are enabled in Biome CSS parser.

### TanStack Router

File-based routing. Route files in `web/src/routes/` auto-generate `routeTree.gen.ts`. Use `createFileRoute` for route components.

### Drizzle ORM

- Snake_case for database columns
- Use `uuidv7()` for primary keys (time-sortable)
- Schema files in `api/src/db/schema/`

### Zod v4

Used for:
- API request/response validation
- Environment variable validation
- Database schema to Zod conversion (`drizzle-zod`)
