import { resolveAuth, unauthorizedResponse, corsHeaders } from './auth'
import { handleSync } from './routes/sync'
import { handleEntry } from './routes/entries'
import { handleConfig } from './routes/config'
import { handlePaidMonth } from './routes/paid-months'
import { handleMigrate } from './routes/migrate'
import type { Env } from './auth'

export { Env }

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) })
    }

    const url = new URL(req.url)
    const path = url.pathname

    // Health check
    if (path === '/health') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
      })
    }

    const auth = resolveAuth(req, env)
    if (!auth) return unauthorizedResponse(env)

    // Route matching
    if (path === '/api/sync') {
      return handleSync(req, env, auth.email)
    }
    if (path === '/api/migrate') {
      return handleMigrate(req, env, auth.email)
    }
    if (path === '/api/config') {
      return handleConfig(req, env, auth.email)
    }

    const entryMatch = path.match(/^\/api\/entries\/(.+)$/)
    if (entryMatch) {
      return handleEntry(req, env, auth.email, entryMatch[1])
    }

    const paidMatch = path.match(/^\/api\/paid-months\/(.+)$/)
    if (paidMatch) {
      return handlePaidMonth(req, env, auth.email, paidMatch[1])
    }

    return new Response(JSON.stringify({ error: 'not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
    })
  },
}
