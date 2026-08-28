import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const todayKey = (date: Date = new Date()) => format(date, 'yyyy-MM-dd')

export const fromKey = (key: string) => parseISO(key)

export const monthKey = (date: Date) => format(date, 'yyyy-MM')

export const monthLabel = (date: Date) =>
  format(date, "MMMM 'de' yyyy", { locale: ptBR })

export const shortMonthLabel = (date: Date) =>
  format(date, 'MMM/yy', { locale: ptBR })

export const dayLabel = (key: string) =>
  format(parseISO(key), "dd 'de' MMM", { locale: ptBR })

export const weekdayShort = (date: Date) =>
  format(date, 'EEE', { locale: ptBR })

export const weekdayLong = (date: Date) =>
  format(date, 'EEEE', { locale: ptBR })

export const longDate = (date: Date) =>
  format(date, "EEEE, d 'de' MMMM", { locale: ptBR })

export const buildMonthGrid = (anchor: Date) => {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export const isInMonth = (date: Date, anchor: Date) =>
  isSameMonth(date, anchor)

export const isToday = (date: Date) => isSameDay(date, new Date())

export const dayKey = (date: Date) => format(date, 'yyyy-MM-dd')

export const shiftMonth = (anchor: Date, delta: number) =>
  delta > 0 ? addMonths(anchor, delta) : subMonths(anchor, -delta)

export const dayOfWeekShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const getDayOfWeek = (date: Date) => getDay(date)