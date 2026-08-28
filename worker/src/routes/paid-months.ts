import type { Env } from '../auth'
import { errorResponse, jsonResponse } from '../auth'

export async function handlePaidMonth(
  req: Request,
  env: Env,
  email: string,
  month: string,
): Promise<Response> {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return errorResponse('invalid month format, expected YYYY-MM', env)
  }

  switch (req.method) {
    case 'PUT':
    case 'POST': {
      const paidAt = new Date().toISOString()
      await env.DB
        .prepare(
          `INSERT INTO paid_months (user_email, month, paid_at)
           VALUES (?, ?, ?)
           ON CONFLICT(user_email, month) DO UPDATE SET paid_at = excluded.paid_at`,
        )
        .bind(email, month, paidAt)
        .run()
      return jsonResponse({ ok: true, month, paidAt }, env)
    }
    case 'DELETE': {
      await env.DB
        .prepare('DELETE FROM paid_months WHERE user_email = ? AND month = ?')
        .bind(email, month)
        .run()
      return jsonResponse({ ok: true, month }, env)
    }
    default:
      return errorResponse('method not allowed', env, 405)
  }
}
