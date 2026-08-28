import { useState } from 'react'
import { useContaStore } from '../store/useContaStore'
import type { Entry, ActivityType } from '../types'
import { CloseIcon, PlusIcon, TrashIcon } from './icons'
import { parseAmount, formatMoney } from '../lib/totals'
import { longDate, fromKey } from '../lib/dates'
import { EXTRA_CATEGORIES } from '../types'

const EMPTY_ENTRY: Entry = {
  date: '',
  class: false,
  game: false,
  extras: [],
  updatedAt: '',
}

interface Props {
  dateKey: string
  onClose: () => void
}

const PriceField = ({
  label,
  type,
  dateKey,
  entry,
}: {
  label: string
  type: ActivityType
  dateKey: string
  entry: Entry
}) => {
  const config = useContaStore((s) => s.config)
  const setActivityPrice = useContaStore((s) => s.setActivityPrice)
  const defaultPrice = type === 'class' ? config.classPrice : config.gamePrice
  const priceKey = type === 'class' ? 'classPrice' : 'gamePrice'
  const current = entry[priceKey] ?? defaultPrice
  const formatted = current.toFixed(2).replace('.', ',')
  const [raw, setRaw] = useState(formatted)
  const [focused, setFocused] = useState(false)

  if (!focused && raw !== formatted) {
    setRaw(formatted)
  }

  const isCustom = entry[priceKey] !== undefined

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
          <input
            type="text"
            inputMode="decimal"
            value={raw}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => {
              setRaw(e.target.value)
              const parsed = parseAmount(e.target.value)
              if (parsed !== current) {
                setActivityPrice(dateKey, type, parsed || defaultPrice)
              }
            }}
            className="w-full bg-transparent text-base font-semibold text-slate-900 dark:text-slate-100 outline-none"
          />
        </div>
        {isCustom && (
          <button
            type="button"
            onClick={() => setActivityPrice(dateKey, type, undefined)}
            className="text-xs font-medium text-slate-400 underline"
          >
            usar padrão
          </button>
        )}
      </div>
    </div>
  )
}

export function EntrySheet({ dateKey, onClose }: Props) {
  const entry = useContaStore((s) => s.entries[dateKey]) ?? EMPTY_ENTRY
  const toggleActivity = useContaStore((s) => s.toggleActivity)
  const addExtra = useContaStore((s) => s.addExtra)
  const removeExtra = useContaStore((s) => s.removeExtra)
  const clearEntry = useContaStore((s) => s.clearEntry)
  const config = useContaStore((s) => s.config)
  const date = fromKey(dateKey)
  const isToday = new Date().toDateString() === date.toDateString()

  const [extraLabel, setExtraLabel] = useState('')
  const [extraCategory, setExtraCategory] = useState<string>('')
  const [extraAmount, setExtraAmount] = useState('')

  const submitExtra = () => {
    const label = extraLabel.trim()
    const amount = parseAmount(extraAmount)
    if (!label || amount <= 0) return
    const category =
      extraCategory && extraCategory !== 'outro' ? extraCategory : undefined
    addExtra(dateKey, label, amount, category)
    setExtraLabel('')
    setExtraAmount('')
    setExtraCategory('')
  }

  const hasAny = entry.class || entry.game || entry.extras.length > 0

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl dark:bg-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 rounded-t-3xl dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500 dark:text-slate-400">
              {isToday ? 'Hoje' : 'Editar'}
            </div>
            <div className="text-lg font-semibold capitalize text-slate-900 dark:text-slate-100 dark:text-slate-100">
              {longDate(date)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fechar"
          >
            <CloseIcon size={20} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleActivity(dateKey, 'class')}
              className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                entry.class
                  ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
              }`}
            >
              <span className="text-2xl">🎾</span>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Aula</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatMoney(
                    entry.classPrice ?? config.classPrice,
                    config.currency,
                  )}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => toggleActivity(dateKey, 'game')}
              className={`flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                entry.game
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
              }`}
            >
              <span className="text-2xl">🏓</span>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">Jogo</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatMoney(
                    entry.gamePrice ?? config.gamePrice,
                    config.currency,
                  )}
                </div>
              </div>
            </button>
          </div>

          {(entry.class || entry.game) && (
            <div className="grid grid-cols-2 gap-2">
              {entry.class && (
                <PriceField
                  label="Preço aula"
                  type="class"
                  dateKey={dateKey}
                  entry={entry}
                />
              )}
              {entry.game && (
                <PriceField
                  label="Preço jogo"
                  type="game"
                  dateKey={dateKey}
                  entry={entry}
                />
              )}
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Extras</h3>
              {entry.extras.length > 0 && (
                <span className="text-xs text-slate-400">
                  {entry.extras.length}{' '}
                  {entry.extras.length === 1 ? 'item' : 'itens'}
                </span>
              )}
            </div>

            {entry.extras.length > 0 && (
              <ul className="mb-3 divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                {entry.extras.map((ex) => (
                  <li
                    key={ex.id}
                    className="flex items-center justify-between px-3 py-2.5"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-slate-900 dark:text-slate-100">{ex.label}</div>
                      <div className="text-xs text-slate-400">
                        {formatMoney(ex.amount, config.currency)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExtra(dateKey, ex.id)}
                      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                      aria-label="Remover"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <select
                data-testid="extra-category"
                value={extraCategory}
                onChange={(e) => setExtraCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Categoria...</option>
                {EXTRA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="O quê? (ex: grip)"
                value={extraLabel}
                onChange={(e) => setExtraLabel(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitExtra()
                }}
                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={submitExtra}
                className="flex items-center justify-center rounded-lg bg-slate-900 px-3 text-white hover:bg-slate-800"
                aria-label="Adicionar extra"
              >
                <PlusIcon size={18} />
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Nota</h3>
            <textarea
              data-testid="note-input"
              value={entry.note ?? ''}
              onChange={(e) =>
                useContaStore.getState().setNote(dateKey, e.target.value)
              }
              placeholder="Algo pra lembrar desse dia?"
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {hasAny && (
            <button
              type="button"
              onClick={() => {
                clearEntry(dateKey)
                onClose()
              }}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800"
            >
              Limpar este dia
            </button>
          )}
        </div>
      </div>
    </div>
  )
}