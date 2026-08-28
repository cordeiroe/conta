import type { Env } from '../auth'
import { errorResponse, jsonResponse } from '../auth'
import { ensureUser, getConfig, getEntries } from '../db'

interface MigrateBody {
  config?: {
    classPrice: number
    gamePrice: number
    currency: string
    professorName: string
    notificationHourOffset: number
    schedule: unknown[]
    updatedAt: string
  }
  entries?: Array<{
    date: string
    class: boolean
    classPrice?: number | null
    game: boolean
    gamePrice?: number | null
    extras: unknown[]
    note?: string | null
    updatedAt: string
  }>
  paidMonths?: Record<string, string>
}

/**
 * Idempotent migration endpoint. Used on first authenticated load when
 * the client detects localStorage has data and D1 is empty.
 *
 * Strategy: for each record, last-write-wins by updatedAt.
 */
export async function handleMigrate(req: Request, env: Env, email: string): Promise<Response> {
  if (req.method !== 'POST') {
    return errorResponse('method not allowed', env, 405)
  }
  const body = (await req.json().catch(() => null)) as MigrateBody | null
  if (!body) return errorResponse('invalid JSON body', env)

  await ensureUser(env.DB, email)

  // If user already has data, only overwrite with newer timestamps
  const existing = await getEntries(env.DB, email)
  const existingDates = new Map(existing.map((e) => [e.date, e]))

  const stmts: D1PreparedStatement[] = []

  // Migrate entries
  if (Array.isArray(body.entries)) {
    for (const e of body.entries) {
      if (!e || typeof e.date !== 'string') continue
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) continue
      const prev = existingDates.get(e.date)
      if (prev && prev.updated_at > e.updatedAt) continue
      stmts.push(
        env.DB
          .prepare(
            `INSERT INTO entries (user_email, date, class, class_price, game, game_price, extras, note, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_email, date) DO UPDATE SET
               class = excluded.class, class_price = excluded.class_price,
               game = excluded.game, game_price = excluded.game_price,
               extras = excluded.extras, note = excluded.note,
               updated_at = excluded.updated_at`,
          )
          .bind(
            email,
            e.date,
            e.class ? 1 : 0,
            e.classPrice ?? null,
            e.game ? 1 : 0,
            e.gamePrice ?? null,
            JSON.stringify(e.extras ?? []),
            e.note ?? null,
            e.updatedAt,
          ),
      )
    }
  }

  // Migrate config (only if no existing config)
  if (body.config && typeof body.config === 'object') {
    const existingConfig = await getConfig(env.DB, email)
    if (!existingConfig || existingConfig.updated_at < body.config.updatedAt) {
      stmts.push(
        env.DB
          .prepare(
            `INSERT INTO config (user_email, class_price, game_price, currency, professor_name, notification_hour_offset, schedule, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_email) DO UPDATE SET
               class_price = excluded.class_price, game_price = excluded.game_price,
               currency = excluded.currency, professor_name = excluded.professor_name,
               notification_hour_offset = excluded.notification_hour_offset,
               schedule = excluded.schedule, updated_at = excluded.updated_at`,
          )
          .bind(
            email,
            body.config.classPrice,
            body.config.gamePrice,
            body.config.currency,
            body.config.professorName,
            body.config.notificationHourOffset,
            JSON.stringify(body.config.schedule ?? []),
            body.config.updatedAt,
          ),
      )
    }
  }

  // Migrate paidMonths
  if (body.paidMonths && typeof body.paidMonths === 'object') {
    for (const [month, paidAt] of Object.entries(body.paidMonths)) {
      if (!/^\d{4}-\d{2}$/.test(month)) continue
      if (typeof paidAt !== 'string') continue
      stmts.push(
        env.DB
          .prepare(
            `INSERT INTO paid_months (user_email, month, paid_at)
             VALUES (?, ?, ?)
             ON CONFLICT(user_email, month) DO NOTHING`,
          )
          .bind(email, month, paidAt),
      )
    }
  }

  // Execute all statements in a batch
  if (stmts.length > 0) {
    await env.DB.batch(stmts)
  }

  return jsonResponse({
    ok: true,
    migrated: {
      entries: body.entries?.length ?? 0,
      config: body.config ? 1 : 0,
      paidMonths: body.paidMonths ? Object.keys(body.paidMonths).length : 0,
    },
  }, env)
}
