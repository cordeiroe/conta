export type Currency = 'BRL' | 'EUR' | 'USD'

export type ActivityType = 'class' | 'game'

export interface Extra {
  id: string
  label: string
  amount: number
  category?: string
}

export const EXTRA_CATEGORIES = ['grip', 'bola', 'avulsa', 'outro'] as const

export type ExtraCategory = (typeof EXTRA_CATEGORIES)[number]

export interface Entry {
  date: string
  class: boolean
  classPrice?: number
  game: boolean
  gamePrice?: number
  extras: Extra[]
  note?: string
  updatedAt: string
}

export interface ScheduleRule {
  id: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  time: string
  type: ActivityType
  enabled: boolean
}

export interface Config {
  classPrice: number
  gamePrice: number
  currency: Currency
  professorName: string
  notificationHourOffset: number
  schedule: ScheduleRule[]
  updatedAt?: string
}

export interface MonthTotals {
  classesCount: number
  gamesCount: number
  classesAmount: number
  gamesAmount: number
  extrasAmount: number
  total: number
}