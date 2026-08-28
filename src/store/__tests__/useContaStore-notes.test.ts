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
  })
})

describe('useContaStore - setNote', () => {
  it('creates entry with note when entry does not exist', () => {
    useContaStore.getState().setNote('2026-08-28', 'aula com bola nova')
    const entry = useContaStore.getState().entries['2026-08-28']
    expect(entry.note).toBe('aula com bola nova')
    expect(entry.class).toBe(false)
    expect(entry.game).toBe(false)
  })

  it('updates note on existing entry while preserving other fields', () => {
    useContaStore.getState().ensureEntry('2026-08-28')
    useContaStore.getState().toggleActivity('2026-08-28', 'class')
    useContaStore.getState().setNote('2026-08-28', 'muito boa')

    const entry = useContaStore.getState().entries['2026-08-28']
    expect(entry.note).toBe('muito boa')
    expect(entry.class).toBe(true)
    expect(entry.game).toBe(false)
  })

  it('updates updatedAt timestamp', () => {
    useContaStore.getState().ensureEntry('2026-08-28')
    const before = useContaStore.getState().entries['2026-08-28'].updatedAt

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        useContaStore.getState().setNote('2026-08-28', 'nota')
        const after = useContaStore.getState().entries['2026-08-28'].updatedAt
        expect(after).not.toBe(before)
        resolve()
      }, 5)
    })
  })

  it('preserves extras when setting note', () => {
    useContaStore.getState().addExtra('2026-08-28', 'grip', 25)
    useContaStore.getState().setNote('2026-08-28', 'comprei 2')

    const entry = useContaStore.getState().entries['2026-08-28']
    expect(entry.extras).toHaveLength(1)
    expect(entry.extras[0].label).toBe('grip')
    expect(entry.note).toBe('comprei 2')
  })

  it('can clear note by setting empty string', () => {
    useContaStore.getState().setNote('2026-08-28', 'algo')
    useContaStore.getState().setNote('2026-08-28', '')
    expect(useContaStore.getState().entries['2026-08-28'].note).toBe('')
  })
})