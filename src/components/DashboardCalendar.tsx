"use client"

import { useState, useCallback } from 'react'
import { Calendar, momentLocalizer, Views, type View, type NavigateAction } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/it'
import 'react-big-calendar/lib/css/react-big-calendar.css'

moment.locale('it')
const localizer = momentLocalizer(moment)

export function DashboardCalendar() {
    const [date, setDate] = useState(new Date())
    const [view, setView] = useState<View>(Views.MONTH)

    const events = [
        {
            title: 'Setup Palco Principale',
            start: new Date(new Date().setHours(8, 0, 0)),
            end: new Date(new Date().setHours(18, 0, 0)),
            resourceId: 1,
        }
    ]

    const handleNavigate = useCallback((newDate: Date, _view: View, action: NavigateAction) => {
        setDate(newDate)
    }, [])

    const handleViewChange = useCallback((newView: View) => {
        setView(newView)
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
