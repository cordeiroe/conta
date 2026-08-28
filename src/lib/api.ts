import type { Config, Entry } from '../types'

const WORKER_URL =
  import.meta.env.VITE_WORKER_URL ?? 'https://conta-worker.conta-worker.workers.dev'

const DEV_USER = import.meta.env.VITE_DEV_USER ?? ''

const isDev = import.meta.env.DEV

export interface SyncResponse {
  config: (Config & { updated_at: string }) | null
  entries: Array<{
    user_email: string
    date: string
    class: number
    class_price: number | null
    game: number
    game_price: number | null
    extras: string
    note: string | null
    updated_at: string
  }>
  paidMonths: Record<string, string>
}

interface ServerEntry {
  class: boolean
  classPrice?: number | null
  game: boolean
  gamePrice?: number | null
  extras: unknown[]
  note?: string | null
  updatedAt: string
}

function fetchOptions(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers ?? {})
  headers.set('Content-Type', 'application/json')
  if (isDev && DEV_USER) {
    headers.set('x-dev-user', DEV_USER)
  }
  return { ...init, headers, credentials: 'include' }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${WORKER_URL}${path}`, fetchOptions(init))
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text || res.statusText)
  }
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(`API ${status}: ${body}`)
    this.status = status
    this.body = body
  }
}

export const api = {
  async sync(): Promise<SyncResponse> {
    return request<SyncResponse>('/api/sync')
  },

  async upsertEntry(date: string, entry: ServerEntry): Promise<void> {
    await request(`/api/entries/${date}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    })
  },

  async deleteEntry(date: string): Promise<void> {
    await request(`/api/entries/${date}`, { method: 'DELETE' })
  },

  async upsertConfig(
    config: Config & { updatedAt: string },
  ): Promise<void> {
    await request('/api/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  },

  async markPaid(month: string): Promise<void> {
    await request(`/api/paid-months/${month}`, { method: 'PUT' })
  },

  async unmarkPaid(month: string): Promise<void> {
    await request(`/api/paid-months/${month}`, { method: 'DELETE' })
  },

  async migrate(payload: {
    config?: Config & { updatedAt: string }
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
  }): Promise<{ ok: boolean; migrated: { entries: number; config: number; paidMonths: number } }> {
    return request('/api/migrate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export function serverEntryToEntry(
  date: string,
  server: {
    class: number
    class_price: number | null
    game: number
    game_price: number | null
    extras: string
    note: string | null
  },
): Entry {
  return {
    date,
    class: server.class === 1,
    classPrice: server.class_price ?? undefined,
    game: server.game === 1,
    gamePrice: server.game_price ?? undefined,
    extras: JSON.parse(server.extras) as Entry['extras'],
    note: server.note ?? undefined,
    updatedAt: new Date().toISOString(),
  }
}

export function entryToServerPayload(entry: Entry): ServerEntry {
  return {
    class: entry.class,
    classPrice: entry.classPrice ?? null,
    game: entry.game,
    gamePrice: entry.gamePrice ?? null,
    extras: entry.extras,
    note: entry.note ?? null,
    updatedAt: entry.updatedAt,
  }
}
