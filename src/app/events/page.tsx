import { getEventsList } from "@/app/actions/events"
import { Button } from "@/components/ui/button"
import { Plus, Calendar as CalendarIcon, MapPin, User } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function EventsPage() {
    const response = await getEventsList()

    if ('error' in response) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                Errore caricamento eventi: {response.error}
            </div>
        )
    }

    const events = response.data || []

    // Raggruppa eventi per data di inizio
    const groupedEvents = events.reduce((acc: any, event: any) => {
        const dateKey = format(new Date(event.start_date), "yyyy-MM-dd")
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(event)
        return acc
    }, {})

    // Ordina le date (più recenti o imminenti prima?) 
    // Di solito per gli eventi si preferiscono i più recenti in alto se passati, o i prossimi se futuri.
    // Ordiniamo per data decrescente per ora.
    const sortedDateKeys = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a))

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="outline" className="text-slate-600 bg-slate-50">Bozza</Badge>
            case 'confirmed': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Confermato</Badge>
            case 'completed': return <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">Completato</Badge>
            case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Annullato</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Eventi</h1>
                <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white">
                    <Link href="/events/new">
                        <Plus className="mr-2 h-4 w-4" /> Nuovo Evento
                    </Link>
                </Button>
            </div>

            {sortedDateKeys.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    Nessun evento presente. Creane uno nuovo per iniziare.
                </div>
            ) : (
                sortedDateKeys.map((dateKey) => (
                    <div key={dateKey} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-50 px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                                <span className="text-sm font-bold text-slate-700 capitalize">
                                    {format(new Date(dateKey), "EEEE d MMMM yyyy", { locale: it })}
                                </span>
                            </div>
                            <div className="h-[1px] flex-1 bg-slate-200" />
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {groupedEvents[dateKey].map((event: any) => (
                                <Link key={event.id} href={`/events/${event.id}`}>
                                    <Card className="hover:border-teal-400 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start gap-4">
                                                <CardTitle className="text-lg line-clamp-1">{event.name}</CardTitle>
                                                {getStatusBadge(event.status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-4">
                                            <div className="space-y-2 text-sm text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                                                    <span>
                                                        {format(new Date(event.start_date), "HH:mm")}
                                                        {event.start_date !== event.end_date &&
                                                            ` - ${format(new Date(event.end_date), "d MMM yyyy", { locale: it })}`}
                                                    </span>
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="line-clamp-1">{event.location}</span>
                                                    </div>
                                                )}
                                                {event.clients && (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="line-clamp-1 text-teal-600 font-medium">{event.clients.company_name || event.clients.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}
