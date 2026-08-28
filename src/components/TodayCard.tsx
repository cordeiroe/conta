import { useContaStore } from '../store/useContaStore'
import { totalsForMonth } from '../lib/totals'
import { todayKey } from '../lib/dates'
import { formatMoney } from '../lib/totals'
import { longDate } from '../lib/dates'
import type { ActivityType, Entry } from '../types'

const EMPTY_ENTRY: Entry = {
  date: '',
  class: false,
  game: false,
  extras: [],
  updatedAt: '',
}

interface Props {
  onQuickAction: (type: ActivityType) => void
  onOpenEntry: (dateKey: string) => void
}

export function TodayCard({ onQuickAction, onOpenEntry }: Props) {
  const today = todayKey()
  const entry = useContaStore((s) => s.entries[today]) ?? EMPTY_ENTRY
  const config = useContaStore((s) => s.config)
  const entries = useContaStore((s) => s.entries)
  const totals = totalsForMonth(entries, config, new Date())
  const hasAny = entry.class || entry.game || entry.extras.length > 0

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">Hoje</div>
          <div className="text-lg font-semibold capitalize">
            {longDate(new Date())}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Total do mês</div>
          <div className="text-xl font-bold text-emerald-400">
            {formatMoney(totals.total, config.currency)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onQuickAction('class')}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all ${
            entry.class
              ? 'bg-emerald-500 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span>🎾</span> {entry.class ? 'Teve aula' : 'Tive aula'}
        </button>
        <button
          type="button"
          onClick={() => onQuickAction('game')}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all ${
            entry.game
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span>🏓</span> {entry.game ? 'Teve jogo' : 'Tive jogo'}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2.5">
        <div className="text-xs text-slate-300">
          {entry.extras.length > 0
            ? `${entry.extras.length} extra${entry.extras.length > 1 ? 's' : ''}`
            : 'Sem extras'}
        </div>
        <button
          type="button"
          onClick={() => onOpenEntry(today)}
          className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-900 hover:bg-slate-100"
        >
          {hasAny ? 'Editar' : 'Adicionar extras'}
        </button>
      </div>
    </div>
  )
}