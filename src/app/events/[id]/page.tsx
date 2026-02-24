import { getEventById } from "@/app/actions/eventDetail"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Calendar, MapPin, User, Send, CheckCircle2, Box, QrCode } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { ScannerPlaceholder } from "./scanner"
import { GenerateQuoteButton } from "@/components/GenerateQuoteButton"

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const result = await getEventById(params.id)

    if (!result) {
        notFound()
    }

    const { event, packingList } = result

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="outline" className="text-slate-600 bg-slate-50">Bozza</Badge>
            case 'confirmed': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Confermato</Badge>
            case 'completed': return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">Completato</Badge>
            case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Annullato</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const quoteData = {
        eventName: event.name,
        eventId: event.id,
        clientName: event.clients?.company_name || event.clients?.name || 'N/A',
        clientEmail: event.clients?.email || '',
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location || '',
        packingList: packingList.map((item: any) => ({
            name: item.equipment?.name || 'Articolo',
            category: item.equipment?.category || '-',
            quantity: item.quantity,
            dailyPrice: item.equipment?.daily_rental_price || 0,
        })),
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/events">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{event.name}</h1>
                            {getStatusBadge(event.status)}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            ID: <span className="font-mono">{event.id.split('-')[0]}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <GenerateQuoteButton data={quoteData} />
                    <Button asChild className="bg-teal-500 hover:bg-teal-600">
                        <Link href={`/events/${event.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Modifica
                        </Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="info">Info Evento</TabsTrigger>
                    <TabsTrigger value="packing">Packing List</TabsTrigger>
                    <TabsTrigger value="logistics">Note & Logistica</TabsTrigger>
                </TabsList>

                {/* Tab Informazioni Generali */}
                <TabsContent value="info" className="mt-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Dettagli Principali</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Date Evento</p>
                                        <p className="text-sm text-slate-600">
                                            {format(new Date(event.start_date), "d MMMM yyyy", { locale: it })}
                                            {event.start_date !== event.end_date && ` - ${format(new Date(event.end_date), "d MMMM yyyy", { locale: it })}`}
                                        </p>
                                    </div>
                                </div>

                                {event.location && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Luogo</p>
                                            <p className="text-sm text-slate-600">{event.location}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <Box className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Uscita / Rientro Magazzino</p>
                                        <p className="text-sm text-slate-600">
                                            OUT: {format(new Date(event.out_date), "dd/MM/yyyy")} &bull; IN: {format(new Date(event.in_date), "dd/MM/yyyy")}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cliente Referente</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {event.clients ? (
                                    <div className="flex items-start gap-3">
                                        <User className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-base font-medium text-slate-900">{event.clients.company_name || event.clients.name}</p>
                                            <p className="text-sm text-slate-600">{event.clients.email}</p>
                                            {event.clients.phone && <p className="text-sm text-slate-600">{event.clients.phone}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Nessun cliente associato (da definire).</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab Packing List */}
                <TabsContent value="packing" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Packing List & Logistica</CardTitle>
                                <CardDescription>Scannerizza i QR Code per caricare l&apos;attrezzatura richiesta.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" className="hidden sm:flex">
                                <QrCode className="mr-2 h-4 w-4" /> Avvia Scanner Telecamera
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ScannerPlaceholder />

                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 font-medium text-slate-600">Articolo</th>
                                            <th className="px-4 py-3 font-medium text-slate-600">Stato</th>
                                            <th className="px-4 py-3 font-medium text-slate-600 text-right">Q.t&agrave; Richiesta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {packingList.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                                                    Nessun articolo assegnato a questo evento. Apri il preventivo per aggiungere materiale.
                                                </td>
                                            </tr>
                                        ) : (
                                            packingList.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-slate-900">{item.equipment.name}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{item.equipment.category}</Badge>
                                                            {item.equipment.serial_number && <span>SN: {item.equipment.serial_number}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.is_returned ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                                                                <CheckCircle2 className="h-3 w-3" /> Rientrato
                                                            </span>
                                                        ) : item.is_loaded ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                                                                <CheckCircle2 className="h-3 w-3" /> Caricato in Furgone
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                                                <Box className="h-3 w-3" /> Da Preparare
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                        {item.quantity}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Note e Messaging */}
                <TabsContent value="logistics" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comunicazioni Team</CardTitle>
                            <CardDescription>Invia notifiche via WhatsApp ai tecnici assegnati.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                                <Send className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                                <h3 className="text-sm font-medium text-slate-900">Nessun tecnico assegnato</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                    Assegna membri del team per abilitare le comunicazioni logistiche e i reminder automatici.
                                </p>
                                <Button variant="outline" className="mt-4">Assegna Personale</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
