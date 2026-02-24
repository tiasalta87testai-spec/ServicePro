import { getEquipmentById } from "@/app/actions/equipmentDetail"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, ArrowLeft, QrCode, FileText } from "lucide-react"
import Link from "next/link"

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
    const equipment = await getEquipmentById(params.id)

    if (!equipment) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/equipment">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{equipment.name}</h1>
                    <Badge variant="secondary" className="capitalize">{equipment.category}</Badge>
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
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Dettagli</CardTitle>
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
                            <dt className="text-sm font-medium text-slate-500">Prezzo Noleggio Giornaliero</dt>
                            <dd className="mt-1 text-base text-slate-900">€ {equipment.daily_rental_price.toFixed(2)}</dd>
                        </div>
                        {equipment.brand_model && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Tipologia / Modello</dt>
                                <dd className="mt-1 text-base text-slate-900">{equipment.brand_model}</dd>
                            </div>
                        )}
                        {equipment.serial_number && (
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Numero Seriale</dt>
                                <dd className="mt-1 text-base text-slate-900 font-mono">{equipment.serial_number}</dd>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
