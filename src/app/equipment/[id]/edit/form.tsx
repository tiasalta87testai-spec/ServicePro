"use client"

import { useState } from "react"
import { updateEquipment } from "@/app/actions/updateEquipment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { AlertCircle, FileText } from "lucide-react"

export default function EditEquipmentForm({ equipment }: { equipment: any }) {
    const [trackType, setTrackType] = useState(equipment.track_type)
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)
        setError(null)

        try {
            const result = await updateEquipment(equipment.id, formData)
            if (result?.error) {
                setError(result.error)
                setIsPending(false)
            }
        } catch (err) {
            setError("Si è verificato un errore inaspettato")
            setIsPending(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dettagli Articolo</CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome Articolo</Label>
                            <Input id="name" name="name" required defaultValue={equipment.name} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Select name="category" defaultValue={equipment.category}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="audio">Audio</SelectItem>
                                        <SelectItem value="luci">Luci</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="strutture">Strutture</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="track_type">Tracciamento</Label>
                                <Select name="track_type" defaultValue={trackType} onValueChange={setTrackType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unique">Pezzo Singolo (S/N)</SelectItem>
                                        <SelectItem value="bulk">Quantità</SelectItem>
                                        <SelectItem value="kit">Kit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Campi condizionali per tracciamento Singolo */}
                        {trackType === 'unique' && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                                <h4 className="font-semibold text-sm text-slate-800">Dettagli Pezzo Singolo</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="brand_model">Tipologia / Modello</Label>
                                        <Input id="brand_model" name="brand_model" defaultValue={equipment.brand_model || ''} placeholder="Es. QL5 Digital Console" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="serial_number">Numero di Serie</Label>
                                        <Input id="serial_number" name="serial_number" defaultValue={equipment.serial_number || ''} placeholder="Es. SN-123456789" />
                                    </div>
                                </div>

                                <div className="grid gap-2 pt-2">
                                    <Label htmlFor="document">Scheda Tecnica / Documento (PDF)</Label>
                                    <div className="flex items-center gap-3">
                                        <Input id="document" name="document" type="file" accept=".pdf,.doc,.docx" className="flex-1" />
                                        {equipment.document_url && (
                                            <Button variant="outline" size="icon" type="button" asChild title="Visualizza documento attuale">
                                                <a href={equipment.document_url} target="_blank" rel="noopener noreferrer">
                                                    <FileText className="h-4 w-4 text-teal-600" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {equipment.document_url
                                            ? "Carica un nuovo file per sostituire il documento esistente."
                                            : "Puoi caricare un file PDF contenente la scheda tecnica, il manuale visivo o la distinta dei componenti."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="total_quantity">Quantità Totale</Label>
                                <Input
                                    id="total_quantity"
                                    name="total_quantity"
                                    type="number"
                                    min="1"
                                    defaultValue={trackType === 'unique' ? 1 : equipment.total_quantity}
                                    readOnly={trackType === 'unique'}
                                    className={trackType === 'unique' ? 'bg-slate-100 text-slate-500' : ''}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="daily_rental_price">Prezzo Noleggio Giornaliero (€)</Label>
                                <Input id="daily_rental_price" name="daily_rental_price" type="number" step="0.01" min="0" defaultValue={equipment.daily_rental_price} required />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600" disabled={isPending}>
                        {isPending ? 'Salvataggio in corso...' : 'Salva Modifiche'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
