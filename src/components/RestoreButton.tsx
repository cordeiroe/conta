import { useRef, useState } from 'react'
import { useContaStore } from '../store/useContaStore'
import { parseBackup, BackupParseError } from '../lib/backup-import'

export function RestoreButton() {
  const entries = useContaStore((s) => s.entries)
  const setConfig = useContaStore((s) => s.setConfig)
  const setEntries = useContaStore((s) => s.setEntries)
  const setPaidMonths = useContaStore((s) => s.setPaidMonths)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const parsed = parseBackup(text)
      setConfig(parsed.config)
      setEntries(parsed.entries)
      setPaidMonths(parsed.paidMonths)
      setStatus('success')
      setErrorMessage('')
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof BackupParseError ? err.message : 'Erro ao ler arquivo',
      )
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    setStatus('idle')
    fileInputRef.current?.click()
  }

  const entryCount = Object.keys(entries).length

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="hidden"
        data-testid="restore-input"
      />
      <button
        type="button"
        data-testid="restore-button"
        onClick={handleClick}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800"
      >
        Restaurar de backup (JSON)
      </button>
      <p className="mt-1.5 text-xs text-slate-400">
        Substitui {entryCount} registro(s) atuais pelo conteúdo do arquivo.
      </p>
      {status === 'success' && (
        <p
          data-testid="restore-success"
          className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
        >
          ✓ Backup restaurado
        </p>
      )}
      {status === 'error' && (
        <p
          data-testid="restore-error"
          className="mt-2 rounded-md bg-red-50 px-2 py-1 text-xs text-red-700"
        >
          ✗ {errorMessage}
        </p>
      )}
    </div>
  )
}