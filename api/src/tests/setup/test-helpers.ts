import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { captureWebhook } from '@/routes/capture-webhook'
import { deleteWebhook } from '@/routes/delete-webhook'
import { generateHandler } from '@/routes/generate-handler'
import { getWebhook } from '@/routes/get-webhook'
import { listWebhooks } from '@/routes/list-webhooks'
import { db } from '@/db'
import { webhooks } from '@/db/schema'

// Setup do server de testes
export function buildApp() {
  const app = fastify().withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifyCors, { origin: true })
  app.register(listWebhooks)
  app.register(getWebhook)
  app.register(deleteWebhook)
  app.register(captureWebhook)
  app.register(generateHandler)

  return app
}

// Limpa banco de testes
export async function cleanDb() {
  await db.delete(webhooks)
}

// Insere webhook de teste
export async function insertWebhook(
  overrides: Partial<typeof webhooks.$inferInsert> = {},
) {
  const defaults = {
    method: 'POST',
    pathname: '/test',
    ip: '127.0.0.1',
    headers: { 'content-type': 'application/json' },
  }

  const result = await db
    .insert(webhooks)
    .values({ ...defaults, ...overrides })
    .returning()

  return result[0]
}
