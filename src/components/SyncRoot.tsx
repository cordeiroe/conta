import { useSync, useSyncMutations } from '../hooks/useSync'
import { useMigration } from '../hooks/useMigration'

/**
 * Invisible component that runs sync/migration hooks once at app root.
 * Renders a toast notification when migration completes.
 */
export function SyncRoot() {
  useSync()
  useSyncMutations()
  const migration = useMigration()

  if (migration.migrated) {
    return (
      <div
        role="status"
        data-testid="migration-toast"
        className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
      >
        ✓ Dados sincronizados na nuvem
      </div>
    )
  }

  if (migration.error) {
    return (
      <div
        role="status"
        data-testid="migration-error"
        className="fixed bottom-20 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
      >
        ✗ Falha ao sincronizar
      </div>
    )
  }

  return null
}
