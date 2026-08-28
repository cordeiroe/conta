import { useContaStore } from '../store/useContaStore'
import { buildMonthGrid, dayKey, isInMonth, isToday, shiftMonth } from '../lib/dates'
import { dayOfWeekShort, monthLabel } from '../lib/dates'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

interface Props {
  anchor: Date
  onChangeAnchor: (date: Date) => void
  onSelectDay: (dateKey: string) => void
}

export function MonthGrid({ anchor, onChangeAnchor, onSelectDay }: Props) {
  const entries = useContaStore((s) => s.entries)
  const days = buildMonthGrid(anchor)

  const goPrev = () => onChangeAnchor(shiftMonth(anchor, -1))
  const goNext = () => onChangeAnchor(shiftMonth(anchor, 1))

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Mês anterior"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h2 className="text-base font-semibold capitalize text-slate-900">
          {monthLabel(anchor)}
        </h2>
        <button
          type="button"
          onClick={goNext}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Próximo mês"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {dayOfWeekShort.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div data-testid="month-grid" className="animate-month-fade grid grid-cols-7 gap-1">
        {days.map((day) => {
          const k = dayKey(day)
          const e = entries[k]
          const inMonth = isInMonth(day, anchor)
          const today = isToday(day)
          const hasClass = e?.class
          const hasGame = e?.game
          const hasExtras = (e?.extras.length ?? 0) > 0
          const hasAny = hasClass || hasGame || hasExtras

          return (
            <button
              key={k}
              type="button"
              onClick={() => onSelectDay(k)}
              disabled={!inMonth}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all ${
                !inMonth
                  ? 'text-slate-300 dark:text-slate-600'
                  : today
                    ? 'bg-slate-900 font-semibold text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span>{day.getDate()}</span>
              {inMonth && hasAny && (
                <span
                  className={`absolute bottom-1 flex gap-0.5 ${today ? 'opacity-90' : ''}`}
                >
                  {hasClass && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                  {hasGame && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                  {!hasClass && !hasGame && hasExtras && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> aula
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> jogo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> extras
        </span>
      </div>
    </div>
  )
}