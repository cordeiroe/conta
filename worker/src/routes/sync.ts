import type { Env } from '../auth'
import { errorResponse, jsonResponse } from '../auth'
import { ensureUser, getConfig, getEntries, getPaidMonths } from '../db'

export async function handleSync(req: Request, env: Env, email: string): Promise<Response> {
  if (req.method !== 'GET') {
    return errorResponse('method not allowed', env, 405)
  }
  await ensureUser(env.DB, email)
  const [config, entries, paidMonthsRows] = await Promise.all([
    getConfig(env.DB, email),
    getEntries(env.DB, email),
    getPaidMonths(env.DB, email),
  ])
  const paidMonths: Record<string, string> = {}
  for (const row of paidMonthsRows) {
    paidMonths[row.month] = row.paid_at
  }
  return jsonResponse({ config, entries, paidMonths }, env)
}
