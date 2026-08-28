import { describe, expect, it } from 'vitest'
import { weeklyTotals } from '../weekly'
import type { Entry, Config } from '../../types'

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

describe('weeklyTotals', () => {
  it('returns zero when no entries this week', () => {
    expect(weeklyTotals({}, cfg(), new Date('2026-08-28T12:00:00'))).toEqual({
      classesCount: 0,
      gamesCount: 0,
      classesAmount: 0,
      gamesAmount: 0,
      extrasAmount: 0,
      total: 0,
    })
  })

  it('counts only entries within the current week (Sun-Sat)', () => {
    const anchor = new Date('2026-08-28T12:00:00')
    const entries = {
      '2026-08-23': entry('2026-08-23', true),
      '2026-08-25': entry('2026-08-25', true),
      '2026-08-28': entry('2026-08-28', true),
      '2026-08-29': entry('2026-08-29', true),
      '2026-08-22': entry('2026-08-22', true),
      '2026-08-30': entry('2026-08-30', true),
    }
    const r = weeklyTotals(entries, cfg(), anchor)
    expect(r.classesCount).toBe(4)
  })

  it('multiplies classes by classPrice and games by gamePrice', () => {
    const anchor = new Date('2026-08-28T12:00:00')
    const entries = {
      '2026-08-28': entry('2026-08-28', true, false),
      '2026-08-26': entry('2026-08-26', false, true),
    }
    const r = weeklyTotals(entries, cfg(), anchor)
    expect(r.classesCount).toBe(1)
    expect(r.gamesCount).toBe(1)
    expect(r.classesAmount).toBe(100)
    expect(r.gamesAmount).toBe(50)
    expect(r.total).toBe(150)
  })

  it('respects per-entry price overrides', () => {
    const anchor = new Date('2026-08-28T12:00:00')
    const entries = {
      '2026-08-28': { ...entry('2026-08-28', true), classPrice: 150 },
    }
    const r = weeklyTotals(entries, cfg(), anchor)
    expect(r.classesAmount).toBe(150)
    expect(r.total).toBe(150)
  })

  it('includes extras in total', () => {
    const anchor = new Date('2026-08-28T12:00:00')
    const entries = {
      '2026-08-28': {
        ...entry('2026-08-28', true),
        extras: [{ id: '1', label: 'grip', amount: 30 }],
      },
    }
    const r = weeklyTotals(entries, cfg(), anchor)
    expect(r.extrasAmount).toBe(30)
    expect(r.total).toBe(130)
  })

  it('starts week on Sunday and ends on Saturday', () => {
    const sunday = new Date('2026-08-23T12:00:00')
    const entries = {
      '2026-08-23': entry('2026-08-23', true),
      '2026-08-29': entry('2026-08-29', true),
      '2026-08-22': entry('2026-08-22', true),
      '2026-08-30': entry('2026-08-30', true),
    }
    const r = weeklyTotals(entries, cfg(), sunday)
    expect(r.classesCount).toBe(2)
  })

  it('handles anchor in middle of week correctly', () => {
    const wednesday = new Date('2026-08-26T12:00:00')
    const monday = '2026-08-24'
    const tuesday = '2026-08-25'
    const sat = '2026-08-29'
    const sun = '2026-08-30'
    const entries = {
      [monday]: entry(monday, true),
      [tuesday]: entry(tuesday, true),
      [sat]: entry(sat, true),
      [sun]: entry(sun, true),
    }
    const r = weeklyTotals(entries, cfg(), wednesday)
    expect(r.classesCount).toBe(3)
  })
})