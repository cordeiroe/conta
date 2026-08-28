import { useContaStore } from '../store/useContaStore'
import { weeklyTotals } from '../lib/weekly'
import { formatMoney } from '../lib/totals'
import { startOfWeek, endOfWeek, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function WeeklyCard() {
  const entries = useContaStore((s) => s.entries)
  const config = useContaStore((s) => s.config)
  const totals = weeklyTotals(entries, config, new Date())

  const start = startOfWeek(new Date(), { weekStartsOn: 0 })
  const end = endOfWeek(new Date(), { weekStartsOn: 0 })
  const rangeLabel = `${format(start, "d 'de' MMM", { locale: ptBR })} – ${format(end, "d 'de' MMM", { locale: ptBR })}`

  const hasAny = totals.total > 0

  return (
    <div
      data-testid="weekly-card"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Essa semana
          </div>
          <div className="text-sm capitalize text-slate-700 dark:text-slate-300">
            {rangeLabel}
          </div>
        </div>
        <div
          data-testid="weekly-total"
          className={`text-lg font-bold ${
            hasAny
              ? 'text-slate-900 dark:text-slate-100'
              : 'text-slate-300 dark:text-slate-600'
          }`}
        >
          {formatMoney(totals.total, config.currency)}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 px-2 py-2">
          <div className="text-xs text-emerald-700">Aulas</div>
          <div
            data-testid="weekly-classes"
            className="text-lg font-bold text-emerald-700"
          >
            {totals.classesCount}
          </div>
        </div>
        <div className="rounded-lg bg-blue-50 px-2 py-2">
          <div className="text-xs text-blue-700">Jogos</div>
          <div
            data-testid="weekly-games"
            className="text-lg font-bold text-blue-700"
          >
            {totals.gamesCount}
          </div>
        </div>
        <div className="rounded-lg bg-amber-50 px-2 py-2">
          <div className="text-xs text-amber-700">Extras</div>
          <div
            data-testid="weekly-extras"
            className="text-lg font-bold text-amber-700"
          >
            {formatMoney(totals.extrasAmount, config.currency)}
          </div>
        </div>
      </div>
    </div>
  )
}