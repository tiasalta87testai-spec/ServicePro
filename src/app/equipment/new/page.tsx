"use client"

import { useState } from "react"
import { createEquipment } from "@/app/actions/createEquipment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { AlertCircle, Wrench, Weight, Zap, ShieldCheck, Euro } from "lucide-react"

const SUBCATEGORIES: Record<string, string[]> = {
    audio: ['Mixer', 'Casse', 'Amplificatori', 'Microfoni', 'Cavi Audio', 'DI Box', 'Monitor', 'Processori', 'Subwoofer', 'In-Ear', 'Altro'],
    luci: ['Fari LED', 'Moving Head', 'Dimmer', 'Controller DMX', 'Americane', 'Strobo', 'Barre LED', 'Laser', 'Follow Spot', 'Altro'],
    video: ['Proiettori', 'Schermi', 'LED Wall', 'Videocamere', 'Switcher', 'Monitor Video', 'Media Server', 'Altro'],
    strutture: ['Trussi', 'Palchi', 'Transenne', 'Gazebo', 'Pedane', 'Torri', 'Tetti', 'Ground Support', 'Altro'],
    servizio: ['Generatori', 'Cavi Elettrici', 'Multiprese', 'Rack', 'Flight case', 'Carrelli', 'Altro'],
}

export default function NewEquipmentPage() {
    const [trackType, setTrackType] = useState('bulk')
    const [category, setCategory] = useState('audio')
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const router = require('next/navigation').useRouter()

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)
        setError(null)

        try {
            const result = await createEquipment(formData)
            if (result?.error) {
                setError(result.error)
                setIsPending(false)
            } else {
                router.push('/equipment')
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

            <form action={handleSubmit} className="space-y-6">
                {error && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Informazioni Base */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informazioni Base</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome Articolo *</Label>
                            <Input id="name" name="name" required placeholder="Es. Cassa L-Acoustics K2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="brand_model">Marca / Modello</Label>
                            <Input id="brand_model" name="brand_model" placeholder="Es. L-Acoustics K2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria *</Label>
                                <Select name="category" defaultValue="audio" onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="audio">🔊 Audio</SelectItem>
                                        <SelectItem value="luci">💡 Luci</SelectItem>
                                        <SelectItem value="video">📺 Video</SelectItem>
                                        <SelectItem value="strutture">🏗️ Strutture</SelectItem>
                                        <SelectItem value="servizio">⚡ Servizio</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subcategory">Sottocategoria</Label>
                                <Select name="subcategory" key={category}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(SUBCATEGORIES[category] || []).map((sub) => (
                                            <SelectItem key={sub} value={sub.toLowerCase()}>{sub}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="track_type">Tracciamento *</Label>
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

                            <div className="grid gap-2">
                                <Label htmlFor="condition">Condizione</Label>
                                <Select name="condition" defaultValue="ottimo">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleziona..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ottimo">✅ Ottimo</SelectItem>
                                        <SelectItem value="buono">🟡 Buono</SelectItem>
                                        <SelectItem value="da_revisionare">🔴 Da Revisionare</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Campi condizionali per tracciamento Singolo */}
                        {trackType === 'unique' && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                                <h4 className="font-semibold text-sm text-slate-800">Dettagli Pezzo Singolo</h4>
                                <div className="grid gap-2">
                                    <Label htmlFor="serial_number">Numero di Serie</Label>
                                    <Input id="serial_number" name="serial_number" placeholder="Es. SN-123456789" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="document">Scheda Tecnica / Documento (PDF)</Label>
                                    <Input id="document" name="document" type="file" accept=".pdf,.doc,.docx" />
                                    <p className="text-xs text-slate-500">Puoi caricare un file PDF contenente la scheda tecnica o manuale.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="total_quantity">Quantità Totale *</Label>
                                <Input
                                    id="total_quantity"
                                    name="total_quantity"
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    readOnly={trackType === 'unique'}
                                    className={trackType === 'unique' ? 'bg-slate-100 text-slate-500' : ''}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="daily_rental_price">Prezzo Noleggio/GG (€) *</Label>
                                <Input id="daily_rental_price" name="daily_rental_price" type="number" step="0.01" min="0" defaultValue="0" required />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Specifiche Tecniche */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-slate-400" />
                            Specifiche Tecniche
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="weight_kg" className="flex items-center gap-1.5">
                                    <Weight className="h-3.5 w-3.5 text-slate-400" />
                                    Peso (kg)
                                </Label>
                                <Input id="weight_kg" name="weight_kg" type="number" step="0.1" min="0" placeholder="Es. 12.5" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="power_consumption_w" className="flex items-center gap-1.5">
                                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                                    Consumo (Watt)
                                </Label>
                                <Input id="power_consumption_w" name="power_consumption_w" type="number" min="0" placeholder="Es. 350" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes_maintenance">Note Tecniche / Manutenzione</Label>
                            <Textarea id="notes_maintenance" name="notes_maintenance" placeholder="Appunti sulla manutenzione, particolarità dell'articolo..." rows={3} />
                        </div>
                    </CardContent>
                </Card>

                {/* Dati Economici */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Euro className="h-5 w-5 text-slate-400" />
                            Dati Economici
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="purchase_price">Prezzo Acquisto (€)</Label>
                                <Input id="purchase_price" name="purchase_price" type="number" step="0.01" min="0" placeholder="Es. 2500.00" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="purchase_date">Data Acquisto</Label>
                                <Input id="purchase_date" name="purchase_date" type="date" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="insurance_value" className="flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                Valore Assicurativo (€)
                            </Label>
                            <Input id="insurance_value" name="insurance_value" type="number" step="0.01" min="0" placeholder="Es. 3000.00" />
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600" disabled={isPending}>
                    {isPending ? 'Salvataggio in corso...' : 'Salva Articolo'}
                </Button>
            </form>
        </div>
    )
}
