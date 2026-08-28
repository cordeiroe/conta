import { useState } from 'react'
import { useContaStore } from '../store/useContaStore'
import { parseAmount } from '../lib/totals'
import { CloseIcon, PlusIcon, TrashIcon } from '../components/icons'
import { BackupButton } from '../components/BackupButton'
import { RestoreButton } from '../components/RestoreButton'
import type { ActivityType } from '../types'

const daysLabel = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface RuleDraft {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  time: string
  type: ActivityType
}

export function Config() {
  const config = useContaStore((s) => s.config)
  const setConfig = useContaStore((s) => s.setConfig)
  const addScheduleRule = useContaStore((s) => s.addScheduleRule)
  const updateScheduleRule = useContaStore((s) => s.updateScheduleRule)
  const removeScheduleRule = useContaStore((s) => s.removeScheduleRule)
  const clearAll = useContaStore((s) => s.clearAll)

  const [classPrice, setClassPrice] = useState(
    config.classPrice.toFixed(2).replace('.', ','),
  )
  const [gamePrice, setGamePrice] = useState(
    config.gamePrice.toFixed(2).replace('.', ','),
  )

  const [showRuleForm, setShowRuleForm] = useState(false)
  const [draft, setDraft] = useState<RuleDraft>({
    dayOfWeek: 1,
    time: '19:00',
    type: 'class',
  })

  const submitRule = () => {
    addScheduleRule(draft)
    setShowRuleForm(false)
    setDraft({ dayOfWeek: 1, time: '19:00', type: 'class' })
  }

  const onDayChange = (val: string) => {
    const n = Number(val) as 0 | 1 | 2 | 3 | 4 | 5 | 6
    setDraft({ ...draft, dayOfWeek: n })
  }

  return (
    <div
      className="mx-auto w-full max-w-md space-y-6 px-4 pb-24 pt-6"
      style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
    >
      <h1 className="text-xl font-semibold text-slate-900">Configurações</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Preços</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Preço da aula
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={classPrice}
              onChange={(e) => {
                setClassPrice(e.target.value)
                const v = parseAmount(e.target.value)
                if (v > 0) setConfig({ classPrice: v })
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Preço do jogo
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={gamePrice}
              onChange={(e) => {
                setGamePrice(e.target.value)
                const v = parseAmount(e.target.value)
                if (v > 0) setConfig({ gamePrice: v })
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Moeda
            </label>
            <select
              value={config.currency}
              onChange={(e) =>
                setConfig({ currency: e.target.value as 'BRL' | 'EUR' | 'USD' })
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none focus:border-emerald-500"
            >
              <option value="BRL">BRL (R$)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Professor</h2>
        <input
          type="text"
          placeholder="Nome do professor"
          value={config.professorName}
          onChange={(e) => setConfig({ professorName: e.target.value })}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base outline-none focus:border-emerald-500"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Horários (notificações em breve)
          </h2>
          {!showRuleForm && (
            <button
              type="button"
              onClick={() => setShowRuleForm(true)}
              className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white"
            >
              <PlusIcon size={14} /> adicionar
            </button>
          )}
        </div>

        {config.schedule.length === 0 && !showRuleForm && (
          <p className="text-sm text-slate-400">
            Nenhum horário cadastrado. Quando as notificações forem ativadas, o
            app vai te lembrar 1h depois do horário.
          </p>
        )}

        <ul className="space-y-2">
          {config.schedule.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${rule.type === 'class' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {daysLabel[rule.dayOfWeek]} {rule.time}
                  </div>
                  <div className="text-xs text-slate-500">
                    {rule.type === 'class' ? 'Aula' : 'Jogo'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) =>
                      updateScheduleRule(rule.id, { enabled: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeScheduleRule(rule.id)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {showRuleForm && (
          <div className="mt-3 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-emerald-700">
                Novo horário
              </span>
              <button
                type="button"
                onClick={() => setShowRuleForm(false)}
                className="text-slate-400"
              >
                <CloseIcon size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={draft.dayOfWeek}
                onChange={(e) => onDayChange(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
              >
                {daysLabel.map((d, i) => (
                  <option key={i} value={i}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={draft.time}
                onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
              />
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft({ ...draft, type: e.target.value as ActivityType })
                }
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
              >
                <option value="class">Aula</option>
                <option value="game">Jogo</option>
              </select>
            </div>
            <button
              type="button"
              onClick={submitRule}
              className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Adicionar
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Backup</h2>
        <div className="space-y-3">
          <BackupButton />
          <RestoreButton />
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <h2 className="mb-1 text-sm font-semibold text-red-700">Zona de perigo</h2>
        <p className="mb-3 text-xs text-red-600">
          Isso apaga todos os registros. Não dá pra desfazer.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Apagar TODOS os registros?')) clearAll()
          }}
          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          Apagar todos os registros
        </button>
      </section>
    </div>
  )
}