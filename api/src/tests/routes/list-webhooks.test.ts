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
    const body = res.json()
    expect(body.webhooks).toEqual([])
    expect(body.nextCursor).toBeNull()
  })

  it('returns webhooks in descending order (newest first)', async () => {
    const a = await insertWebhook({ pathname: '/a' })
    const b = await insertWebhook({ pathname: '/b' })
    const c = await insertWebhook({ pathname: '/c' })

    const res = await app.inject({ method: 'GET', url: '/api/webhooks' })
    const { webhooks } = res.json()

    expect(webhooks[0].id).toBe(c.id)
    expect(webhooks[1].id).toBe(b.id)
    expect(webhooks[2].id).toBe(a.id)
  })

  it('respects the limit query param and returns nextCursor when more pages exist', async () => {
    await insertWebhook({ pathname: '/a' })
    await insertWebhook({ pathname: '/b' })
    await insertWebhook({ pathname: '/c' })

    const res = await app.inject({
      method: 'GET',
      url: '/api/webhooks?limit=2',
    })
    const body = res.json()

    expect(body.webhooks).toHaveLength(2)
    expect(body.nextCursor).not.toBeNull()
  })

  it('returns nextCursor as null when all results fit on one page', async () => {
    await insertWebhook({ pathname: '/a' })
    await insertWebhook({ pathname: '/b' })

    const res = await app.inject({
      method: 'GET',
      url: '/api/webhooks?limit=10',
    })
    const body = res.json()

    expect(body.webhooks).toHaveLength(2)
    expect(body.nextCursor).toBeNull()
  })

  it('uses cursor to return the next page', async () => {
    const a = await insertWebhook({ pathname: '/a' })
    const b = await insertWebhook({ pathname: '/b' })
    const c = await insertWebhook({ pathname: '/c' })

    const page1 = await app.inject({
      method: 'GET',
      url: '/api/webhooks?limit=2',
    })
    const body1 = page1.json()

    expect(body1.nextCursor).toBe(b.id)
    expect(body1.webhooks).toHaveLength(2)
    expect(body1.webhooks[0].id).toBe(c.id)

    const page2 = await app.inject({
      method: 'GET',
      url: `/api/webhooks?limit=2&cursor=${body1.nextCursor}`,
    })
    const body2 = page2.json()

    expect(body2.webhooks).toHaveLength(1)
    expect(body2.webhooks[0].id).toBe(a.id)
    expect(body2.nextCursor).toBeNull()
  })

  it('returns 400 for limit=0', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/webhooks?limit=0',
    })
    expect(res.statusCode).toBe(400)
  })

  it('returns 400 for limit=200 (exceeds max of 100)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/webhooks?limit=200',
    })
    expect(res.statusCode).toBe(400)
  })
})
