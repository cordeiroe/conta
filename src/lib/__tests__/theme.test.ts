import { describe, expect, it } from 'vitest'
import {
  resolveTheme,
  applyTheme,
  themeClass,
  type Theme,
  type ResolvedTheme,
} from '../theme'

describe('resolveTheme', () => {
  it('returns light when theme is light', () => {
    expect(resolveTheme('light', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
  })

  it('returns dark when theme is dark', () => {
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('dark', true)).toBe('dark')
  })

  it('follows system preference for system theme', () => {
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('system', true)).toBe('dark')
  })
})

describe('themeClass', () => {
  it('returns "dark" for dark', () => {
    expect(themeClass('dark')).toBe('dark')
  })

  it('returns "" (empty) for light', () => {
    expect(themeClass('light')).toBe('')
  })
})

describe('applyTheme', () => {
  it('sets document.documentElement.className based on theme', () => {
    applyTheme('dark')
    expect(document.documentElement.className).toBe('dark')

    applyTheme('light')
    expect(document.documentElement.className).toBe('')
  })

  it('does not throw when document is unavailable', () => {
    const originalDocument = globalThis.document
    delete (globalThis as { document?: unknown }).document
    expect(() => applyTheme('dark')).not.toThrow()
    globalThis.document = originalDocument
  })
})

describe('integration: full round-trip', () => {
  it('theme → resolve → apply produces consistent className', () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    for (const t of themes) {
      const resolved = resolveTheme(t, false)
      const cls = themeClass(resolved)
      applyTheme(resolved)
      expect(document.documentElement.className).toBe(cls)
    }
  })
})

describe('ResolvedTheme type narrowing', () => {
  it('is "light" | "dark"', () => {
    const t: ResolvedTheme = 'light'
    expect(['light', 'dark']).toContain(t)
  })
})