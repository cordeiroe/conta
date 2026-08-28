import { useState } from 'react'
import { useContaStore } from '../store/useContaStore'
import { parseAmount } from '../lib/totals'
import { CloseIcon, PlusIcon, TrashIcon } from '../components/icons'
import { BackupButton } from '../components/BackupButton'
import { RestoreButton } from '../components/RestoreButton'
import { ThemeToggle } from '../components/ThemeToggle'
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

  const sectionClass =
    'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900'
  const sectionTitleClass =
    'mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200'
  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-base text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
  const labelClass =
    'mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400'

  return (
    <div
      className="mx-auto w-full max-w-md space-y-6 px-4 pb-24 pt-6"
      style={{ paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))' }}
    >
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Configurações
      </h1>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Tema</h2>
        <ThemeToggle />
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Preços</h2>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Preço da aula</label>
            <input
              type="text"
              inputMode="decimal"
              value={classPrice}
              onChange={(e) => {
                setClassPrice(e.target.value)
                const v = parseAmount(e.target.value)
                if (v > 0) setConfig({ classPrice: v })
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Preço do jogo</label>
            <input
              type="text"
              inputMode="decimal"
              value={gamePrice}
              onChange={(e) => {
                setGamePrice(e.target.value)
                const v = parseAmount(e.target.value)
                if (v > 0) setConfig({ gamePrice: v })
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Moeda</label>
            <select
              value={config.currency}
              onChange={(e) =>
                setConfig({ currency: e.target.value as 'BRL' | 'EUR' | 'USD' })
              }
              className={inputClass}
            >
              <option value="BRL">BRL (R$)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Professor</h2>
        <input
          type="text"
          placeholder="Nome do professor"
          value={config.professorName}
          onChange={(e) => setConfig({ professorName: e.target.value })}
          className={inputClass}
        />
      </section>

      <section className={sectionClass}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Horários (notificações em breve)
          </h2>
          {!showRuleForm && (
            <button
              type="button"
              onClick={() => setShowRuleForm(true)}
              className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
            >
              <PlusIcon size={14} /> adicionar
            </button>
          )}
        </div>

        {config.schedule.length === 0 && !showRuleForm && (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Nenhum horário cadastrado. Quando as notificações forem ativadas, o
            app vai te lembrar 1h depois do horário.
          </p>
        )}

        <ul className="space-y-2">
          {config.schedule.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${rule.type === 'class' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {daysLabel[rule.dayOfWeek]} {rule.time}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
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
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {showRuleForm && (
          <div className="mt-3 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
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
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft({ ...draft, type: e.target.value as ActivityType })
                }
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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

      <section className={sectionClass}>
        <h2 className={sectionTitleClass}>Backup</h2>
        <div className="space-y-3">
          <BackupButton />
          <RestoreButton />
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
        <h2 className="mb-1 text-sm font-semibold text-red-700 dark:text-red-400">
          Zona de perigo
        </h2>
        <p className="mb-3 text-xs text-red-600 dark:text-red-300">
          Isso apaga todos os registros. Não dá pra desfazer.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Apagar TODOS os registros?')) clearAll()
          }}
          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
        >
          Apagar todos os registros
        </button>
      </section>
    </div>
  )
}