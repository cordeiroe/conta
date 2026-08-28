import type { Env } from '../auth'
import { errorResponse, jsonResponse } from '../auth'

interface UpsertConfigBody {
  classPrice: number
  gamePrice: number
  currency: string
  professorName: string
  notificationHourOffset: number
  schedule: unknown[]
  updatedAt: string
}

export async function handleConfig(req: Request, env: Env, email: string): Promise<Response> {
  if (req.method !== 'PUT') {
    return errorResponse('method not allowed', env, 405)
  }
  const body = (await req.json().catch(() => null)) as UpsertConfigBody | null
  if (!body) return errorResponse('invalid JSON body', env)
  const validated = validateConfigBody(body)
  if (!validated) return errorResponse('invalid config body', env)

  await env.DB
    .prepare(
      `INSERT INTO config
         (user_email, class_price, game_price, currency, professor_name, notification_hour_offset, schedule, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_email) DO UPDATE SET
         class_price = excluded.class_price,
         game_price = excluded.game_price,
         currency = excluded.currency,
         professor_name = excluded.professor_name,
         notification_hour_offset = excluded.notification_hour_offset,
         schedule = excluded.schedule,
         updated_at = excluded.updated_at
       WHERE excluded.updated_at > config.updated_at`,
    )
    .bind(
      email,
      validated.classPrice,
      validated.gamePrice,
      validated.currency,
      validated.professorName,
      validated.notificationHourOffset,
      JSON.stringify(validated.schedule),
      validated.updatedAt,
    )
    .run()

  return jsonResponse({ ok: true }, env)
}

function validateConfigBody(body: unknown): UpsertConfigBody | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.classPrice !== 'number') return null
  if (typeof b.gamePrice !== 'number') return null
  if (typeof b.currency !== 'string') return null
  if (typeof b.professorName !== 'string') return null
  if (typeof b.notificationHourOffset !== 'number') return null
  if (!Array.isArray(b.schedule)) return null
  if (typeof b.updatedAt !== 'string') return null
  return b as unknown as UpsertConfigBody
}
