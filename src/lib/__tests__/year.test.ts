import { describe, expect, it } from 'vitest'
import { yearTotals } from '../year'
import type { Config, Entry } from '../../types'

const cfg = (): Config => ({
  classPrice: 100,
  gamePrice: 50,
  currency: 'BRL',
  professorName: '',
  notificationHourOffset: 1,
  schedule: [],
})

const entry = (date: string, klass = false, game = false): Entry => ({
  date,
  class: klass,
  game,
  extras: [],
  updatedAt: date,
})

describe('yearTotals', () => {
  it('returns zero totals when no entries', () => {
    expect(yearTotals({}, cfg(), new Date('2026-08-28'))).toEqual({
      total: 0,
      classesCount: 0,
      gamesCount: 0,
      extrasAmount: 0,
    })
  })

  it('sums only entries in the same calendar year', () => {
    const anchor = new Date('2026-08-28')
    const entries = {
      '2026-01-15': entry('2026-01-15', true),
      '2026-06-10': entry('2026-06-10', true, true),
      '2026-08-28': entry('2026-08-28', true),
      '2025-12-31': entry('2025-12-31', true),
      '2027-01-01': entry('2027-01-01', true),
    }
    const r = yearTotals(entries, cfg(), anchor)
    expect(r.classesCount).toBe(3)
    expect(r.gamesCount).toBe(1)
    expect(r.total).toBe(100 + 150 + 100)
  })

  it('includes extras in total', () => {
    const anchor = new Date('2026-08-28')
    const entries = {
      '2026-03-01': {
        ...entry('2026-03-01', true),
        extras: [{ id: '1', label: 'grip', amount: 30 }],
      },
      '2026-07-01': {
        ...entry('2026-07-01', false, true),
        extras: [{ id: '2', label: 'bola', amount: 50 }],
      },
    }
    const r = yearTotals(entries, cfg(), anchor)
    expect(r.extrasAmount).toBe(80)
    expect(r.total).toBe(80 + 100 + 50)
  })

  it('handles anchor at start of year', () => {
    const anchor = new Date('2026-01-01')
    const entries = {
      '2026-01-01': entry('2026-01-01', true),
      '2025-12-31': entry('2025-12-31', true),
    }
    const r = yearTotals(entries, cfg(), anchor)
    expect(r.classesCount).toBe(1)
  })

  it('handles anchor at end of year', () => {
    const anchor = new Date('2026-12-31')
    const entries = {
      '2026-12-31': entry('2026-12-31', true),
      '2027-01-01': entry('2027-01-01', true),
    }
    const r = yearTotals(entries, cfg(), anchor)
    expect(r.classesCount).toBe(1)
  })

  it('respects per-entry price overrides', () => {
    const anchor = new Date('2026-08-28')
    const entries = {
      '2026-04-15': { ...entry('2026-04-15', true), classPrice: 200 },
    }
    const r = yearTotals(entries, cfg(), anchor)
    expect(r.total).toBe(200)
  })
})