import type { Config, Entry } from '../types'

export interface YearTotals {
  total: number
  classesCount: number
  gamesCount: number
  extrasAmount: number
}

export function yearTotals(
  entries: Record<string, Entry>,
  config: Config,
  anchor: Date,
): YearTotals {
  const year = anchor.getFullYear()

  let classesCount = 0
  let gamesCount = 0
  let classesAmount = 0
  let gamesAmount = 0
  let extrasAmount = 0

  for (const key of Object.keys(entries)) {
    const entryDate = new Date(`${key}T12:00:00`)
    if (entryDate.getFullYear() !== year) continue

    const entry = entries[key]
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
    total: classesAmount + gamesAmount + extrasAmount,
    classesCount,
    gamesCount,
    extrasAmount,
  }
}