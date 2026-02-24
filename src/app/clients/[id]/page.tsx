import { getClientById } from "@/app/actions/clients"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Building2, User, Phone, Mail, MapPin, Receipt, CalendarClock, ExternalLink } from "lucide-react"

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
    const { data, error } = await getClientById(params.id)

    if (error || !data || !data.client) {
        notFound()
    }

    const { client, events } = data

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/clients">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            {client.company_name || client.name}
                            <Badge variant="outline" className={
                                client.client_type === 'company' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    client.client_type === 'agency' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
                                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }>
                                {client.client_type === 'company' ? 'Azienda' : client.client_type === 'agency' ? 'Agenzia' : 'Privato'}
                            </Badge>
                        </h1>
                        {client.company_name && client.name && (
                            <p className="text-slate-500 mt-1 flex items-center gap-1.5">
                                <User className="h-4 w-4" /> Referente: {client.name}
                            </p>
                        )}
                    </div>
                </div>
                <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                    <Link href={`/clients/${client.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" /> Modifica
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Phone className="h-5 w-5 text-slate-400" /> Contatti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {client.email && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                <span className="text-slate-500 text-sm">Email</span>
                                <a href={`mailto:${client.email}`} className="font-medium text-teal-600 hover:underline">{client.email}</a>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                <span className="text-slate-500 text-sm">Telefono</span>
                                <a href={`tel:${client.phone}`} className="font-medium text-slate-900">{client.phone}</a>
                            </div>
                        )}
                        {client.pec_email && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                <span className="text-slate-500 text-sm">PEC</span>
                                <span className="font-medium text-slate-900">{client.pec_email}</span>
                            </div>
                        )}
                        {!client.email && !client.phone && !client.pec_email && (
                            <div className="text-sm text-slate-400 italic py-2">Nessun contatto registrato</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Receipt className="h-5 w-5 text-slate-400" /> Dati Fiscali
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-sm">Partita IVA</span>
                            <span className="font-medium text-slate-900 uppercase">{client.vat_number || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-sm">Codice Fiscale</span>
                            <span className="font-medium text-slate-900 uppercase">{client.tax_code || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-slate-500 text-sm">Codice Univoco (SDI)</span>
                            <span className="font-medium text-slate-900 uppercase">{client.sdi_code || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="h-5 w-5 text-slate-400" /> Sede / Indirizzo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {client.address || client.city || client.province ? (
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                                <p className="font-medium text-slate-900">{client.address}</p>
                                <p className="text-slate-600 mt-1">
                                    {client.zip_code} {client.city} {client.province ? `(${client.province.toUpperCase()})` : ''} - {client.country}
                                </p>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-400 italic py-2">Nessun indirizzo registrato</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarClock className="h-6 w-6 text-teal-600" /> Storico Attività
                    </h2>
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                        {events.length} Event{events.length === 1 ? 'o' : 'i'}
                    </Badge>
                </div>

                <Card>
                    {events.length === 0 ? (
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-slate-100 p-3 rounded-full mb-3">
                                <CalendarClock className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="font-medium text-slate-900">Nessuna attività</p>
                            <p className="text-sm text-slate-500 mt-1">Questo cliente non ha ancora eventi associati.</p>
                        </CardContent>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Evento</th>
                                        <th className="px-6 py-4">Data Inizio</th>
                                        <th className="px-6 py-4">Data Fine</th>
                                        <th className="px-6 py-4">Stato</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4 text-right">Azione</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {events.map((event: any) => (
                                        <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {event.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(event.start_date).toLocaleDateString("it-IT", {
                                                    day: "2-digit", month: "long", year: "numeric"
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(event.end_date).toLocaleDateString("it-IT", {
                                                    day: "2-digit", month: "long", year: "numeric"
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={
                                                    event.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        event.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            'bg-slate-100 text-slate-700 border-slate-200'
                                                }>
                                                    {event.status === 'confirmed' ? 'Confermato' : event.status === 'draft' ? 'Bozza' : 'Completato'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap max-w-[200px] truncate">
                                                {event.location || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" asChild className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                                                    <Link href={`/events/${event.id}`}>
                                                        Vedi <ExternalLink className="h-3 w-3 ml-1" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
