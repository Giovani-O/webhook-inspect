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
├── api/                 # Fastify backend
├── web/                 # React frontend
└── package.json         # pnpm workspace root
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

# Testing
pnpm test             # Run all tests once
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
pnpm vitest run path/to/test.test.ts    # Run a single test file
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

Database runs on port 5432, API on port 3333.

## Code Style

### Biome

Indent: 2 spaces, Line width: 80, Quotes: single, Semicolons: as needed.
Organize imports enabled. **Always run `pnpm biome:fix` before committing.**

### TypeScript

**Strict mode** enabled in both packages.
- API: ES2024/NodeNext, moduleResolution: node16
- Web: ES2023/ESNext, moduleResolution: bundler
- `noUnusedLocals: true`, `noUnusedParameters: true`

### Import Conventions

```typescript
// API - use @/* path alias, type imports use `import type`
import { db } from '@/db'
import { webhooks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Web - use relative imports for components
import { Badge } from './ui/badge'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `capture-webhook.ts`, `webhooks-list.tsx` |
| Components | PascalCase | `WebhooksList` |
| Functions | camelCase | `captureWebhook` |
| DB tables | lowercase plural | `webhooks` |
| DB columns | snake_case | `created_at` |
| Test files | `*.test.ts` | `list-webhooks.test.ts` |

### React Components

```tsx
interface BadgeProps extends ComponentProps<'span'> {}

export function Badge({ className, ...props }: Readonly<BadgeProps>) {
  return (
    <span
      className={twMerge('base-classes', className)}
      {...props}
    />
  )
}
```

- Use `Readonly<T>` for props
- Use `twMerge` for conditional classes
- No explicit return type on components
- Destructure props in function signature

### API Routes

```typescript
export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get('/api/webhooks', {
    schema: {
      summary: 'List webhooks',
      tags: ['webhooks'],
      querystring: z.object({ limit: z.coerce.number().min(1).max(100) }),
      response: { 200: z.object({}) },
    },
  }, async (request, reply) => {
    // handler
  })
}
```

- Always define schema with Zod for validation
- Include summary and tags for Swagger docs
- Use `createSelectSchema` from drizzle-zod for response types

### Error Handling

Use Zod for validation (automatic via fastify-type-provider-zod). Let
validation errors propagate - they return proper HTTP error responses.

### Environment Variables

Defined in `api/src/env.ts` with Zod. Access via `env` import, not
`process.env`.

## File Organization

**API** (`api/src/`):
- `db/index.ts`, `db/schema/*.ts`, `db/seed.ts`
- `routes/*.ts`
- `tests/setup/*.ts`, `tests/routes/*.test.ts`
- `env.ts`, `server.ts`

**Web** (`web/src/`):
- `components/ui/*.tsx` - Reusable UI components
- `components/*.tsx` - Feature components
- `routes/__root.tsx`, `routes/index.tsx`, `routes/*.tsx`
- `main.tsx`, `index.css`

## Testing

Tests use Vitest with fastify inject for API testing:

```typescript
import { beforeEach, describe, expect, it } from 'vitest'
import { buildApp, cleanDb, insertWebhook } from '../setup/test-helpers'

const app = buildApp()

beforeEach(async () => {
  await cleanDb()
})

describe('GET /api/webhooks', () => {
  it('returns an empty array when there are no webhooks', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/webhooks' })
    expect(res.statusCode).toBe(200)
  })
})
```

- Test files in `tests/` mirror `src/` structure
- Use `buildApp()` from test-helpers for isolated app instance
- Use `insertWebhook()` and `cleanDb()` for test data setup

## API Endpoints

- `GET /api/webhooks` - List webhooks (paginated, cursor-based)
- `GET /api/webhooks/:id` - Get webhook by ID
- `DELETE /api/webhooks/:id` - Delete webhook
- `ALL /capture/*` - Capture incoming webhooks
- `POST /api/generate` - Generate AI response handler

Docs available at `/docs` when running.

## Tech Stack Notes

**Tailwind CSS v4**: Uses `@tailwindcss/vite`. No `tailwind.config.js`.
Use `twMerge` and `tailwind-variants` for conditional styling.

**TanStack Router**: File-based routing. Route files auto-generate
`routeTree.gen.ts`. Do not edit generated files.

**Drizzle ORM**: Snake_case columns; use `uuidv7()` for time-sortable
primary keys. Schema files in `api/src/db/schema/`.

**Zod v4**: Used for API validation, env vars, and DB schema conversion
(`drizzle-zod`). Use `z.coerce` for query params that need coercion.

**Vitest**: Node environment, global setup for DB, uses vite-tsconfig-paths
for path alias resolution. Forks pool with maxWorkers: 1 for DB isolation.
