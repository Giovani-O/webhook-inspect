import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp, cleanDb, insertWebhook } from '../setup/test-helpers'

// Mock da geração de texto
vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({ text: 'const handler = () => {}' }),
}))

// Import AFTER vi.mock so the mock is in place when the module loads
const { generateText } = await import('ai')

const app = buildApp()

beforeEach(async () => {
  await cleanDb()
  vi.clearAllMocks()
})

describe('POST /api/generate', () => {
  it('returns 201 and the generated code', async () => {
    const webhook = await insertWebhook({ body: '{"event":"order.placed"}' })

    const res = await app.inject({
      method: 'POST',
      url: '/api/generate',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ webhookIds: [webhook.id] }),
    })

    expect(res.statusCode).toBe(201)
    expect(res.json()).toEqual({ code: 'const handler = () => {}' })
  }, 30000)

  it('calls generateText exactly once', async () => {
    const webhook = await insertWebhook({ body: '{"event":"order.placed"}' })

    await app.inject({
      method: 'POST',
      url: '/api/generate',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ webhookIds: [webhook.id] }),
    })

    expect(generateText).toHaveBeenCalledTimes(1)
  }, 30000)

  it('includes webhook body content in the prompt passed to generateText', async () => {
    const webhook = await insertWebhook({ body: '{"event":"payment.failed"}' })

    await app.inject({
      method: 'POST',
      url: '/api/generate',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ webhookIds: [webhook.id] }),
    })

    const callArgs = vi.mocked(generateText).mock.calls[0][0]
    expect(callArgs.prompt).toContain('{"event":"payment.failed"}')
  }, 3000)
})
