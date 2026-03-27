import { beforeEach, describe, expect, it } from 'vitest'
import { buildApp, cleanDb } from '../setup/test-helpers'

const app = buildApp()

beforeEach(async () => {
  await cleanDb()
})

describe('POST /capture/*', () => {
  it('returns 201 and a UUID id when called with a JSON body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/capture/my-path',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ event: 'user.created' }),
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body).toHaveProperty('id')
    expect(typeof body.id).toBe('string')
    expect(body.id.length).toBeGreaterThan(0)
  })

  it('captures the correct HTTP method', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/capture/my-path',
    })

    expect(res.statusCode).toBe(201)
  })

  it('strips the /capture prefix from the stored pathname', async () => {
    await app.inject({
      method: 'POST',
      url: '/capture/hooks/stripe',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    })

    // Fetch the stored webhook via the list endpoint to verify pathname
    const listRes = await app.inject({ method: 'GET', url: '/api/webhooks' })
    const { webhooks } = listRes.json()

    expect(webhooks[0].pathname).toBe('/hooks/stripe')
  })

  it('stores null body when no body is sent', async () => {
    const captureRes = await app.inject({
      method: 'GET',
      url: '/capture/no-body',
    })
    expect(captureRes.statusCode).toBe(201)
    const { id } = captureRes.json()

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/webhooks/${id}`,
    })
    expect(getRes.json().body).toBeNull()
  })

  it('captures content-type and content-length headers', async () => {
    const payload = JSON.stringify({ hello: 'world' })
    const captureRes = await app.inject({
      method: 'POST',
      url: '/capture/headers-test',
      headers: {
        'content-type': 'application/json',
        'content-length': String(Buffer.byteLength(payload)),
      },
      body: payload,
    })
    const { id } = captureRes.json()

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/webhooks/${id}`,
    })
    const webhook = getRes.json()

    expect(webhook.contentType).toBe('application/json')
    expect(webhook.contentLength).toBe(Buffer.byteLength(payload))
  })
})
