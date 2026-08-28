import { describe, expect, it, beforeEach } from 'vitest'
import worker, { type Env } from '../src/index'

/**
 * In-memory D1 implementation for integration tests. Supports the
 * subset of D1 operations our worker uses.
 */
class InMemoryD1 {
  tables: Map<string, Map<string, any>> = new Map()

  private table(name: string): Map<string, any> {
    if (!this.tables.has(name)) this.tables.set(name, new Map())
    return this.tables.get(name)!
  }

  prepare(query: string) {
    const q = query.replace(/\s+/g, ' ').trim().toLowerCase()
    const db = this // capture for closures
    const stmt = {
      bind: (...params: unknown[]) => {
        const bound = {
          async run() {
            // INSERT INTO users
            if (q.startsWith('insert into users')) {
              const email = params[0] as string
              const name = params[1] as string | null
              const existing = db.table('users').get(email)
              if (!existing) {
                db.table('users').set(email, {
                  email,
                  name,
                  created_at: new Date().toISOString(),
                })
              }
              return { success: true, meta: { last_row_id: 0 } }
            }
            // UPSERT entries
            if (q.startsWith('insert into entries') && q.includes('on conflict')) {
              const [
                user_email, date, klass, class_price, game, game_price,
                extras, note, updated_at,
              ] = params as string[]
              const table = db.table('entries')
              const key = `${user_email}:${date}`
              const existing = table.get(key)
              if (existing && existing.updated_at >= (updated_at as string)) {
                return { success: true, meta: { last_row_id: 0 } }
              }
              table.set(key, {
                user_email,
                date,
                class: klass,
                class_price,
                game,
                game_price,
                extras,
                note,
                updated_at,
              })
              return { success: true, meta: { last_row_id: 0 } }
            }
            // DELETE entries
            if (q.startsWith('delete from entries')) {
              db.table('entries').delete(`${params[0]}:${params[1]}`)
              return { success: true, meta: { last_row_id: 0 } }
            }
            // UPSERT config
            if (q.startsWith('insert into config') && q.includes('on conflict')) {
              const [
                user_email, class_price, game_price, currency, professor_name,
                notification_hour_offset, schedule, updated_at,
              ] = params as string[]
              const table = db.table('config')
              const existing = table.get(user_email as string)
              if (existing && existing.updated_at >= (updated_at as string)) {
                return { success: true, meta: { last_row_id: 0 } }
              }
              table.set(user_email as string, {
                user_email,
                class_price,
                game_price,
                currency,
                professor_name,
                notification_hour_offset,
                schedule,
                updated_at,
              })
              return { success: true, meta: { last_row_id: 0 } }
            }
            // UPSERT paid_months (with always-update)
            if (q.startsWith('insert into paid_months')) {
              const [user_email, month, paid_at] = params as string[]
              db.table('paid_months').set(`${user_email}:${month}`, {
                user_email,
                month,
                paid_at,
              })
              return { success: true, meta: { last_row_id: 0 } }
            }
            // DELETE paid_months
            if (q.startsWith('delete from paid_months')) {
              db.table('paid_months').delete(`${params[0]}:${params[1]}`)
              return { success: true, meta: { last_row_id: 0 } }
            }
            throw new Error(`Unhandled SQL: ${q.slice(0, 120)}`)
          },
          async first<T = unknown>() {
            if (q.startsWith('select * from config where user_email')) {
              const row = db.table('config').get(params[0] as string)
              return (row ?? null) as T | null
            }
            return null as T | null
          },
          async all<T = unknown>() {
            if (
              q.startsWith('select * from entries where user_email') &&
              q.includes('order by date')
            ) {
              const rows = [...db.table('entries').values()].filter(
                (r) => r.user_email === params[0],
              )
              rows.sort((a, b) => a.date.localeCompare(b.date))
              return { results: rows as T[] }
            }
            if (
              q.startsWith('select * from paid_months where user_email') &&
              q.includes('order by month')
            ) {
              const rows = [...db.table('paid_months').values()].filter(
                (r) => r.user_email === params[0],
              )
              rows.sort((a, b) => a.month.localeCompare(b.month))
              return { results: rows as T[] }
            }
            return { results: [] as T[] }
          },
        }
        return bound
      },
    }
    return stmt
  }

  async batch(statements: Array<{ run: () => Promise<unknown> }>) {
    for (const stmt of statements) {
      await stmt.run()
    }
    return []
  }
}

let d1: InMemoryD1
let env: Env

function setupEnv(): Env {
  d1 = new InMemoryD1()
  env = {
    DB: d1 as unknown as D1Database,
    ENVIRONMENT: 'development',
    ALLOWED_ORIGIN: 'http://localhost:5173',
  }
  return env
}

