import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TodayCard } from '../TodayCard'
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
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-28T12:00:00'))
})

describe('TodayCard streak badge', () => {
  it('does not render streak badge when no consecutive classes', () => {
    render(<TodayCard onQuickAction={() => {}} onOpenEntry={() => {}} />)
    expect(screen.queryByTestId('streak-badge')).not.toBeInTheDocument()
  })

  it('renders streak badge with count when streak is active', () => {
    const today = '2026-08-28'
    useContaStore.setState({
      entries: {
        [today]: {
          date: today,
          class: true,
          game: false,
          extras: [],
          updatedAt: today,
        },
        '2026-08-27': {
          date: '2026-08-27',
          class: true,
          game: false,
          extras: [],
          updatedAt: '2026-08-27',
        },
        '2026-08-26': {
          date: '2026-08-26',
          class: true,
          game: false,
          extras: [],
          updatedAt: '2026-08-26',
        },
      },
    })
    render(<TodayCard onQuickAction={() => {}} onOpenEntry={() => {}} />)
    expect(screen.getByTestId('streak-badge')).toHaveTextContent('3 aulas seguidas')
  })

  it('uses singular when streak is 1', () => {
    const today = '2026-08-28'
    useContaStore.setState({
      entries: {
        [today]: {
          date: today,
          class: true,
          game: false,
          extras: [],
          updatedAt: today,
        },
      },
    })
    render(<TodayCard onQuickAction={() => {}} onOpenEntry={() => {}} />)
    expect(screen.getByTestId('streak-badge')).toHaveTextContent('1 aula seguida')
  })
})