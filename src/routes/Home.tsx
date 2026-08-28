import { useState } from 'react'
import { TodayCard } from '../components/TodayCard'
import { MonthGrid } from '../components/MonthGrid'
import { EntrySheet } from '../components/EntrySheet'
import { useContaStore } from '../store/useContaStore'
import type { ActivityType } from '../types'
import { todayKey } from '../lib/dates'

export function Home() {
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const [openDate, setOpenDate] = useState<string | null>(null)
  const toggleActivity = useContaStore((s) => s.toggleActivity)
  const entries = useContaStore((s) => s.entries)

  const handleQuickAction = (type: ActivityType) => {
    const today = todayKey()
    if (entries[today]?.[type]) {
      toggleActivity(today, type)
    } else {
      toggleActivity(today, type)
      setOpenDate(today)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 pb-24 pt-6">
      <TodayCard
        onQuickAction={handleQuickAction}
        onOpenEntry={setOpenDate}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <MonthGrid
          anchor={anchor}
          onChangeAnchor={setAnchor}
          onSelectDay={setOpenDate}
        />
      </div>

      <p className="text-center text-xs text-slate-400">
        Toque em qualquer dia para editar ou registrar retroativamente.
      </p>

      {openDate && (
        <EntrySheet dateKey={openDate} onClose={() => setOpenDate(null)} />
      )}
    </div>
  )
}