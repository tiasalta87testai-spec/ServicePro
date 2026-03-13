import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format, isSameDay, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'

type Event = {
  id: string
  name: string
  start_date: string
  end_date: string | null
  location: string | null
  status: string
}

const statusMap: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Bozza', cls: 'bg-slate-500/20 text-slate-300' },
  confirmed: { label: 'Confermato', cls: 'bg-emerald-500/20 text-emerald-400' },
  completed: { label: 'Completato', cls: 'bg-teal-500/20 text-teal-400' },
  cancelled: { label: 'Annullato', cls: 'bg-red-500/20 text-red-400' },
}

export default function CalendarPage() {
  const { tenantId } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchEvents()

    const channel = supabase
      .channel('events-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchEvents())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tenantId])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('id, name, start_date, end_date, location, status')
      .order('start_date', { ascending: true })
    setEvents(data ?? [])
    setLoading(false)
  }

  const eventsOnDate = events.filter(e => {
    const start = parseISO(e.start_date)
    return isSameDay(start, selectedDate)
  })

  const eventDates = events.map(e => parseISO(e.start_date))

  function tileContent({ date }: { date: Date }) {
    const hasEvent = eventDates.some(d => isSameDay(d, date))
    if (!hasEvent) return null
    return <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)] mx-auto mt-0.5" />
  }

  return (
    <div className="h-full flex flex-col safe-top pb-20">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
        </p>
      </div>

      {/* Calendar */}
      <div className="px-4 mb-4">
        <div className="glass p-4">
          <Calendar
            value={selectedDate}
            onChange={(val) => setSelectedDate(val as Date)}
            locale="it-IT"
            tileContent={tileContent}
            prev2Label={null}
            next2Label={null}
          />
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 px-4 overflow-y-auto no-scrollbar">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">
          Eventi del giorno ({eventsOnDate.length})
        </h2>
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : eventsOnDate.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <p className="text-[var(--color-text-muted)] text-sm">Nessun evento in questa data</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {eventsOnDate.map((ev, i) => {
                const st = statusMap[ev.status] ?? statusMap.draft
                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-base">{ev.name}</h3>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {format(parseISO(ev.start_date), 'HH:mm')}
                        {ev.end_date && ` – ${format(parseISO(ev.end_date), 'HH:mm')}`}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3.5 h-3.5" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
