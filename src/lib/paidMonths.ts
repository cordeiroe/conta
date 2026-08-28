export type PaidMonthsMap = Record<string, string>

export function markMonthPaid(
  current: PaidMonthsMap,
  monthKey: string,
): PaidMonthsMap {
  if (current[monthKey]) return current
  return { ...current, [monthKey]: new Date().toISOString() }
}

export function unmarkMonthPaid(
  current: PaidMonthsMap,
  monthKey: string,
): PaidMonthsMap {
  if (!(monthKey in current)) return current
  const next = { ...current }
  delete next[monthKey]
  return next
}

export function isMonthPaid(
  current: PaidMonthsMap,
  monthKey: string,
): boolean {
  return monthKey in current
}

export function getPaidMonths(current: PaidMonthsMap): string[] {
  return Object.keys(current).sort()
}