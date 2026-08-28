import { describe, expect, it } from 'vitest'
import { parseBackup, validateBackup, importBackup, BackupParseError } from '../backup-import'
import type { Config } from '../../types'

const cfg: Config = {
  classPrice: 100,
  gamePrice: 50,
  currency: 'BRL',
  professorName: 'Davi',
  notificationHourOffset: 1,
  schedule: [],
}

const validPayload = () => ({
  version: 1,
  exportedAt: '2026-08-30T12:00:00.000Z',
  config: cfg,
  entries: {
    '2026-08-15': {
      date: '2026-08-15',
      class: true,
      game: false,
      extras: [],
      updatedAt: '2026-08-15',
    },
  },
  paidMonths: { '2026-07': '2026-07-30T12:00:00.000Z' },
})

describe('parseBackup', () => {
  it('parses a valid JSON string into an object', () => {
    const json = JSON.stringify(validPayload())
    const result = parseBackup(json)
    expect(result.version).toBe(1)
    expect(result.entries['2026-08-15'].class).toBe(true)
  })

  it('throws BackupParseError on invalid JSON', () => {
    expect(() => parseBackup('{not json')).toThrow(BackupParseError)
  })

  it('throws BackupParseError on empty string', () => {
    expect(() => parseBackup('')).toThrow(BackupParseError)
  })
})

describe('validateBackup', () => {
  it('returns the validated payload when shape is correct', () => {
    const result = validateBackup(validPayload())
    expect(result.version).toBe(1)
  })

  it('throws on missing version field', () => {
    const { version, ...rest } = validPayload()
    expect(() => validateBackup(rest)).toThrow(/version/)
  })

  it('throws on missing config', () => {
    const { config, ...rest } = validPayload()
    expect(() => validateBackup(rest)).toThrow(/config/)
  })

  it('throws on missing entries', () => {
    const { entries, ...rest } = validPayload()
    expect(() => validateBackup(rest)).toThrow(/entries/)
  })

  it('throws on missing paidMonths', () => {
    const { paidMonths, ...rest } = validPayload()
    expect(() => validateBackup(rest)).toThrow(/paidMonths/)
  })

  it('throws on unsupported version', () => {
    expect(() => validateBackup({ ...validPayload(), version: 99 })).toThrow(
      /suportada/i,
    )
  })

  it('throws when version is not a number', () => {
    expect(() => validateBackup({ ...validPayload(), version: '1' })).toThrow(
      BackupParseError,
    )
  })
})

describe('importBackup', () => {
  it('replaces config, entries, paidMonths atomically', () => {
    const before: import('../backup-import').CurrentState = {
      config: { ...cfg, professorName: 'Old' },
      entries: {
        '2026-01-01': {
          date: '2026-01-01',
          class: false,
          game: false,
          extras: [],
          updatedAt: '2026-01-01',
        },
      },
      paidMonths: { '2026-01': '2026-01-31T12:00:00Z' },
    }
    const after = importBackup(before, JSON.stringify(validPayload()))
    expect(after.config.professorName).toBe('Davi')
    expect(after.entries['2026-08-15']).toBeDefined()
    expect(after.entries['2026-01-01']).toBeUndefined()
    expect(after.paidMonths['2026-07']).toBeDefined()
    expect(after.paidMonths['2026-01']).toBeUndefined()
  })

  it('returns the original state if JSON is invalid', () => {
    const original = {
      config: cfg,
      entries: {},
      paidMonths: {},
    }
    const result = importBackup(original, '{not json')
    expect(result).toBe(original)
  })

  it('returns the original state if shape is invalid', () => {
    const original = {
      config: cfg,
      entries: {},
      paidMonths: {},
    }
    const result = importBackup(original, JSON.stringify({ version: 99 }))
    expect(result).toBe(original)
  })

  it('does not mutate the input state', () => {
    const before = {
      config: { ...cfg },
      entries: { ...{} },
      paidMonths: { ...{} },
    }
    importBackup(before, JSON.stringify(validPayload()))
    expect(before.config.professorName).toBe('Davi')
    expect(before.paidMonths).toEqual({})
  })
})