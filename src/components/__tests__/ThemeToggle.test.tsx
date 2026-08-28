import { describe, expect, it, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../ThemeToggle'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
})

describe('ThemeToggle', () => {
  it('renders three options', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('theme-light')).toBeInTheDocument()
    expect(screen.getByTestId('theme-dark')).toBeInTheDocument()
    expect(screen.getByTestId('theme-system')).toBeInTheDocument()
  })

  it('marks system as default', () => {
    render(<ThemeToggle />)
    expect(screen.getByTestId('theme-system')).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('switches to dark on click and applies class', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByTestId('theme-dark'))
    expect(screen.getByTestId('theme-dark')).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(document.documentElement.className).toBe('dark')
    expect(localStorage.getItem('conta-theme')).toBe('dark')
  })

  it('switches back to light and removes class', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByTestId('theme-dark'))
    fireEvent.click(screen.getByTestId('theme-light'))
    expect(document.documentElement.className).toBe('')
    expect(localStorage.getItem('conta-theme')).toBe('light')
  })
})