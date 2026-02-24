"use client"

import { useState } from "react"
import { createEquipment } from "@/app/actions/createEquipment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function NewEquipmentPage() {
    const [trackType, setTrackType] = useState('bulk')
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)
        setError(null)

        // Manual loading handling since Server Action redirects on success
        try {
            const result = await createEquipment(formData)
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
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nuovo Articolo</h1>
                <Button asChild variant="outline">
                    <Link href="/equipment">Annulla</Link>
                </Button>
            </div>

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
                                <Input id="name" name="name" required placeholder="Es. Cassa L-Acoustics K2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select name="category" defaultValue="audio">
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
                                            <Input id="brand_model" name="brand_model" placeholder="Es. QL5 Digital Console" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="serial_number">Numero di Serie</Label>
                                            <Input id="serial_number" name="serial_number" placeholder="Es. SN-123456789" />
                                        </div>
                                    </div>

                                    <div className="grid gap-2 pt-2">
                                        <Label htmlFor="document">Scheda Tecnica / Documento (PDF)</Label>
                                        <Input id="document" name="document" type="file" accept=".pdf,.doc,.docx" />
                                        <p className="text-xs text-slate-500">Puoi caricare un file PDF contenente la scheda tecnica, il manuale visivo o la distinta dei componenti.</p>
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
                                        defaultValue="1"
                                        // Forza la quantità a 1 se il pezzo è unico, altrimenti modificabile
                                        readOnly={trackType === 'unique'}
                                        className={trackType === 'unique' ? 'bg-slate-100 text-slate-500' : ''}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="daily_rental_price">Prezzo Noleggio Giornaliero (€)</Label>
                                    <Input id="daily_rental_price" name="daily_rental_price" type="number" step="0.01" min="0" defaultValue="0" required />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600" disabled={isPending}>
                            {isPending ? 'Salvataggio in corso...' : 'Salva Articolo'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
