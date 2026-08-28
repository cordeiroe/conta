import type { Env } from '../auth'
import { errorResponse, jsonResponse } from '../auth'

interface UpsertEntryBody {
  class: boolean
  classPrice?: number | null
  game: boolean
  gamePrice?: number | null
  extras: unknown[]
  note?: string | null
  updatedAt: string
}

export async function handleEntry(
  req: Request,
  env: Env,
  email: string,
  date: string,
): Promise<Response> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return errorResponse('invalid date format, expected YYYY-MM-DD', env)
  }

  switch (req.method) {
    case 'PUT': {
      const body = (await req.json().catch(() => null)) as UpsertEntryBody | null
      if (!body) return errorResponse('invalid JSON body', env)
      const validated = validateUpsertBody(body)
      if (!validated) return errorResponse('invalid entry body', env)

      await env.DB
        .prepare(
          `INSERT INTO entries (user_email, date, class, class_price, game, game_price, extras, note, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_email, date) DO UPDATE SET
             class = excluded.class,
             class_price = excluded.class_price,
             game = excluded.game,
             game_price = excluded.game_price,
             extras = excluded.extras,
             note = excluded.note,
             updated_at = excluded.updated_at
           WHERE excluded.updated_at > entries.updated_at`,
        )
        .bind(
          email,
          date,
          validated.class ? 1 : 0,
          validated.classPrice,
          validated.game ? 1 : 0,
          validated.gamePrice,
          JSON.stringify(validated.extras),
          validated.note,
          validated.updatedAt,
        )
        .run()

      return jsonResponse({ ok: true, date }, env)
    }
    case 'DELETE': {
      await env.DB
        .prepare('DELETE FROM entries WHERE user_email = ? AND date = ?')
        .bind(email, date)
        .run()
      return jsonResponse({ ok: true, date }, env)
    }
    default:
      return errorResponse('method not allowed', env, 405)
  }
}

function validateUpsertBody(
  body: unknown,
): (UpsertEntryBody & { classPrice: number | null; gamePrice: number | null }) | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.class !== 'boolean') return null
  if (typeof b.game !== 'boolean') return null
  if (!Array.isArray(b.extras)) return null
  if (typeof b.updatedAt !== 'string') return null

  return {
    class: b.class,
    classPrice: typeof b.classPrice === 'number' ? b.classPrice : null,
    game: b.game,
    gamePrice: typeof b.gamePrice === 'number' ? b.gamePrice : null,
    extras: b.extras,
    note: typeof b.note === 'string' ? b.note : null,
    updatedAt: b.updatedAt,
  }
}
