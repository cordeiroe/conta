import { describe, expect, it, beforeEach } from 'vitest'
import { useContaStore } from '../../store/useContaStore'

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
    paidMonths: {},
  })
})

describe('useContaStore - toggleMonthPaid', () => {
  it('marks month as paid (adds to paidMonths)', () => {
    useContaStore.getState().toggleMonthPaid('2026-08')
    expect(useContaStore.getState().paidMonths['2026-08']).toBeDefined()
  })

  it('unmarks when called twice (toggle)', () => {
    useContaStore.getState().toggleMonthPaid('2026-08')
    useContaStore.getState().toggleMonthPaid('2026-08')
    expect(useContaStore.getState().paidMonths['2026-08']).toBeUndefined()
  })

  it('handles multiple months independently', () => {
    useContaStore.getState().toggleMonthPaid('2026-07')
    useContaStore.getState().toggleMonthPaid('2026-08')
    expect(useContaStore.getState().paidMonths['2026-07']).toBeDefined()
    expect(useContaStore.getState().paidMonths['2026-08']).toBeDefined()
  })
})