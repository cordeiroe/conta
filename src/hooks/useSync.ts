import { useEffect, useRef } from 'react'
import { useContaStore } from '../store/useContaStore'
import { api, entryToServerPayload, serverEntryToEntry } from '../lib/api'
import { monthKey as monthKeyOf } from '../lib/dates'

/**
 * Sync layer that:
 * 1. On mount: fetches the user's data from D1 and hydrates the store
 * 2. Subscribes to store changes and pushes them to D1 (debounced)
 *
 * localStorage continues to be the offline cache (via Zustand persist),
 * so the UI works without network. D1 is the source of truth for shared data.
 */
export function useSync() {
  const setConfig = useContaStore((s) => s.setConfig)
  const setEntries = useContaStore((s) => s.setEntries)
  const setPaidMonths = useContaStore((s) => s.setPaidMonths)


  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    void loadFromServer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadFromServer() {
    try {
      const data = await api.sync()

      // Config (replace local if server has it; else keep local default)
      if (data.config) {
        const { updated_at: _updatedAt, ...configWithoutMeta } = data.config
        setConfig({
          ...configWithoutMeta,
          updatedAt: _updatedAt,
        } as Parameters<typeof setConfig>[0] & { updatedAt: string })
      }

      // Entries
      const entries: Record<string, ReturnType<typeof serverEntryToEntry>> = {}
      for (const row of data.entries) {
        entries[row.date] = serverEntryToEntry(row.date, row)
      }
      setEntries(entries)

      // Paid months
      setPaidMonths(data.paidMonths)

      // After load, push back any localStorage deltas the server doesn't have
      void pushLocalDeltas()
    } catch (err) {
      // Network error — keep using localStorage cache
      console.warn('[sync] failed to load from server, using local cache:', err)
    }
  }

  /**
   * After loading from server, check local entries that the server might be
   * missing (e.g., added while offline) and push them up. Uses last-write-wins:
   * if local updatedAt > server updatedAt for the same date, push.
   */
  async function pushLocalDeltas() {
    const state = useContaStore.getState()
    const localEntries = Object.values(state.entries).filter(
      (e) => e.class || e.game || e.extras.length > 0 || e.note,
    )
    if (localEntries.length === 0) return

    try {
      const remote = await api.sync()
      const remoteMap = new Map(remote.entries.map((e) => [e.date, e]))

      for (const local of localEntries) {
        const remoteEntry = remoteMap.get(local.date)
        if (!remoteEntry || remoteEntry.updated_at < local.updatedAt) {
          await api.upsertEntry(local.date, entryToServerPayload(local))
        }
      }
    } catch (err) {
      console.warn('[sync] pushLocalDeltas failed:', err)
    }
  }
}

/**
 * Subscribes to store mutations and pushes them to D1 after a short debounce.
 * Mount this once at the app root.
 */
export function useSyncMutations() {
  const entries = useContaStore((s) => s.entries)
  const paidMonths = useContaStore((s) => s.paidMonths)
  const config = useContaStore((s) => s.config)

  const prev = useRef({ entries, paidMonths, config })

  useEffect(() => {
    if (prev.current.entries === entries && prev.current.paidMonths === paidMonths && prev.current.config === config) return
    const changed = diff(prev.current, { entries, paidMonths, config })
    prev.current = { entries, paidMonths, config }
    if (changed) void pushChanges(changed)
  }, [entries, paidMonths, config])
}

interface Changed {
  entries: Record<string, 'put' | 'delete'>
  paidMonths: Record<string, 'put' | 'delete'>
  config: boolean
}

function diff(
  prev: { entries: Record<string, any>; paidMonths: Record<string, any>; config: any },
  next: { entries: Record<string, any>; paidMonths: Record<string, any>; config: any },
): Changed | null {
  const entryChanges: Record<string, 'put' | 'delete'> = {}


  // Entries: detect added/changed and removed
  for (const [date, entry] of Object.entries(next.entries)) {
    const prevEntry = prev.entries[date]
    if (!prevEntry || prevEntry !== entry) {
      const hasContent =
        entry.class || entry.game || entry.extras.length > 0 || entry.note
      if (hasContent) entryChanges[date] = 'put'
    }
  }
  for (const date of Object.keys(prev.entries)) {
    if (!(date in next.entries)) entryChanges[date] = 'delete'
  }

  const paidChanges: Record<string, 'put' | 'delete'> = {}
  for (const month of Object.keys(next.paidMonths)) {
    if (prev.paidMonths[month] !== next.paidMonths[month]) paidChanges[month] = 'put'
  }
  for (const month of Object.keys(prev.paidMonths)) {
    if (!(month in next.paidMonths)) paidChanges[month] = 'delete'
  }

  const configChanged = prev.config !== next.config

  if (Object.keys(entryChanges).length === 0 && Object.keys(paidChanges).length === 0 && !configChanged) {
    return null
  }

  return { entries: entryChanges, paidMonths: paidChanges, config: configChanged }
}

async function pushChanges(changed: Changed) {
  const state = useContaStore.getState()
  try {
    for (const [date, op] of Object.entries(changed.entries)) {
      if (op === 'put') {
        const entry = state.entries[date]
        if (entry) await api.upsertEntry(date, entryToServerPayload(entry))
      } else {
        await api.deleteEntry(date)
      }
    }
    for (const [month, op] of Object.entries(changed.paidMonths)) {
      if (op === 'put') {
        await api.markPaid(month)
      } else {
        await api.unmarkPaid(month)
      }
    }
    if (changed.config) {
      await api.upsertConfig({
        ...state.config,
        updatedAt: new Date().toISOString(),
      })
    }
  } catch (err) {
    console.warn('[sync] pushChanges failed (will retry on next load):', err)
  }
}

/** Returns current month as YYYY-MM in local time. */
export function currentMonthKey(): string {
  return monthKeyOf(new Date())
}
