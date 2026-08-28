import { describe, expect, it } from 'vitest'
import worker, { type Env } from '../src/index'

class FakeD1 {
  prepare(_query: string) {
    return {
      bind: (..._params: unknown[]) => ({
        async run() {
          return { success: true, meta: { last_row_id: 0 } }
        },
        async first() {
          return null
        },
        async all() {
          return { results: [] }
        },
      }),
    }
  }
  async batch() {
    return []
  }
}

function makeEnv(): Env {
  return {
    DB: new FakeD1() as unknown as D1Database,
    ENVIRONMENT: 'development',
    ALLOWED_ORIGIN: 'http://localhost:5173',
  }
}

function call(
  path: string,
  init: RequestInit = {},
  email = 'test@local',
) {
  const headers = new Headers(init.headers ?? {})
  headers.set('x-dev-user', email)
  return worker.fetch(
    new Request(`https://x${path}`, { ...init, headers }),
    makeEnv(),
  )
}

describe('Worker routing & validation', () => {
  it('responds to /health without auth', async () => {
    const env = makeEnv()
    const res = await worker.fetch(new Request('https://x/health'), env)
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean }
    expect(body.ok).toBe(true)
  })

  it('returns CORS preflight on OPTIONS', async () => {
    const res = await worker.fetch(
      new Request('https://x/api/sync', { method: 'OPTIONS' }),
      makeEnv(),
    )
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'http://localhost:5173',
    )
  })

  it('returns 401 without auth header in production', async () => {
    const env: Env = { ...makeEnv(), ENVIRONMENT: 'production' }
    const res = await worker.fetch(new Request('https://x/api/sync'), env)
    expect(res.status).toBe(401)
  })

  it('returns 401 in production even with x-dev-user', async () => {
    const env: Env = { ...makeEnv(), ENVIRONMENT: 'production' }
    const req = new Request('https://x/api/sync', {
      headers: { 'x-dev-user': 'attacker@evil.test' },
    })
    const res = await worker.fetch(req, env)
    expect(res.status).toBe(401)
  })

  it('returns 404 for unknown routes', async () => {
    const res = await call('/api/unknown')
    expect(res.status).toBe(404)
  })

  it('rejects entry PUT with invalid date format', async () => {
    const res = await call('/api/entries/not-a-date', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class: true, game: false, extras: [], updatedAt: 'x' }),
    })
    expect(res.status).toBe(400)
  })

  it('rejects entry PUT with malformed body', async () => {
    const res = await call('/api/entries/2026-08-28', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class: 'yes' }),
    })
    expect(res.status).toBe(400)
  })

  it('rejects paid-month with invalid format', async () => {
    const res = await call('/api/paid-months/2026', { method: 'PUT' })
    expect(res.status).toBe(400)
  })

  it('rejects method not allowed on sync', async () => {
    const res = await call('/api/sync', { method: 'POST' })
    expect(res.status).toBe(405)
  })
})
