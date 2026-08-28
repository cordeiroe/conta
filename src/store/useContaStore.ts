import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActivityType, Config, Entry, Extra } from '../types'
import { todayKey } from '../lib/dates'
import {
  markMonthPaid,
  unmarkMonthPaid,
  type PaidMonthsMap,
} from '../lib/paidMonths'

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const emptyEntry = (dateKey: string): Entry => ({
  date: dateKey,
  class: false,
  game: false,
  extras: [],
  updatedAt: new Date().toISOString(),
})

interface ContaState {
  config: Config
  entries: Record<string, Entry>
  paidMonths: PaidMonthsMap

  setConfig: (patch: Partial<Config>) => void
  resetConfig: () => void

  getEntry: (dateKey: string) => Entry
  ensureEntry: (dateKey: string) => Entry
  toggleActivity: (dateKey: string, type: ActivityType) => void
  setActivityPrice: (dateKey: string, type: ActivityType, price: number | undefined) => void

  addExtra: (dateKey: string, label: string, amount: number, category?: string) => void
  updateExtra: (dateKey: string, extraId: string, patch: Partial<Extra>) => void
  removeExtra: (dateKey: string, extraId: string) => void

  setNote: (dateKey: string, note: string) => void

  clearEntry: (dateKey: string) => void
  clearAll: () => void

  toggleMonthPaid: (monthKey: string) => void

  setEntries: (entries: Record<string, Entry>) => void
  setPaidMonths: (paidMonths: PaidMonthsMap) => void

  addScheduleRule: (rule: Omit<Config['schedule'][number], 'id' | 'enabled'> & { enabled?: boolean }) => void
  updateScheduleRule: (id: string, patch: Partial<Config['schedule'][number]>) => void
  removeScheduleRule: (id: string) => void
}

const defaultConfig: Config = {
  classPrice: 80,
  gamePrice: 30,
  currency: 'BRL',
  professorName: '',
  notificationHourOffset: 1,
  schedule: [],
}

export const useContaStore = create<ContaState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      entries: {},
      paidMonths: {},

      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),
      resetConfig: () => set({ config: defaultConfig }),

      getEntry: (dateKey) => get().entries[dateKey] ?? emptyEntry(dateKey),

      ensureEntry: (dateKey) => {
        const existing = get().entries[dateKey]
        if (existing) return existing
        const next = emptyEntry(dateKey)
        set((s) => ({ entries: { ...s.entries, [dateKey]: next } }))
        return next
      },

      toggleActivity: (dateKey, type) =>
        set((s) => {
          const current = s.entries[dateKey] ?? emptyEntry(dateKey)
          const updated: Entry = {
            ...current,
            [type]: !current[type],
            updatedAt: new Date().toISOString(),
          }
          return { entries: { ...s.entries, [dateKey]: updated } }
        }),

      setActivityPrice: (dateKey, type, price) =>
        set((s) => {
          const current = s.entries[dateKey] ?? emptyEntry(dateKey)
          const key = type === 'class' ? 'classPrice' : 'gamePrice'
          const updated: Entry = {
            ...current,
            [key]: price,
            updatedAt: new Date().toISOString(),
          }
          return { entries: { ...s.entries, [dateKey]: updated } }
        }),

      addExtra: (dateKey, label, amount, category) =>
        set((s) => {
          const current = s.entries[dateKey] ?? emptyEntry(dateKey)
          const extra: Extra = category
            ? { id: uid(), label, amount, category }
            : { id: uid(), label, amount }
          const updated: Entry = {
            ...current,
            extras: [...current.extras, extra],
            updatedAt: new Date().toISOString(),
          }
          return { entries: { ...s.entries, [dateKey]: updated } }
        }),

      setNote: (dateKey, note) =>
        set((s) => {
          const current = s.entries[dateKey] ?? emptyEntry(dateKey)
          const updated: Entry = {
            ...current,
            note,
            updatedAt: new Date().toISOString(),
          }
          return { entries: { ...s.entries, [dateKey]: updated } }
        }),

      updateExtra: (dateKey, extraId, patch) =>
        set((s) => {
          const current = s.entries[dateKey]
          if (!current) return s
          const updated: Entry = {
            ...current,
            extras: current.extras.map((e) =>
              e.id === extraId ? { ...e, ...patch } : e,
            ),
            updatedAt: new Date().toISOString(),
          }
          return { entries: { ...s.entries, [dateKey]: updated } }
        }),

      removeExtra: (dateKey, extraId) =>
        set((s) => {
          const current = s.entries[dateKey]
          if (!current) return s
          const updated: Entry = {
            ...current,
            extras: current.extras.filter((e) => e.id !== extraId),
            updatedAt: new Date().toISOString(),
          }
          return { entries: { ...s.entries, [dateKey]: updated } }
        }),

      clearEntry: (dateKey) =>
        set((s) => {
          const next = { ...s.entries }
          delete next[dateKey]
          return { entries: next }
        }),

      clearAll: () => set({ entries: {} }),

      toggleMonthPaid: (monthKey) =>
        set((s) => {
          const exists = monthKey in s.paidMonths
          return {
            paidMonths: exists
              ? unmarkMonthPaid(s.paidMonths, monthKey)
              : markMonthPaid(s.paidMonths, monthKey),
          }
        }),

      setEntries: (entries) => set({ entries }),
      setPaidMonths: (paidMonths) => set({ paidMonths }),

      addScheduleRule: (rule) =>
        set((s) => ({
          config: {
            ...s.config,
            schedule: [
              ...s.config.schedule,
              { ...rule, id: uid(), enabled: rule.enabled ?? true },
            ],
          },
        })),

      updateScheduleRule: (id, patch) =>
        set((s) => ({
          config: {
            ...s.config,
            schedule: s.config.schedule.map((r) =>
              r.id === id ? { ...r, ...patch } : r,
            ),
          },
        })),

      removeScheduleRule: (id) =>
        set((s) => ({
          config: {
            ...s.config,
            schedule: s.config.schedule.filter((r) => r.id !== id),
          },
        })),
    }),
    {
      name: 'conta-store',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        if (!persisted || typeof persisted !== 'object') return persisted
        const state = persisted as Record<string, unknown>
        if (version < 2 && !('paidMonths' in state)) {
          return { ...state, paidMonths: {} }
        }
        return state
      },
    },
  ),
)

export const useTodayKey = () => todayKey()