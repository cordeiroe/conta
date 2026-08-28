import type { Config, Entry } from '../types'
import { formatMoney } from './totals'
import { dayLabel, monthLabel, monthKey, fromKey } from './dates'

export const buildWhatsappMessage = (
  entries: Record<string, Entry>,
  config: Config,
  anchor: Date,
): string => {
  const target = monthKey(anchor)
  const keys = Object.keys(entries)
    .filter((k) => monthKey(fromKey(k)) === target)
    .sort()

  const lines: string[] = []
  lines.push(`*Conta de ${monthLabel(anchor)}*`)
  if (config.professorName) {
    lines.push(`Prof: ${config.professorName}`)
  }
  lines.push('')

  let classes = 0
  let games = 0
  let classesAmount = 0
  let gamesAmount = 0
  let extrasAmount = 0
  const extrasList: { date: string; label: string; amount: number }[] = []

  for (const key of keys) {
    const e = entries[key]
    const parts: string[] = []
    if (e.class) {
      classes += 1
      const price = e.classPrice ?? config.classPrice
      classesAmount += price
      parts.push('aula')
    }
    if (e.game) {
      games += 1
      const price = e.gamePrice ?? config.gamePrice
      gamesAmount += price
      parts.push('jogo')
    }
    if (e.extras.length) {
      for (const ex of e.extras) {
        extrasAmount += ex.amount
        extrasList.push({ date: dayLabel(key), label: ex.label, amount: ex.amount })
      }
    }
    if (parts.length || e.extras.length) {
      lines.push(`• ${dayLabel(key)} — ${parts.join(' + ') || 'extras'}`)
    }
  }

  lines.push('')
  lines.push('*Resumo*')
  if (classes) lines.push(`Aulas: ${classes} × ${formatMoney(config.classPrice, config.currency)} = ${formatMoney(classesAmount, config.currency)}`)
  if (games) lines.push(`Jogos: ${games} × ${formatMoney(config.gamePrice, config.currency)} = ${formatMoney(gamesAmount, config.currency)}`)
  if (extrasList.length) {
    lines.push('Extras:')
    for (const ex of extrasList) {
      lines.push(`  - ${ex.date}: ${ex.label} ${formatMoney(ex.amount, config.currency)}`)
    }
  }
  const total = classesAmount + gamesAmount + extrasAmount
  lines.push('')
  lines.push(`*Total: ${formatMoney(total, config.currency)}*`)

  return lines.join('\n')
}