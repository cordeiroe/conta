export interface Env {
  DB: D1Database
  ENVIRONMENT: 'development' | 'production'
  ALLOWED_ORIGIN: string
}

export interface AuthContext {
  email: string
  isDev: boolean
}

/**
 * Resolves the user email from the request.
 *
 * Production: validates the CF Access JWT (cookie or header) and returns
 * the email claim. (For V2 we'll trust the email claim directly; full
 * signature verification with CF public keys can be added later.)
 *
 * Development: trusts the `x-dev-user` header for local testing.
 */
export function resolveAuth(req: Request, env: Env): AuthContext | null {
  // JWT always takes precedence (real auth)
  const jwt = extractCfAccessJwt(req)
  if (jwt) {
    const email = extractEmailFromJwt(jwt)
    if (email) return { email: email.toLowerCase(), isDev: false }
  }

  // Dev fallback: trust x-dev-user header only in development
  if (env.ENVIRONMENT === 'development') {
    const devUser = req.headers.get('x-dev-user')
    if (devUser) return { email: devUser.trim().toLowerCase(), isDev: true }
  }

  return null
}

function extractCfAccessJwt(req: Request): string | null {
  // Preferred: cf-access-jwt-assertion header (service-to-service)
  const assertion = req.headers.get('cf-access-jwt-assertion')
  if (assertion) return assertion

  // Fallback: CF_Authorization cookie
  const cookie = req.headers.get('Cookie')
  if (!cookie) return null
  const match = cookie.match(/(?:^|;\s*)CF_Authorization=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Lightweight JWT payload parser. Does NOT verify signature — in production
 * we rely on Cloudflare Access to have already validated it before the
 * request reaches the Worker. The email claim is what we trust.
 *
 * TODO (hardening): verify signature against CF public keys via JWKS.
 * For personal-use scale and a single CF Access policy this is acceptable,
 * but should be revisited if the Worker is exposed more broadly.
 */
function extractEmailFromJwt(jwt: string): string | null {
  const parts = jwt.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>
    if (typeof payload.email === 'string') return payload.email
    if (typeof payload.sub === 'string' && payload.sub.includes('@')) {
      return payload.sub
    }
    return null
  } catch {
    return null
  }
}

/** Returns 401 with CORS headers if auth fails. */
export function unauthorizedResponse(env: Env): Response {
  return new Response(
    JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
    {
      status: 401,
      headers: corsHeaders(env),
    },
  )
}

export function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-dev-user',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

export function jsonResponse(
  data: unknown,
  env: Env,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
    },
  })
}

export function errorResponse(
  message: string,
  env: Env,
  status = 400,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
    },
  })
}
