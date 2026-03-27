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

**pnpm 10+**. Always use `pnpm`, not npm or yarn.

## Build/Lint/Test Commands

### API (run from `api/` directory)

```bash
pnpm dev              # Start development server with hot reload
pnpm start            # Start production server (requires build)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database
pnpm biome:fix        # Format + lint + fix (ALWAYS run before committing)
```

### Web (run from `web/` directory)

```bash
pnpm dev              # Start Vite development server
pnpm build            # Build for production (typecheck + vite build)
pnpm preview          # Preview production build
pnpm biome:fix        # Format + lint + fix (ALWAYS run before committing)
```

### Database Setup

```bash
cd api && docker compose up -d && pnpm db:migrate && pnpm dev
```

Database runs on port 5432, API on port 3333. No test framework configured.

## Code Style

### Biome

Indent: 2 spaces, Line width: 80, Quotes: single, Semicolons: as needed. **Always run `pnpm biome:fix` before committing.**

### TypeScript

**Strict mode** enabled; API: ES2024/NodeNext, Web: ES2023/ESNext. `noUnusedLocals: true`, `noUnusedParameters: true`

### Import Conventions

```typescript
// API - use @/* path alias
import { db } from '@/db'
import { webhooks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Web - use relative imports for components
import { Badge } from './ui/badge'
import { twMerge } from 'tailwind-merge'
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `capture-webhook.ts`, `webhooks-list.tsx` |
| Components | PascalCase | `WebhooksList` |
| Functions | camelCase | `captureWebhook` |
| DB tables | lowercase plural | `webhooks` |
| DB columns | snake_case | `created_at` |

### React Components

```tsx
interface BadgeProps extends ComponentProps<'span'> {}
export function Badge({ className, ...props }: Readonly<BadgeProps>) {
  return <span className={twMerge('base-classes', className)} {...props} />
}
```

Use `Readonly<T>` for props; use `twMerge` for conditional classes.

### API Routes

```typescript
export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get('/api/webhooks', {
    schema: { summary: 'List webhooks', tags: ['webhooks'], response: { 200: z.object({}) } },
  }, async (request, reply) => { /* handler */ })
}
```

### Error Handling

Use Zod for validation (automatic via fastify-type-provider-zod). Let validation errors propagate.

### Environment Variables

Defined in `api/src/env.ts` with Zod. Access via `env` import, not `process.env`.

## File Organization

**API** (`api/src/`): `db/index.ts, schema/, seed.ts | routes/*.ts | env.ts | server.ts`

**Web** (`web/src/`): `components/ui/*.tsx | *.tsx | routes/__root.tsx, index.tsx | main.tsx | index.css`

## API Endpoints

- `GET /api/webhooks` - List webhooks (paginated)
- `GET /api/webhooks/:id` - Get webhook by ID
- `DELETE /api/webhooks/:id` - Delete webhook
- `ALL /capture/*` - Capture incoming webhooks
- `POST /api/generate` - Generate AI response handler

Docs at `/docs` when running.

## Tech Stack Notes

**Tailwind CSS v4**: Uses `@tailwindcss/vite`. No `tailwind.config.js`. Use `twMerge` and `tailwind-variants`.

**TanStack Router**: File-based routing. Route files auto-generate `routeTree.gen.ts`.

**Drizzle ORM**: Snake_case columns; use `uuidv7()` for time-sortable primary keys. Schema files in `api/src/db/schema/`.

**Zod v4**: Used for API validation, env vars, and DB schema conversion (`drizzle-zod`).
