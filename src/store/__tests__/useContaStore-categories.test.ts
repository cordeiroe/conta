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

describe('useContaStore - addExtra with category', () => {
  it('adds extra with category', () => {
    useContaStore.getState().addExtra('2026-08-28', 'Wilson padel', 25, 'bola')
    const entry = useContaStore.getState().entries['2026-08-28']
    expect(entry.extras[0].category).toBe('bola')
    expect(entry.extras[0].label).toBe('Wilson padel')
    expect(entry.extras[0].amount).toBe(25)
  })

  it('defaults to no category when omitted', () => {
    useContaStore.getState().addExtra('2026-08-28', 'alguma coisa', 10)
    const entry = useContaStore.getState().entries['2026-08-28']
    expect(entry.extras[0].category).toBeUndefined()
  })

  it('preserves category on existing extras when adding new one', () => {
    useContaStore.getState().addExtra('2026-08-28', 'grip Bull', 18, 'grip')
    useContaStore.getState().addExtra('2026-08-28', 'bola extra', 30, 'bola')
    const extras = useContaStore.getState().entries['2026-08-28'].extras
    expect(extras).toHaveLength(2)
    expect(extras[0].category).toBe('grip')
    expect(extras[1].category).toBe('bola')
  })

  it('updateExtra can change category', () => {
    useContaStore.getState().addExtra('2026-08-28', 'grip', 18, 'grip')
    const id = useContaStore.getState().entries['2026-08-28'].extras[0].id
    useContaStore.getState().updateExtra('2026-08-28', id, { category: 'outro' })
    expect(
      useContaStore.getState().entries['2026-08-28'].extras[0].category,
    ).toBe('outro')
  })

  it('preserves category when amount is updated', () => {
    useContaStore.getState().addExtra('2026-08-28', 'grip', 18, 'grip')
    const id = useContaStore.getState().entries['2026-08-28'].extras[0].id
    useContaStore.getState().updateExtra('2026-08-28', id, { amount: 25 })
    const extra = useContaStore.getState().entries['2026-08-28'].extras[0]
    expect(extra.category).toBe('grip')
    expect(extra.amount).toBe(25)
  })
})