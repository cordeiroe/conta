import type { Env } from './auth'

export interface ConfigRow {
  user_email: string
  class_price: number
  game_price: number
  currency: string
  professor_name: string
  notification_hour_offset: number
  schedule: string
  updated_at: string
}

export interface EntryRow {
  user_email: string
  date: string
  class: number
  class_price: number | null
  game: number
  game_price: number | null
  extras: string
  note: string | null
  updated_at: string
}

export interface PaidMonthRow {
  user_email: string
  month: string
  paid_at: string
}

export async function ensureUser(db: D1Database, email: string, name?: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (email, name) VALUES (?, ?)
       ON CONFLICT(email) DO NOTHING`,
    )
    .bind(email, name ?? null)
    .run()
}

export async function getConfig(db: D1Database, email: string): Promise<ConfigRow | null> {
  return await db
    .prepare('SELECT * FROM config WHERE user_email = ?')
    .bind(email)
    .first<ConfigRow>()
}

export async function getEntries(db: D1Database, email: string): Promise<EntryRow[]> {
  const result = await db
    .prepare('SELECT * FROM entries WHERE user_email = ? ORDER BY date ASC')
    .bind(email)
    .all<EntryRow>()
  return result.results
}

export async function getPaidMonths(db: D1Database, email: string): Promise<PaidMonthRow[]> {
  const result = await db
    .prepare('SELECT * FROM paid_months WHERE user_email = ? ORDER BY month ASC')
    .bind(email)
    .all<PaidMonthRow>()
  return result.results
}
