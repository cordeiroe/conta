import type { Config, Entry } from '../types'
import type { PaidMonthsMap } from './paidMonths'

export class BackupParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupParseError'
  }
}

const SUPPORTED_VERSIONS = [1] as const

export interface ParsedBackup {
  version: number
  exportedAt: string
  config: Config
  entries: Record<string, Entry>
  paidMonths: PaidMonthsMap
}

export function parseBackup(json: string): ParsedBackup {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new BackupParseError('JSON inválido')
  }
  return validateBackup(parsed)
}

export function validateBackup(input: unknown): ParsedBackup {
  if (!input || typeof input !== 'object') {
    throw new BackupParseError('Backup deve ser um objeto JSON')
  }
  const obj = input as Record<string, unknown>

  if (typeof obj.version !== 'number') {
    throw new BackupParseError("Campo obrigatório ausente ou inválido: 'version'")
  }
  if (!SUPPORTED_VERSIONS.includes(obj.version as 1)) {
    throw new BackupParseError(
      `Versão do backup (${obj.version}) não suportada. Esperado: ${SUPPORTED_VERSIONS.join(', ')}`,
    )
  }
  if (!obj.config || typeof obj.config !== 'object') {
    throw new BackupParseError("Campo obrigatório ausente ou inválido: 'config'")
  }
  if (!obj.entries || typeof obj.entries !== 'object') {
    throw new BackupParseError("Campo obrigatório ausente ou inválido: 'entries'")
  }
  if (!obj.paidMonths || typeof obj.paidMonths !== 'object') {
    throw new BackupParseError("Campo obrigatório ausente ou inválido: 'paidMonths'")
  }

  return obj as unknown as ParsedBackup
}

export interface CurrentState {
  config: Config
  entries: Record<string, Entry>
  paidMonths: PaidMonthsMap
}

export function importBackup<T extends CurrentState>(current: T, json: string): T {
  try {
    const parsed = parseBackup(json)
    return {
      ...current,
      config: parsed.config,
      entries: parsed.entries,
      paidMonths: parsed.paidMonths,
    }
  } catch {
    return current
  }
}