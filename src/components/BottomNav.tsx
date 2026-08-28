import { NavLink } from 'react-router-dom'
import { HomeIcon, ChartIcon, SettingsIcon } from './icons'

const items = [
  { to: '/', label: 'Hoje', icon: HomeIcon, end: true },
  { to: '/consolidated', label: 'Conta', icon: ChartIcon, end: false },
  { to: '/config', label: 'Config', icon: SettingsIcon, end: false },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-slate-700 dark:bg-slate-900/95">
      <ul className="mx-auto flex max-w-md">
        {items.map((it) => (
          <li key={it.to} className="flex-1">
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <it.icon
                    size={22}
                    className={
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }
                  />
                  <span>{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}