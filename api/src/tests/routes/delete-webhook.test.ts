import { uuidv7 } from 'uuidv7'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildApp, cleanDb, insertWebhook } from '../setup/test-helpers'

const app = buildApp()

beforeEach(async () => {
  await cleanDb()
})

describe('DELETE /api/webhooks/:id', () => {
  it('returns 204 and deletes the webhook', async () => {
    const webhook = await insertWebhook()

    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/webhooks/${webhook.id}`,
    })
    expect(deleteRes.statusCode).toBe(204)

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/webhooks/${webhook.id}`,
    })
    expect(getRes.statusCode).toBe(404)
  })

  it('returns 404 when the webhook does not exist', async () => {
    const nonExistentId = uuidv7()

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/webhooks/${nonExistentId}`,
    })

    expect(res.statusCode).toBe(404)
    expect(res.json().message).toBe('Webhook not found')
  })

  it('returns 400 for an invalid UUID format', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/webhooks/not-a-valid-uuid',
    })

    expect(res.statusCode).toBe(400)
  })
})
