import { describe, expect, it } from 'vitest'
import { currentClassStreak } from '../streak'
import type { Entry } from '../../types'

const entry = (date: string, klass: boolean): Entry => ({
  date,
  class: klass,
  game: false,
  extras: [],
  updatedAt: date,
})

const today = new Date('2026-08-28T12:00:00')

describe('currentClassStreak', () => {
  it('returns 0 when no entries', () => {
    expect(currentClassStreak({}, today)).toBe(0)
  })

  it('returns 0 when today has no class and yesterday has no class', () => {
    const entries = {
      '2026-08-27': entry('2026-08-27', false),
      '2026-08-26': entry('2026-08-26', false),
    }
    expect(currentClassStreak(entries, today)).toBe(0)
  })

  it('returns 1 when only today has class', () => {
    const entries = {
      '2026-08-28': entry('2026-08-28', true),
    }
    expect(currentClassStreak(entries, today)).toBe(1)
  })

  it('counts consecutive days backwards from today', () => {
    const entries = {
      '2026-08-28': entry('2026-08-28', true),
      '2026-08-27': entry('2026-08-27', true),
      '2026-08-26': entry('2026-08-26', true),
      '2026-08-25': entry('2026-08-25', true),
    }
    expect(currentClassStreak(entries, today)).toBe(4)
  })

  it('stops counting when a day has no class', () => {
    const entries = {
      '2026-08-28': entry('2026-08-28', true),
      '2026-08-27': entry('2026-08-27', true),
      '2026-08-26': entry('2026-08-26', false),
      '2026-08-25': entry('2026-08-25', true),
    }
    expect(currentClassStreak(entries, today)).toBe(2)
  })

  it('uses yesterday as start if today has no class but yesterday does', () => {
    const entries = {
      '2026-08-28': entry('2026-08-28', false),
      '2026-08-27': entry('2026-08-27', true),
      '2026-08-26': entry('2026-08-26', true),
    }
    expect(currentClassStreak(entries, today)).toBe(2)
  })

  it('returns 0 if today and yesterday have no class', () => {
    const entries = {
      '2026-08-28': entry('2026-08-28', false),
      '2026-08-27': entry('2026-08-27', false),
      '2026-08-26': entry('2026-08-26', true),
      '2026-08-25': entry('2026-08-25', true),
    }
    expect(currentClassStreak(entries, today)).toBe(0)
  })

  it('ignores game-only days (game without class)', () => {
    const entries = {
      '2026-08-28': entry('2026-08-28', false),
      '2026-08-27': entry('2026-08-27', false),
    }
    expect(currentClassStreak(entries, today)).toBe(0)
  })
})