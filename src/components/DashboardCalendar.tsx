"use client"

import { useState, useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer, Views, type View, type NavigateAction } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/it'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useRouter } from 'next/navigation'

moment.locale('it')
const localizer = momentLocalizer(moment)

interface EventData {
    id: string
    name: string
    start_date: string
    end_date: string
    status: string
}

interface DashboardCalendarProps {
    initialEvents?: EventData[]
}

export function DashboardCalendar({ initialEvents = [] }: DashboardCalendarProps) {
    const router = useRouter()
    const [date, setDate] = useState(new Date())
    const [view, setView] = useState<View>(Views.MONTH)

    // Map db events to react-big-calendar format
    const events = useMemo(() => {
        return initialEvents.map(evt => ({
            id: evt.id,
            title: evt.name,
            start: new Date(evt.start_date),
            end: new Date(evt.end_date),
            status: evt.status,
        }))
    }, [initialEvents])

    const handleNavigate = useCallback((newDate: Date, _view: View, action: NavigateAction) => {
        setDate(newDate)
    }, [])

    const handleViewChange = useCallback((newView: View) => {
        setView(newView)
    }, [])

    const handleSelectEvent = useCallback((event: any) => {
        router.push(`/events/${event.id}`)
    }, [router])

    const eventStyleGetter = useCallback((event: any, start: Date, end: Date, isSelected: boolean) => {
        let backgroundColor = '#3b82f6' // default blue

        switch (event.status) {
            case 'draft':
                backgroundColor = '#94a3b8' // slate
                break
            case 'confirmed':
                backgroundColor = '#10b981' // emerald
                break
            case 'completed':
                backgroundColor = '#6366f1' // indigo
                break
            case 'cancelled':
                backgroundColor = '#ef4444' // red
                break
        }

        const style = {
            backgroundColor,
            borderRadius: '4px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block'
        }
        return { style }
    }, [])

    return (
        <div className="h-[500px] w-full">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                date={date}
                view={view}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                messages={{
                    next: "Succ",
                    previous: "Prec",
                    today: "Oggi",
                    month: "Mese",
                    week: "Settimana",
                    day: "Giorno",
                    agenda: "Agenda",
                    noEventsInRange: "Nessun evento in questo periodo.",
                    showMore: (total: number) => `+${total} altri`,
                }}
            />
        </div>
    )
}
