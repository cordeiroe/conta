import { describe, expect, it } from 'vitest'
import { resolveAuth } from '../src/auth'
import type { Env } from '../src/auth'

const env = (overrides: Partial<Env> = {}): Env => ({
  DB: {} as D1Database,
  ENVIRONMENT: 'production',
  ALLOWED_ORIGIN: 'https://conta.cordeiroe.dev',
  ...overrides,
})

describe('resolveAuth', () => {
  it('returns null in production without JWT', () => {
    const req = new Request('https://api.conta.cordeiroe.dev/api/sync')
    expect(resolveAuth(req, env())).toBeNull()
  })

  it('extracts email from cf-access-jwt-assertion header', () => {
    const payload = base64UrlEncode({ email: 'cordeiroe@gmail.com' })
    const jwt = `header.${payload}.signature`
    const req = new Request('https://api.conta.cordeiroe.dev/api/sync', {
      headers: { 'cf-access-jwt-assertion': jwt },
    })
    const result = resolveAuth(req, env())
    expect(result).toEqual({ email: 'cordeiroe@gmail.com', isDev: false })
  })

  it('extracts email from CF_Authorization cookie', () => {
    const payload = base64UrlEncode({ email: 'cordeiroe@gmail.com' })
    const jwt = `header.${payload}.signature`
    const req = new Request('https://api.conta.cordeiroe.dev/api/sync', {
      headers: { Cookie: `other=value; CF_Authorization=${encodeURIComponent(jwt)}` },
    })
    const result = resolveAuth(req, env())
    expect(result?.email).toBe('cordeiroe@gmail.com')
  })

  it('lowercases the email', () => {
    const payload = base64UrlEncode({ email: 'Test@Example.COM' })
    const jwt = `header.${payload}.signature`
    const req = new Request('https://x', {
      headers: { 'cf-access-jwt-assertion': jwt },
    })
    const result = resolveAuth(req, env())
    expect(result?.email).toBe('test@example.com')
  })

  it('returns null for malformed JWT (not 3 parts)', () => {
    const req = new Request('https://x', {
      headers: { 'cf-access-jwt-assertion': 'bad-token' },
    })
    expect(resolveAuth(req, env())).toBeNull()
  })

  it('returns null for JWT without email claim', () => {
    const payload = base64UrlEncode({ sub: 'no-email-here' })
    const jwt = `header.${payload}.signature`
    const req = new Request('https://x', {
      headers: { 'cf-access-jwt-assertion': jwt },
    })
    expect(resolveAuth(req, env())).toBeNull()
  })

  it('falls back to x-dev-user header in dev mode', () => {
    const req = new Request('https://x', {
      headers: { 'x-dev-user': 'dev@local.test' },
    })
    const result = resolveAuth(req, env({ ENVIRONMENT: 'development' }))
    expect(result).toEqual({ email: 'dev@local.test', isDev: true })
  })

  it('ignores x-dev-user in production', () => {
    const req = new Request('https://x', {
      headers: { 'x-dev-user': 'attacker@evil.test' },
    })
    expect(resolveAuth(req, env())).toBeNull()
  })

  it('prefers JWT over x-dev-user even in dev', () => {
    const payload = base64UrlEncode({ email: 'real@gmail.com' })
    const jwt = `header.${payload}.signature`
    const req = new Request('https://x', {
      headers: {
        'cf-access-jwt-assertion': jwt,
        'x-dev-user': 'fake@local.test',
      },
    })
    const result = resolveAuth(req, env({ ENVIRONMENT: 'development' }))
    expect(result?.email).toBe('real@gmail.com')
  })
})

function base64UrlEncode(obj: unknown): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
