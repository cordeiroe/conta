import type { Config, Entry, MonthTotals } from '../types'
import { fromKey, monthKey } from './dates'

const currencySymbols: Record<string, string> = {
  BRL: 'R$',
  EUR: '€',
  USD: '$',
}

export const formatMoney = (amount: number, currency: string) => {
  const sym = currencySymbols[currency] ?? currency
  const formatted = amount.toFixed(2).replace('.', ',')
  return `${sym} ${formatted}`
}

export const parseAmount = (raw: string): number => {
  const cleaned = raw.replace(/[^\d,.-]/g, '').replace(',', '.')
  const n = Number(cleaned)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0
}

export const totalsForMonth = (
  entries: Record<string, Entry>,
  config: Config,
  anchor: Date,
): MonthTotals => {
  const target = monthKey(anchor)
  let classesCount = 0
  let gamesCount = 0
  let classesAmount = 0
  let gamesAmount = 0
  let extrasAmount = 0

  for (const key of Object.keys(entries)) {
    const entry = entries[key]
    if (monthKey(fromKey(key)) !== target) continue
    if (entry.class) {
      classesCount += 1
      classesAmount += entry.classPrice ?? config.classPrice
    }
    if (entry.game) {
      gamesCount += 1
      gamesAmount += entry.gamePrice ?? config.gamePrice
    }
    for (const ex of entry.extras) {
      extrasAmount += ex.amount
    }
  }

  return {
    classesCount,
    gamesCount,
    classesAmount,
    gamesAmount,
    extrasAmount,
    total: classesAmount + gamesAmount + extrasAmount,
  }
}

export const totalsForAllEntries = (
  entries: Record<string, Entry>,
  config: Config,
): MonthTotals => {
  let classesCount = 0
  let gamesCount = 0
  let classesAmount = 0
  let gamesAmount = 0
  let extrasAmount = 0
  for (const entry of Object.values(entries)) {
    if (entry.class) {
      classesCount += 1
      classesAmount += entry.classPrice ?? config.classPrice
    }
    if (entry.game) {
      gamesCount += 1
      gamesAmount += entry.gamePrice ?? config.gamePrice
    }
    for (const ex of entry.extras) {
      extrasAmount += ex.amount
    }
  }
  return {
    classesCount,
    gamesCount,
    classesAmount,
    gamesAmount,
    extrasAmount,
    total: classesAmount + gamesAmount + extrasAmount,
  }
}