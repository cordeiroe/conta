import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthGrid } from '../MonthGrid'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-08-28T12:00:00'))
})

describe('MonthGrid smoke + animation classes', () => {
  it('renders without crashing', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    render(
      <MonthGrid
        anchor={new Date('2026-08-28T12:00:00')}
        onChangeAnchor={onChange}
        onSelectDay={onSelect}
      />,
    )
    expect(screen.getByText(/agosto de 2026/i)).toBeInTheDocument()
  })

  it('mounts the grid with the animation transition class', () => {
    render(
      <MonthGrid
        anchor={new Date('2026-08-28T12:00:00')}
        onChangeAnchor={() => {}}
        onSelectDay={() => {}}
      />,
    )
    const grid = document.querySelector('[data-testid="month-grid"]')
    expect(grid).not.toBeNull()
    expect(grid?.className).toMatch(/animate-month-fade/)
  })

  it('renders 42 day cells (6 weeks)', () => {
    render(
      <MonthGrid
        anchor={new Date('2026-08-28T12:00:00')}
        onChangeAnchor={() => {}}
        onSelectDay={() => {}}
      />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(42)
  })

  it('responds to next/prev clicks', () => {
    const onChange = vi.fn()
    render(
      <MonthGrid
        anchor={new Date('2026-08-28T12:00:00')}
        onChangeAnchor={onChange}
        onSelectDay={() => {}}
      />,
    )
    fireEvent.click(screen.getByLabelText('Próximo mês'))
    expect(onChange).toHaveBeenCalled()
    const newDate = onChange.mock.calls[0][0]
    expect(newDate.getMonth()).toBe(8)
  })
})