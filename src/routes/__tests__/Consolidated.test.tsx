import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Consolidated } from '../Consolidated'
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
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-28T12:00:00'))
})

describe('Consolidated YTD card', () => {
  it('renders YTD card with zero total when no entries', () => {
    render(
      <MemoryRouter>
        <Consolidated />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('ytd-total')).toHaveTextContent('R$ 0,00')
    expect(screen.getByTestId('ytd-card')).toHaveTextContent('2026')
  })

  it('sums current year entries only', () => {
    useContaStore.setState({
      entries: {
        '2026-03-15': {
          date: '2026-03-15',
          class: true,
          game: false,
          extras: [],
          updatedAt: '2026-03-15',
        },
        '2026-06-10': {
          date: '2026-06-10',
          class: false,
          game: true,
          extras: [],
          updatedAt: '2026-06-10',
        },
        '2025-12-31': {
          date: '2025-12-31',
          class: true,
          game: false,
          extras: [],
          updatedAt: '2025-12-31',
        },
      },
    })
    render(
      <MemoryRouter>
        <Consolidated />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('ytd-total')).toHaveTextContent('R$ 110,00')
  })
})

describe('Consolidated paid status', () => {
  it('shows toggle button when month is not paid', () => {
    render(
      <MemoryRouter>
        <Consolidated />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('toggle-paid')).toHaveTextContent(
      'Marcar mês como pago',
    )
    expect(screen.queryByTestId('paid-badge')).not.toBeInTheDocument()
  })

  it('toggles paid status on click', () => {
    render(
      <MemoryRouter>
        <Consolidated />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByTestId('toggle-paid'))
    expect(useContaStore.getState().paidMonths['2026-08']).toBeDefined()
    expect(screen.getByTestId('toggle-paid')).toHaveTextContent('desfazer')
    expect(screen.getByTestId('paid-badge')).toBeInTheDocument()
  })
})