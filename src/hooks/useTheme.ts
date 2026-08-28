import { useEffect, useState } from 'react'
import {
  type Theme,
  type ResolvedTheme,
  resolveTheme,
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  systemPrefersDark,
} from '../lib/theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme(theme, systemPrefersDark()),
  )

  useEffect(() => {
    const update = () => {
      const next = resolveTheme(theme, systemPrefersDark())
      setResolved(next)
      applyTheme(next)
    }
    update()

    if (theme === 'system' && typeof window !== 'undefined') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => update()
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = (next: Theme) => {
    setStoredTheme(next)
    setThemeState(next)
  }

  return { theme, setTheme, resolved }
}