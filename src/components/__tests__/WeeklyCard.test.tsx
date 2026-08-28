import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeeklyCard } from '../WeeklyCard'
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

describe('WeeklyCard', () => {
  it('renders with zero counts when no entries', () => {
    render(<WeeklyCard />)
    expect(screen.getByTestId('weekly-classes')).toHaveTextContent('0')
    expect(screen.getByTestId('weekly-games')).toHaveTextContent('0')
    expect(screen.getByTestId('weekly-total')).toHaveTextContent('R$ 0,00')
  })

  it('shows counts and total when entries exist', () => {
    useContaStore.setState({
      entries: {
        '2026-08-26': {
          date: '2026-08-26',
          class: true,
          game: false,
          extras: [],
          updatedAt: '2026-08-26',
        },
        '2026-08-28': {
          date: '2026-08-28',
          class: false,
          game: true,
          extras: [{ id: '1', label: 'grip', amount: 20 }],
          updatedAt: '2026-08-28',
        },
      },
    })
    render(<WeeklyCard />)
    expect(screen.getByTestId('weekly-classes')).toHaveTextContent('1')
    expect(screen.getByTestId('weekly-games')).toHaveTextContent('1')
    expect(screen.getByTestId('weekly-extras')).toHaveTextContent('R$ 20,00')
    expect(screen.getByTestId('weekly-total')).toHaveTextContent('R$ 130,00')
  })
})