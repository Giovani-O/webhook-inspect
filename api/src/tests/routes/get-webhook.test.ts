import { uuidv7 } from 'uuidv7'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildApp, cleanDb, insertWebhook } from '../setup/test-helpers'

const app = buildApp()

beforeEach(async () => {
  await cleanDb()
})

describe('GET /api/webhooks/:id', () => {
  it('returns 200 and the full webhook for a known ID', async () => {
    const webhook = await insertWebhook({
      method: 'POST',
      pathname: '/stripe',
      body: '{"event":"charge.succeeded"}',
    })

    const res = await app.inject({
      method: 'GET',
      url: `/api/webhooks/${webhook.id}`,
    })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.id).toBe(webhook.id)
    expect(body.method).toBe('POST')
    expect(body.pathname).toBe('/stripe')
    expect(body.body).toBe('{"event":"charge.succeeded"}')
  })

  it('returns 404 for a valid UUID that does not exist', async () => {
    const nonExistentId = uuidv7()

    const res = await app.inject({
      method: 'GET',
      url: `/api/webhooks/${nonExistentId}`,
    })

    expect(res.statusCode).toBe(404)
    expect(res.json().message).toBe('Webhook not found')
  })

  it('returns 400 for an invalid UUID format', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/webhooks/not-a-valid-uuid',
    })

    expect(res.statusCode).toBe(400)
  })
})
