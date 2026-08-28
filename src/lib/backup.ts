import type { Config, Entry } from '../types'
import type { PaidMonthsMap } from './paidMonths'

export interface ExportPayload {
  version: number
  exportedAt: string
  config: Config
  entries: Record<string, Entry>
  paidMonths: PaidMonthsMap
}

export interface BackupInput {
  config: Config
  entries: Record<string, Entry>
  paidMonths: PaidMonthsMap
}

export const EXPORT_VERSION = 1

export function buildExportPayload(input: BackupInput, now: Date = new Date()): ExportPayload {
  return {
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    config: structuredClone(input.config),
    entries: structuredClone(input.entries),
    paidMonths: structuredClone(input.paidMonths),
  }
}

export function serializeBackup(input: BackupInput, now: Date = new Date()): string {
  return payloadToJson(buildExportPayload(input, now), now)
}

export function payloadToJson(
  payload: {
    version: number
    config: Config
    entries: Record<string, Entry>
    paidMonths: PaidMonthsMap
  },
  now: Date = new Date(),
): string {
  return JSON.stringify(
    {
      ...payload,
      exportedAt: now.toISOString(),
    },
    null,
    2,
  )
}

export function backupFilename(now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10)
  return `conta-backup-${date}.json`
}

export function downloadBackup(input: BackupInput, now: Date = new Date()): void {
  const json = serializeBackup(input, now)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = backupFilename(now)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}