import { describe, expect, it, beforeEach } from 'vitest'
import { useContaStore } from '../../store/useContaStore'
import { markMonthPaid, isMonthPaid, getPaidMonths } from '../paidMonths'

beforeEach(() => {
  useContaStore.setState({
    config: {
      classPrice: 80,
      gamePrice: 30,
      currency: 'BRL',
      professorName: '',
      notificationHourOffset: 1,
      schedule: [],
    },
    entries: {},
  })
})

describe('paidMonths', () => {
  it('returns false for unpaid month', () => {
    expect(isMonthPaid({}, '2026-08')).toBe(false)
  })

  it('marks a month as paid', () => {
    markMonthPaid({}, '2026-08')
    const result = markMonthPaid({}, '2026-08')
    expect(result).toEqual({ '2026-08': expect.any(String) })
    expect(isMonthPaid(result, '2026-08')).toBe(true)
  })

  it('preserves previously paid months when adding a new one', () => {
    const state = markMonthPaid({}, '2026-07')
    const next = markMonthPaid(state, '2026-08')
    expect(isMonthPaid(next, '2026-07')).toBe(true)
    expect(isMonthPaid(next, '2026-08')).toBe(true)
  })

  it('records paid-at timestamp', () => {
    const state = markMonthPaid({}, '2026-08')
    expect(typeof state['2026-08']).toBe('string')
    expect(() => new Date(state['2026-08']).toISOString()).not.toThrow()
  })

  it('does not duplicate if already paid (idempotent)', () => {
    const first = markMonthPaid({}, '2026-08')
    const second = markMonthPaid(first, '2026-08')
    expect(first).toEqual(second)
  })

  it('getPaidMonths returns sorted list', () => {
    let state: Record<string, string> = {}
    state = markMonthPaid(state, '2026-08')
    state = markMonthPaid(state, '2026-03')
    state = markMonthPaid(state, '2026-11')
    const list = getPaidMonths(state)
    expect(list).toEqual(['2026-03', '2026-08', '2026-11'])
  })
})