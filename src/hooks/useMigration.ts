import { useEffect, useState } from 'react'
import { useContaStore } from '../store/useContaStore'
import { api } from '../lib/api'

const MIGRATION_FLAG = 'conta-migrated-v2'

interface MigrationState {
  migrated: boolean
  skipped: boolean
  error: string | null
}

/**
 * On first authenticated load, detect localStorage data and the empty D1,
 * then auto-migrate. Shows a one-time toast confirming success.
 *
 * Migration strategy: always include ALL local data (config, entries, paidMonths).
 * The server uses last-write-wins by updatedAt, so newer entries win.
 *
 * Important: must wait for Zustand persist hydration before reading local data,
 * otherwise we'd read the empty initial state and skip migration.
 */
export function useMigration(): MigrationState {
  const [state, setState] = useState<MigrationState>({
    migrated: false,
    skipped: false,
    error: null,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already migrated in a previous session (current version)
    if (window.localStorage.getItem(MIGRATION_FLAG)) {
      setState({ migrated: false, skipped: true, error: null })
      return
    }

    // Clear stale v1 flag (the v1 migration had a bug — ran before Zustand
    // hydrated, so it always saw empty state and skipped)
    window.localStorage.removeItem('conta-migrated-v1')

    // Wait for Zustand persist to hydrate before reading state
    const persistApi = useContaStore.persist
    const tryMigrate = () => {
      const s = useContaStore.getState()
      const hasLocalData =
        Object.keys(s.entries).length > 0 || Object.keys(s.paidMonths).length > 0

      if (!hasLocalData) {
        // Nothing to migrate, mark done
        window.localStorage.setItem(MIGRATION_FLAG, '1')
        setState({ migrated: false, skipped: true, error: null })
        return
      }

      void migrate(s, setState)
    }

    if (persistApi.hasHydrated()) {
      tryMigrate()
    } else {
      const unsub = persistApi.onFinishHydration(() => {
        unsub?.()
        tryMigrate()
      })
      // Fallback: also try after a short delay in case onFinishHydration doesn't fire
      const timer = setTimeout(tryMigrate, 500)

      return () => {
        unsub?.()
        clearTimeout(timer)
      }
    }
  }, [])

  return state
}

async function migrate(
  state: ReturnType<typeof useContaStore.getState>,
  setState: React.Dispatch<React.SetStateAction<MigrationState>>,
) {
  try {
    const server = await api.sync()
    const serverHasData =
      server.config !== null ||
      server.entries.length > 0 ||
      Object.keys(server.paidMonths).length > 0

    if (serverHasData) {
      window.localStorage.setItem(MIGRATION_FLAG, '1')
      setState({ migrated: false, skipped: true, error: null })
      return
    }

    const payload = {
      config: {
        ...state.config,
        updatedAt: new Date().toISOString(),
      },
      entries: Object.values(state.entries)
        .filter((e) => e.class || e.game || e.extras.length > 0 || e.note)
        .map((e) => ({
          date: e.date,
          class: e.class,
          classPrice: e.classPrice ?? null,
          game: e.game,
          gamePrice: e.gamePrice ?? null,
          extras: e.extras,
          note: e.note ?? null,
          updatedAt: e.updatedAt,
        })),
      paidMonths: state.paidMonths,
    }

    await api.migrate(payload)
    window.localStorage.setItem(MIGRATION_FLAG, '1')
    setState({ migrated: true, skipped: false, error: null })
  } catch (err) {
    console.warn('[migration] failed:', err)
    setState({
      migrated: false,
      skipped: false,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