function call(
  path: string,
  init: RequestInit = {},
  email = 'test@local',
) {
  const headers = new Headers(init.headers ?? {})
  headers.set('x-dev-user', email)
  return worker.fetch(new Request(`https://x${path}`, { ...init, headers }), env)
}

beforeEach(() => {
  setupEnv()
})

describe('Worker API (integration with in-memory D1)', () => {
  it('persists and retrieves a single entry', async () => {
    const email = 'a@local'
    await call(
      '/api/entries/2026-08-28',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: true,
          classPrice: 100,
          game: false,
          gamePrice: null,
          extras: [{ id: '1', label: 'grip', amount: 25 }],
          note: 'bom dia',
          updatedAt: '2026-08-28T12:00:00.000Z',
        }),
      },
      email,
    )

    const res = await call('/api/sync', {}, email)
    const body = (await res.json() as any) as any
    expect(body.entries).toHaveLength(1)
    expect(body.entries[0].date).toBe('2026-08-28')
    expect(body.entries[0].extras).toBe(
      JSON.stringify([{ id: '1', label: 'grip', amount: 25 }]),
    )
  })

  it('isolates data between users', async () => {
    await call(
      '/api/entries/2026-08-28',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class: true, game: false, extras: [], updatedAt: 'x' }),
      },
      'alice@local',
    )

    const res1 = await call('/api/sync', {}, 'alice@local')
    const res2 = await call('/api/sync', {}, 'bob@local')
    const b1 = await res1.json() as any
    const b2 = await res2.json() as any
    expect(b1.entries).toHaveLength(1)
    expect(b2.entries).toHaveLength(0)
  })

  it('last-write-wins on entry update', async () => {
    const email = 'race@local'
    await call(
      '/api/entries/2026-08-28',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: true,
          game: false,
          extras: [],
          updatedAt: '2026-08-28T15:00:00.000Z',
        }),
      },
      email,
    )
    await call(
      '/api/entries/2026-08-28',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class: false,
          game: true,
          extras: [],
          updatedAt: '2026-08-28T10:00:00.000Z',
        }),
      },
      email,
    )
    const res = await call('/api/sync', {}, email)
    const body = await res.json() as any
    expect(body.entries[0].class).toBe(1) // newer wins
  })

  it('PUT /api/config persists', async () => {
    const email = 'cfg@local'
    await call(
      '/api/config',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classPrice: 120,
          gamePrice: 60,
          currency: 'EUR',
          professorName: 'Davi',
          notificationHourOffset: 2,
          schedule: [],
          updatedAt: '2026-08-28T12:00:00.000Z',
        }),
      },
      email,
    )
    const res = await call('/api/sync', {}, email)
    const body = await res.json() as any
    expect(body.config.class_price).toBe(120)
    expect(body.config.currency).toBe('EUR')
  })

  it('DELETE entry removes it', async () => {
    const email = 'del@local'
    await call(
      '/api/entries/2026-08-28',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class: true, game: false, extras: [], updatedAt: 'x' }),
      },
      email,
    )
    await call('/api/entries/2026-08-28', { method: 'DELETE' }, email)
    const res = await call('/api/sync', {}, email)
    const body = await res.json() as any
    expect(body.entries).toEqual([])
  })

  it('PUT/DELETE paid-months works', async () => {
    const email = 'paid@local'
    await call('/api/paid-months/2026-08', { method: 'PUT' }, email)
    const res1 = await call('/api/sync', {}, email)
    const body1 = await res1.json() as any
    expect(body1.paidMonths['2026-08']).toBeDefined()

    await call('/api/paid-months/2026-08', { method: 'DELETE' }, email)
    const res2 = await call('/api/sync', {}, email)
    const body2 = await res2.json() as any
    expect(body2.paidMonths).toEqual({})
  })

  it('POST /api/migrate imports localStorage state', async () => {
    const email = 'mig@local'
    await call(
      '/api/migrate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            classPrice: 100,
            gamePrice: 50,
            currency: 'BRL',
            professorName: 'Test',
            notificationHourOffset: 1,
            schedule: [],
            updatedAt: '2026-08-25T10:00:00.000Z',
          },
          entries: [
            {
              date: '2026-08-20',
              class: true,
              classPrice: 100,
              game: false,
              gamePrice: null,
              extras: [],
              note: null,
              updatedAt: '2026-08-20T12:00:00.000Z',
            },
          ],
          paidMonths: { '2026-07': '2026-07-30T12:00:00.000Z' },
        }),
      },
      email,
    )
    const res = await call('/api/sync', {}, email)
    const body = await res.json() as any
    expect(body.entries).toHaveLength(1)
    expect(body.config.currency).toBe('BRL')
    expect(body.paidMonths['2026-07']).toBeDefined()
  })
})
