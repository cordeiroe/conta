import { useMemo, useState } from 'react'
import { useContaStore } from '../store/useContaStore'
import { totalsForMonth } from '../lib/totals'
import { formatMoney } from '../lib/totals'
import { buildWhatsappMessage } from '../lib/whatsapp'
import { monthLabel, fromKey, monthKey, dayLabel } from '../lib/dates'
import { ChevronLeftIcon, ChevronRightIcon, CopyIcon, WhatsappIcon } from '../components/icons'

export function Consolidated() {
  const entries = useContaStore((s) => s.entries)
  const config = useContaStore((s) => s.config)
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const [copied, setCopied] = useState(false)

  const totals = useMemo(
    () => totalsForMonth(entries, config, anchor),
    [entries, config, anchor],
  )

  const message = useMemo(
    () => buildWhatsappMessage(entries, config, anchor),
    [entries, config, anchor],
  )

  const monthEntries = useMemo(() => {
    const target = monthKey(anchor)
    return Object.keys(entries)
      .filter((k) => {
        if (monthKey(fromKey(k)) !== target) return false
        const e = entries[k]
        const subtotal =
          (e.class ? (e.classPrice ?? config.classPrice) : 0) +
          (e.game ? (e.gamePrice ?? config.gamePrice) : 0) +
          e.extras.reduce((s, ex) => s + ex.amount, 0)
        return subtotal > 0
      })
      .sort()
  }, [entries, anchor, config])

  const shift = (delta: number) => {
    const d = new Date(anchor)
    d.setMonth(d.getMonth() + delta)
    setAnchor(d)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = message
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openWhatsapp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div
      className="mx-auto w-full max-w-md space-y-5 px-4 pb-24 pt-6"
      style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <h1 className="text-lg font-semibold capitalize text-slate-900">
          {monthLabel(anchor)}
        </h1>
        <button
          type="button"
          onClick={() => shift(1)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg">
        <div className="text-xs uppercase tracking-wide text-emerald-100">
          Total a pagar
        </div>
        <div className="mt-1 text-4xl font-bold">
          {formatMoney(totals.total, config.currency)}
        </div>
        {(totals.classesCount > 0 || totals.gamesCount > 0) && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {totals.classesCount > 0 && (
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <div className="text-xs text-emerald-100">Aulas</div>
                <div className="font-semibold">
                  {totals.classesCount} ×{' '}
                  {formatMoney(config.classPrice, config.currency)}
                </div>
                <div className="text-xs text-emerald-100">
                  = {formatMoney(totals.classesAmount, config.currency)}
                </div>
              </div>
            )}
            {totals.gamesCount > 0 && (
              <div className="rounded-xl bg-white/10 px-3 py-2">
                <div className="text-xs text-emerald-100">Jogos</div>
                <div className="font-semibold">
                  {totals.gamesCount} ×{' '}
                  {formatMoney(config.gamePrice, config.currency)}
                </div>
                <div className="text-xs text-emerald-100">
                  = {formatMoney(totals.gamesAmount, config.currency)}
                </div>
              </div>
            )}
          </div>
        )}
        {totals.extrasAmount > 0 && (
          <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-sm">
            <div className="text-xs text-emerald-100">Extras</div>
            <div className="font-semibold">
              {formatMoney(totals.extrasAmount, config.currency)}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copy}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          <CopyIcon size={18} />
          {copied ? 'Copiado!' : 'Copiar resumo'}
        </button>
        <button
          type="button"
          onClick={openWhatsapp}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          <WhatsappIcon size={18} />
          WhatsApp
        </button>
      </div>

      <div>
        <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700">
          Detalhamento
        </h2>
        {monthEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
            Nada registrado neste mês.
          </div>
        ) : (
          <ul className="space-y-2">
            {monthEntries.map((k) => {
              const e = entries[k]
              const subtotal =
                (e.class ? (e.classPrice ?? config.classPrice) : 0) +
                (e.game ? (e.gamePrice ?? config.gamePrice) : 0) +
                e.extras.reduce((s, ex) => s + ex.amount, 0)
              return (
                <li
                  key={k}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-semibold capitalize text-slate-900">
                      {dayLabel(k)}
                    </div>
                    <div className="font-mono text-sm font-semibold text-slate-900">
                      {formatMoney(subtotal, config.currency)}
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                    {e.class && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                        aula{' '}
                        {formatMoney(
                          e.classPrice ?? config.classPrice,
                          config.currency,
                        )}
                      </span>
                    )}
                    {e.game && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                        jogo{' '}
                        {formatMoney(
                          e.gamePrice ?? config.gamePrice,
                          config.currency,
                        )}
                      </span>
                    )}
                    {e.extras.map((ex) => (
                      <span
                        key={ex.id}
                        className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700"
                      >
                        {ex.label} {formatMoney(ex.amount, config.currency)}
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}