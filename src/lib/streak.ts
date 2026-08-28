import { format } from 'date-fns'
import type { Entry } from '../types'

export function currentClassStreak(
  entries: Record<string, Entry>,
  today: Date,
): number {
  const todayKey = format(today, 'yyyy-MM-dd')

  let cursor = new Date(today)
  const todayHasClass = entries[todayKey]?.class === true

  if (!todayHasClass) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (true) {
    const key = format(cursor, 'yyyy-MM-dd')
    if (entries[key]?.class !== true) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}