# Webhook Inspect

A tool for capturing and inspecting webhook requests.

## Tech Stack

- **API**: Fastify, TypeScript, Zod, Drizzle ORM, PostgreSQL
- **Web**: React, Vite, TypeScript
- **Docs**: Swagger/OpenAPI with Scalar UI

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for PostgreSQL)

## Installation

```bash
pnpm install
```

## Usage

### Start Database

```bash
cd api && docker compose up -d
```

### Run Database Migrations

```bash
cd api && pnpm db:migrate
```

### Start API Server

```bash
cd api && pnpm dev
```

API runs at http://localhost:3333  
Docs available at http://localhost:3333/docs

### Start Web App

```bash
cd web && pnpm dev
```

## Scripts

### API

- `pnpm dev` - Start development server
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:seed` - Run seed script

### Web

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
