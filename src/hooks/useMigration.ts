import { useEffect, useState } from 'react'
import { useContaStore } from '../store/useContaStore'
import { api } from '../lib/api'

const MIGRATION_FLAG = 'conta-migrated-v1'

/**
 * On first authenticated load, detect localStorage data and the empty D1,
 * then auto-migrate. Shows a one-time toast confirming success.
 *
 * Migration strategy: always include ALL local data (config, entries, paidMonths).
 * The server uses last-write-wins by updatedAt, so newer entries win.
 */
export function useMigration(): { migrated: boolean; skipped: boolean; error: string | null } {
  const [migrated, setMigrated] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(MIGRATION_FLAG)) {
      setSkipped(true)
      return
    }

    const state = useContaStore.getState()
    const hasLocalData =
      Object.keys(state.entries).length > 0 || Object.keys(state.paidMonths).length > 0

    if (!hasLocalData) {
      // Nothing to migrate, mark done
      window.localStorage.setItem(MIGRATION_FLAG, '1')
      setSkipped(true)
      return
    }

    void migrate(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function migrate(state: ReturnType<typeof useContaStore.getState>) {
    try {
      // Check if server already has data
      const server = await api.sync()
      const serverHasData =
        server.config !== null ||
        server.entries.length > 0 ||
        Object.keys(server.paidMonths).length > 0

      if (serverHasData) {
        // Server has data, no migration needed
        window.localStorage.setItem(MIGRATION_FLAG, '1')
        setSkipped(true)
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
      setMigrated(true)
    } catch (err) {
      console.warn('[migration] failed:', err)
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return { migrated, skipped, error }
}
