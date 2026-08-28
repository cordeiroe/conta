import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import type { Config, Entry, MonthTotals } from '../types'

export function weeklyTotals(
  entries: Record<string, Entry>,
  config: Config,
  anchor: Date,
): MonthTotals {
  const start = startOfWeek(anchor, { weekStartsOn: 0 })
  const end = endOfWeek(anchor, { weekStartsOn: 0 })

  let classesCount = 0
  let gamesCount = 0
  let classesAmount = 0
  let gamesAmount = 0
  let extrasAmount = 0

  for (const key of Object.keys(entries)) {
    const entryDate = new Date(`${key}T12:00:00`)
    if (
      !isWithinInterval(entryDate, { start, end })
    ) {
      continue
    }
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
    classesCount,
    gamesCount,
    classesAmount,
    gamesAmount,
    extrasAmount,
    total: classesAmount + gamesAmount + extrasAmount,
  }
}