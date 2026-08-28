import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EntrySheet } from '../EntrySheet'
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

describe('EntrySheet note', () => {
  it('renders empty note textarea when no note', () => {
    render(<EntrySheet dateKey="2026-08-28" onClose={() => {}} />)
    const ta = screen.getByTestId('note-input') as HTMLTextAreaElement
    expect(ta.value).toBe('')
  })

  it('renders existing note value', () => {
    useContaStore.getState().setNote('2026-08-28', 'aula boa')
    render(<EntrySheet dateKey="2026-08-28" onClose={() => {}} />)
    const ta = screen.getByTestId('note-input') as HTMLTextAreaElement
    expect(ta.value).toBe('aula boa')
  })

  it('saves note to store on change', () => {
    render(<EntrySheet dateKey="2026-08-28" onClose={() => {}} />)
    const ta = screen.getByTestId('note-input')
    fireEvent.change(ta, { target: { value: 'com dor no ombro' } })
    expect(useContaStore.getState().entries['2026-08-28'].note).toBe(
      'com dor no ombro',
    )
  })
})