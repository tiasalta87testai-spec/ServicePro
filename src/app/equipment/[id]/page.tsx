import { getEquipmentById, getEquipmentEvents } from "@/app/actions/equipmentDetail"
import { getMaintenanceList } from "@/app/actions/maintenance"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, ArrowLeft, QrCode, FileText, Weight, Zap, ShieldCheck, Euro, Calendar, Wrench, Truck, RotateCcw } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import MaintenanceSection from "./maintenance-section"
import DeleteEquipmentButton from "./delete-button"

function getConditionBadge(condition: string) {
    switch (condition) {
        case 'ottimo': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">✅ Ottimo</Badge>
        case 'buono': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">🟡 Buono</Badge>
        case 'da_revisionare': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">🔴 Da Revisionare</Badge>
        default: return <Badge variant="outline">-</Badge>
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'draft': return <Badge variant="outline" className="text-slate-600 bg-slate-50">Bozza</Badge>
        case 'confirmed': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Confermato</Badge>
        case 'completed': return <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">Completato</Badge>
        case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Annullato</Badge>
        default: return <Badge variant="outline">{status}</Badge>
    }
}

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
    const equipment = await getEquipmentById(params.id)

    if (!equipment) {
        notFound()
    }

    const maintenanceResult = await getMaintenanceList(params.id)
    const maintenanceList = 'error' in maintenanceResult ? [] : maintenanceResult.data

    const equipmentEvents = await getEquipmentEvents(params.id)
    const activeEventsCount = equipmentEvents.filter((ee: any) => ee.events.status !== 'completed' && ee.events.status !== 'cancelled').length

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/equipment">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{equipment.name}</h1>
                            <Badge variant="secondary" className="capitalize">{equipment.category}</Badge>
                            {equipment.subcategory && <Badge variant="outline" className="capitalize text-slate-500">{equipment.subcategory}</Badge>}
                        </div>
                        {equipment.brand_model && (
                            <p className="text-sm text-slate-500 mt-1">{equipment.brand_model}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <QrCode className="mr-2 h-4 w-4" /> Stampa QR
                    </Button>
                    <Button asChild className="bg-teal-500 hover:bg-teal-600">
                        <Link href={`/equipment/${equipment.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" /> Modifica
                        </Link>
                    </Button>
                    <DeleteEquipmentButton id={equipment.id} />
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="flex w-full overflow-x-auto justify-start md:grid md:grid-cols-4 bg-slate-100/50 p-1 mb-2 scrollbar-none lg:w-[500px]">
                    <TabsTrigger value="details" className="flex-1 min-w-[80px] whitespace-nowrap">Dettagli</TabsTrigger>
                    <TabsTrigger value="specs" className="flex-1 min-w-[100px] whitespace-nowrap">Specifiche</TabsTrigger>
                    <TabsTrigger value="events" className="flex-1 min-w-[80px] whitespace-nowrap">
                        Eventi
                        {activeEventsCount > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-teal-500 text-white">
                                {activeEventsCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="flex-1 min-w-[140px] whitespace-nowrap">
                        Manutenzione
                        {maintenanceList.filter((m: any) => !m.resolved_at).length > 0 && (
                            <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                                {maintenanceList.filter((m: any) => !m.resolved_at).length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Tab Dettagli */}
                <TabsContent value="details" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informazioni Generali</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">Tipologia Tracciamento</dt>
                                    <dd className="mt-1 text-base text-slate-900 capitalize">
                                        {equipment.track_type === 'unique' ? 'Pezzo Singolo (S/N)' :
                                            equipment.track_type === 'bulk' ? 'Quantità' : 'Kit'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">Condizione</dt>
                                    <dd className="mt-1">{getConditionBadge(equipment.condition)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500">Prezzo Noleggio Giornaliero</dt>
                                    <dd className="mt-1 text-base text-slate-900">€ {parseFloat(equipment.daily_rental_price).toFixed(2)}</dd>
                                </div>
                                {equipment.serial_number && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Numero Seriale</dt>
                                        <dd className="mt-1 text-base text-slate-900 font-mono">{equipment.serial_number}</dd>
                                    </div>
                                )}
                                {equipment.qr_code && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Codice QR (ID)</dt>
                                        <dd className="mt-1 text-base text-slate-900 font-mono text-teal-600">{equipment.qr_code}</dd>
                                    </div>
                                )}
                                {equipment.ubicazione && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Ubicazione</dt>
                                        <dd className="mt-1 text-base text-slate-900 flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-slate-400" />
                                            {equipment.ubicazione}
                                        </dd>
                                    </div>
                                )}
                                {equipment.description && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500">Descrizione</dt>
                                        <dd className="mt-1 text-sm text-slate-600 italic">
                                            {equipment.description}
                                        </dd>
                                    </div>
                                )}
                                {equipment.document_url && (
                                    <div className="pt-2">
                                        <Button variant="outline" size="sm" asChild className="text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100">
                                            <a href={equipment.document_url} target="_blank" rel="noopener noreferrer">
                                                <FileText className="mr-2 h-4 w-4" /> Visualizza Scheda Tecnica
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Disponibilità</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Attualmente in magazzino</p>
                                        <p className="text-3xl font-bold text-emerald-600">
                                            {equipment.current_available} <span className="text-lg font-normal text-slate-500">/ {equipment.total_quantity}</span>
                                        </p>
                                    </div>
                                </div>

                                {maintenanceList?.some((m: any) => m.resolved_at) && (
                                    <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-100">
                                        <div>
                                            <p className="text-sm font-medium text-teal-600">Ultima Manutenzione</p>
                                            <p className="text-base font-semibold text-teal-800">
                                                {format(new Date(Math.max(...maintenanceList.filter((m: any) => m.resolved_at).map((m: any) => new Date(m.resolved_at).getTime()))), "dd/MM/yyyy")}
                                            </p>
                                        </div>
                                        <Wrench className="h-6 w-6 text-teal-400" />
                                    </div>
                                )}

                                {/* Progress bar */}
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Utilizzo</span>
                                        <span>{Math.round(((equipment.total_quantity - equipment.current_available) / equipment.total_quantity) * 100)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-teal-500 rounded-full transition-all"
                                            style={{ width: `${((equipment.total_quantity - equipment.current_available) / equipment.total_quantity) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab Specifiche Tecniche */}
                <TabsContent value="specs" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-slate-400" />
                                    Dati Tecnici
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                            <Weight className="h-3 w-3" />
                                            Peso
                                        </div>
                                        <p className="text-lg font-semibold text-slate-800">
                                            {equipment.weight_kg ? `${equipment.weight_kg} kg` : '—'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                            <Zap className="h-3 w-3 text-amber-500" />
                                            Consumo
                                        </div>
                                        <p className="text-lg font-semibold text-slate-800">
                                            {equipment.power_consumption_w ? `${equipment.power_consumption_w} W` : '—'}
                                        </p>
                                    </div>
                                </div>
                                {equipment.notes_maintenance && (
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 mb-1">Note Tecniche</dt>
                                        <dd className="text-sm text-slate-700 whitespace-pre-wrap p-3 bg-slate-50 rounded-lg">
                                            {equipment.notes_maintenance}
                                        </dd>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Euro className="h-5 w-5 text-slate-400" />
                                    Dati Economici
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                            <Euro className="h-3 w-3" />
                                            Prezzo Acquisto
                                        </div>
                                        <p className="text-lg font-semibold text-slate-800">
                                            {equipment.purchase_price ? `€ ${parseFloat(equipment.purchase_price).toFixed(2)}` : '—'}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                            <Calendar className="h-3 w-3" />
                                            Data Acquisto
                                        </div>
                                        <p className="text-lg font-semibold text-slate-800">
                                            {equipment.purchase_date
                                                ? format(new Date(equipment.purchase_date), "dd/MM/yyyy")
                                                : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 mb-1">
                                        <ShieldCheck className="h-3 w-3" />
                                        Valore Assicurativo
                                    </div>
                                    <p className="text-lg font-semibold text-emerald-800">
                                        {equipment.insurance_value ? `€ ${parseFloat(equipment.insurance_value).toFixed(2)}` : '—'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab Eventi */}
                <TabsContent value="events" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-slate-400" />
                                Eventi e Prenotazioni
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {equipmentEvents.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                                    <p className="text-slate-500 italic">Nessun evento associato a questo articolo.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {equipmentEvents.map((ee: any) => {
                                        const ev = ee.events
                                        return (
                                            <div key={ev.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-teal-200 hover:bg-teal-50/30 transition-all group">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <Link href={`/events/${ev.id}`} className="font-semibold text-slate-900 hover:text-teal-600 transition-colors">
                                                            {ev.name}
                                                        </Link>
                                                        {getStatusBadge(ev.status)}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {format(new Date(ev.start_date), "dd MMM yyyy", { locale: it })}
                                                            {ev.end_date && ` - ${format(new Date(ev.end_date), "dd MMM yyyy", { locale: it })}`}
                                                        </span>
                                                        <span className="flex items-center gap-1 font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                                            Q.tà: {ee.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 md:mt-0 flex items-center gap-3">
                                                    <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                                                        {ee.is_loaded ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                                                <Truck className="h-3 w-3 mr-1" /> Caricato
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-slate-400 border-slate-200">
                                                                Prenotato
                                                            </Badge>
                                                        )}
                                                        {ee.is_returned && (
                                                            <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-teal-200">
                                                                <RotateCcw className="h-3 w-3 mr-1" /> Rientrato
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <Button variant="ghost" size="icon" asChild className="group-hover:text-teal-600 group-hover:bg-white border-transparent">
                                                        <Link href={`/events/${ev.id}`}>
                                                            <ArrowLeft className="h-4 w-4 rotate-180" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Manutenzione */}
                <TabsContent value="maintenance" className="mt-6">
                    <MaintenanceSection
                        equipmentId={equipment.id}
                        maintenanceList={maintenanceList}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
