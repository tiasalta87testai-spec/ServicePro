"use client"

import { useState, useCallback, useMemo } from 'react'
import { Calendar, momentLocalizer, Views, type View, type NavigateAction } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/it'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css' // Stile custom "Unified Agenda Aesthetic"
import { useRouter } from 'next/navigation'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

moment.locale('it')
const localizer = momentLocalizer(moment)

interface EventData {
    id: string
    name: string
    start_date: string
    end_date: string
    status: string
    clients?: {
        name: string
        company_name?: string
    }
}

interface CalendarClientProps {
    initialEvents: EventData[]
}

export default function CalendarClient({ initialEvents }: CalendarClientProps) {
    const router = useRouter()
    const [date, setDate] = useState(new Date())
    const [view, setView] = useState<View>(Views.MONTH)
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // Mappa eventi dal db e applica filtri stato
    const events = useMemo(() => {
        let filtered = initialEvents
        if (filterStatus !== 'all') {
            filtered = filtered.filter(e => e.status === filterStatus)
        }
        return filtered.map(evt => ({
            id: evt.id,
            title: evt.name,
            start: new Date(evt.start_date),
            end: new Date(evt.end_date),
            status: evt.status,
            clientName: evt.clients?.company_name || evt.clients?.name || 'Vario',
        }))
    }, [initialEvents, filterStatus])

    const handleNavigate = useCallback((newDate: Date) => {
        setDate(newDate)
    }, [])

    const handleViewChange = useCallback((newView: View) => {
        setView(newView)
    }, [])

    const handleSelectEvent = useCallback((event: any) => {
        router.push(`/events/${event.id}`)
    }, [router])

    // Custom components memoized to prevent infinite re-rendering of internal RBC elements
    const { components } = useMemo(() => {
        // Custom Header per giorno in vista mensile (cerchio verde per oggi)
        const CustomDateHeader = ({ date, label }: any) => {
            const isToday = moment(date).isSame(moment(), 'day')
            return (
                <div className="flex justify-start pt-1">
                    <span className={cn(
                        "flex items-center justify-center text-sm font-semibold w-7 h-7",
                        isToday ? "bg-teal-400 text-white rounded-full shadow-sm" : "text-slate-600"
                    )}>
                        {label}
                    </span>
                </div>
            )
        }

        // Custom Event Renderer
        // Custom Event Renderer - Stile 1: Minimal Border
        const CustomEvent = ({ event }: any) => {
            let borderColor = 'border-slate-300' // draft / fallback
            if (event.status === 'confirmed') borderColor = 'border-emerald-500'
            if (event.status === 'completed') borderColor = 'border-teal-500'
            if (event.status === 'cancelled') borderColor = 'border-red-500'

            return (
                <div 
                    className={cn(
                        "flex flex-col h-full border-l-[3px] bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-200 group rounded-r-md",
                        borderColor
                    )} 
                    title={`${moment(event.start).format('HH:mm')} - ${event.title} (${event.clientName})`}
                >
                    <div className="flex items-center gap-1.5 leading-none mb-0.5">
                        <span className="text-[10px] font-bold text-slate-900 shrink-0">
                            {moment(event.start).format('HH:mm')}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-800 truncate">
                            {event.title}
                        </span>
                    </div>
                    
                    {event.clientName && (
                        <div className="text-[10px] text-slate-500 truncate font-medium flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                            {event.clientName}
                        </div>
                    )}
                </div>
            )
        }

        // Custom Toolbar
        const CustomToolbar = (toolbar: any) => {
            const goToBack = () => { toolbar.onNavigate('PREV') }
            const goToNext = () => { toolbar.onNavigate('NEXT') }
            const goToCurrent = () => { toolbar.onNavigate('TODAY') }

            // L'oggetto toolbar.view contiene la vista corrente decisa da rbc
            const activeView = toolbar.view

            return (
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-t-xl gap-4 border-b border-slate-100">
                    {/* SINISTRA: Navigazione Data */}
                    <div className="flex flex-row items-center border border-slate-200 rounded-lg overflow-hidden shadow-sm h-9 bg-white">
                        <button onClick={goToBack} className="px-4 h-full text-sm font-medium text-slate-600 hover:bg-slate-50 border-r border-slate-200 transition-colors">
                            Prec.
                        </button>
                        <button onClick={goToCurrent} className="px-4 h-full text-sm font-bold text-slate-800 hover:bg-slate-50 border-r border-slate-200 transition-colors">
                            Oggi
                        </button>
                        <button onClick={goToNext} className="px-4 h-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            Succ.
                        </button>
                        <div className="hidden md:flex items-center px-4 bg-slate-50 h-full border-l border-slate-200 text-slate-500 font-semibold text-sm capitalize">
                            {moment(toolbar.date).format('MMMM yyyy')}
                        </div>
                    </div>

                    {/* DESTRA: Viste */}
                    <div className="flex flex-row items-center border border-slate-200 rounded-full overflow-hidden shadow-sm p-1 bg-white">
                        {['month', 'week', 'day', 'agenda'].map((v) => {
                            const isActive = activeView === v
                            const labels: Record<string, string> = { month: 'Mese', week: 'Settimana', day: 'Giorno', agenda: 'Lista' }
                            return (
                                <button
                                    key={v}
                                    onClick={() => toolbar.onView(v)}
                                    className={cn(
                                        "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
                                        isActive
                                            ? "bg-slate-800 text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                                    )}
                                >
                                    {labels[v]}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )
        }

        return {
            components: {
                month: { dateHeader: CustomDateHeader },
                event: CustomEvent,
                toolbar: CustomToolbar
            }
        }
    }, [])

    return (
        <div className="custom-calendar-container flex flex-col space-y-4">
            
            {/* Top Filter Bar ispirata alla pill-bar della Navbar Screenshot */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <Filter className="w-3.5 h-3.5" /> STATUS EVENTI
                </span>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setFilterStatus('all')}
                        className={cn(
                            "px-4 py-1.5 bg-white border shadow-sm rounded-full text-xs font-semibold transition-all duration-200",
                            filterStatus === 'all' ? "border-slate-800 text-slate-800 ring-1 ring-slate-800 shadow-md" : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        )}
                    >
                        Tutti
                    </button>

                    <button 
                        onClick={() => setFilterStatus('draft')}
                        className={cn(
                            "px-4 py-1.5 bg-white border rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200",
                            filterStatus === 'draft' ? "border-slate-400 text-slate-800 ring-1 ring-slate-400 shadow-md bg-slate-50" : "border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 shadow-sm"
                        )}
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" /> Bozza
                    </button>

                    <button 
                        onClick={() => setFilterStatus('confirmed')}
                        className={cn(
                            "px-4 py-1.5 bg-white border rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200",
                            filterStatus === 'confirmed' ? "border-[#4ADE80] text-emerald-900 ring-1 ring-[#4ADE80] bg-emerald-50/50 shadow-md" : "border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 shadow-sm"
                        )}
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" /> Confermato
                    </button>

                    <button 
                        onClick={() => setFilterStatus('completed')}
                        className={cn(
                            "px-4 py-1.5 bg-white border rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200",
                            filterStatus === 'completed' ? "border-[#2DD4BF] text-teal-900 ring-1 ring-[#2DD4BF] bg-teal-50/50 shadow-md" : "border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 shadow-sm"
                        )}
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" /> Completato
                    </button>
                </div>
            </div>

            {/* Calendario React Big Calendar con Layout unificato */}
            <div className="h-[750px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%', flex: 1 }}
                    date={date}
                    view={view}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    onNavigate={handleNavigate}
                    onView={handleViewChange}
                    onSelectEvent={handleSelectEvent}
                    components={components}
                    messages={{
                        noEventsInRange: "Nessun evento programmato in questa data.",
                        showMore: (total) => `+${total} altri`
                    }}
                />
            </div>
        </div>
    )
}
