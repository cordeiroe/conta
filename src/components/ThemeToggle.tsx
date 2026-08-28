import { useTheme } from '../hooks/useTheme'
import type { Theme } from '../lib/theme'

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: '☀️ Claro' },
  { value: 'dark', label: '🌙 Escuro' },
  { value: 'system', label: '⚙️ Sistema' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <div
      role="radiogroup"
      aria-label="Tema"
      data-testid="theme-toggle"
      className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={theme === opt.value}
          data-testid={`theme-${opt.value}`}
          onClick={() => setTheme(opt.value)}
          className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
            theme === opt.value
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}