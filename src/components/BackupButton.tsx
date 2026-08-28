import { useContaStore } from '../store/useContaStore'
import { downloadBackup } from '../lib/backup'

export function BackupButton() {
  const config = useContaStore((s) => s.config)
  const entries = useContaStore((s) => s.entries)
  const paidMonths = useContaStore((s) => s.paidMonths)

  const handleExport = () => {
    downloadBackup({ config, entries, paidMonths })
  }

  return (
    <button
      type="button"
      data-testid="backup-export"
      onClick={handleExport}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      Exportar backup (JSON)
    </button>
  )
}