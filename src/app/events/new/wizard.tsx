"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronRight, ChevronLeft, Search, Plus, Minus, Trash2, Package, Speaker, Lightbulb, Monitor, Wrench } from "lucide-react"
import { useRouter } from "next/navigation"

type EquipmentItem = {
    id: string
    name: string
    category: string
    track_type: string
    total_quantity: number
    current_available: number
    daily_rental_price: number
}

type ClientItem = {
    id: string
    company_name: string
    name: string
    email: string
    phone: string
    client_type: string
}

type SelectedEquipment = {
    equipment: EquipmentItem
    quantity: number
}

const steps = [
    { id: '1', name: 'Dettagli' },
    { id: '2', name: 'Cliente' },
    { id: '3', name: 'Attrezzatura' },
    { id: '4', name: 'Conferma' }
]

const categoryIcons: Record<string, React.ReactNode> = {
    audio: <Speaker className="h-4 w-4" />,
    luci: <Lightbulb className="h-4 w-4" />,
    video: <Monitor className="h-4 w-4" />,
    strutture: <Wrench className="h-4 w-4" />,
}

const categoryColors: Record<string, string> = {
    audio: "bg-blue-100 text-blue-700",
    luci: "bg-amber-100 text-amber-700",
    video: "bg-purple-100 text-purple-700",
    strutture: "bg-slate-100 text-slate-700",
}

interface EventWizardProps {
    equipment: EquipmentItem[]
    clients: ClientItem[]
    initialData?: {
        id: string
        name: string
        start_date: string
        end_date: string
        client_id: string | null
        location: string | null
        notes: string | null
        equipment: SelectedEquipment[]
    }
}


export function EventWizard({ equipment, clients, initialData }: EventWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Form state
    const [eventName, setEventName] = useState(initialData?.name || "")
    const [startDate, setStartDate] = useState(initialData?.start_date || "")
    const [endDate, setEndDate] = useState(initialData?.end_date || "")
    const [notes, setNotes] = useState(initialData?.notes || "")
    const [selectedClientId, setSelectedClientId] = useState<string>(initialData?.client_id || "")
    const [location, setLocation] = useState(initialData?.location || "")

    // Equipment state
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>(initialData?.equipment || [])

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const addEquipment = (item: EquipmentItem) => {
        const existing = selectedEquipment.find(s => s.equipment.id === item.id)
        if (existing) {
            setSelectedEquipment(prev =>
                prev.map(s => s.equipment.id === item.id
                    ? { ...s, quantity: Math.min(s.quantity + 1, item.current_available) }
                    : s
                )
            )
        } else {
            setSelectedEquipment(prev => [...prev, { equipment: item, quantity: 1 }])
        }
    }

    const updateQuantity = (equipmentId: string, delta: number) => {
        setSelectedEquipment(prev =>
            prev.map(s => {
                if (s.equipment.id !== equipmentId) return s
                const newQty = s.quantity + delta
                if (newQty <= 0) return s
                if (newQty > s.equipment.current_available) return s
                return { ...s, quantity: newQty }
            })
        )
    }

    const removeEquipment = (equipmentId: string) => {
        setSelectedEquipment(prev => prev.filter(s => s.equipment.id !== equipmentId))
    }

    const totalDays = startDate && endDate
        ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 1

    const totalPrice = selectedEquipment.reduce(
        (sum, s) => sum + s.quantity * s.equipment.daily_rental_price * totalDays, 0
    )

    const selectedClient = clients.find(c => c.id === selectedClientId)

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1)
        }
    }

    const handleSave = () => {
        startTransition(async () => {
            const payload = {
                name: eventName,
                start_date: startDate,
                end_date: endDate || startDate,
                client_id: selectedClientId && selectedClientId !== "none" ? selectedClientId : null,
                location,
                notes,
                equipment: selectedEquipment.map(s => ({
                    equipment_id: s.equipment.id,
                    quantity: s.quantity,
                })),
            }

            if (initialData?.id) {
                const { updateEvent } = await import("@/app/actions/updateEvent")
                const result = await updateEvent(initialData.id, payload)
                if (result.success) {
                    router.push(`/events/${initialData.id}`)
                } else {
                    alert(result.error || "Errore durante l'aggiornamento")
                }
            } else {
                const { createEvent } = await import("@/app/actions/createEvent")
                const result = await createEvent(payload)

                if (result.success) {
                    router.push(`/events/${result.eventId}`)
                } else {
                    alert(result.error || "Errore durante il salvataggio")
                }
            }
        })
    }


    const isStep1Valid = eventName.trim() !== "" && startDate !== ""

    return (
        <div className="space-y-8">
            {/* ProgressBar */}
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center justify-between w-full">
                    {steps.map((step, stepIdx) => (
                        <li key={step.name} className="flex flex-col items-center flex-1 relative">
                            {stepIdx < steps.length - 1 && (
                                <div className="absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5">
                                    <div className={`h-full ${stepIdx < currentStep ? 'bg-teal-500' : 'bg-slate-200'}`} />
                                </div>
                            )}
                            <div
                                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${stepIdx < currentStep
                                    ? 'bg-teal-500'
                                    : stepIdx === currentStep
                                        ? 'border-2 border-teal-500 bg-white'
                                        : 'border-2 border-slate-300 bg-white'
                                    }`}
                            >
                                {stepIdx < currentStep ? (
                                    <Check className="h-5 w-5 text-white" />
                                ) : (
                                    <span className={`text-xs font-semibold ${stepIdx === currentStep ? 'text-teal-500' : 'text-slate-500'}`}>
                                        {step.id}
                                    </span>
                                )}
                            </div>
                            <span className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${stepIdx <= currentStep ? 'text-slate-900' : 'text-slate-500'}`}>
                                {step.name}
                            </span>
                        </li>
                    ))}
                </ol>
            </nav>

            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>{steps[currentStep].name}</CardTitle>
                        <CardDescription>
                            {currentStep === 0 && "Inserisci i dettagli base del nuovo evento."}
                            {currentStep === 1 && "Seleziona il cliente e la location dell'evento."}
                            {currentStep === 2 && "Seleziona attrezzatura dal magazzino per questo evento."}
                            {currentStep === 3 && "Verifica il riepilogo e salva l'evento."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Step 1: Dettagli */}
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Nome Evento *</Label>
                                    <Input placeholder="Es. Matrimonio Rossi" value={eventName} onChange={e => setEventName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Data Inizio *</Label>
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Data Fine</Label>
                                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Note Interne</Label>
                                    <Textarea placeholder="Annotazioni specifiche per il service..." value={notes} onChange={e => setNotes(e.target.value)} />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Cliente */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Seleziona Cliente</Label>
                                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleziona un cliente..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nessun cliente (definire poi)</SelectItem>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.company_name || c.name} {c.client_type && `(${c.client_type})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {selectedClient && (
                                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
                                        <p className="font-medium">{selectedClient.company_name}</p>
                                        <p>{selectedClient.name} &bull; {selectedClient.email}</p>
                                    </div>
                                )}
                                <div className="grid gap-2">
                                    <Label>Indirizzo Location</Label>
                                    <Input placeholder="Via Roma 1, Milano" value={location} onChange={e => setLocation(e.target.value)} />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Equipment */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                {/* Search & Filter */}
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Cerca attrezzatura..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tutte le Categorie</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                            <SelectItem value="luci">Luci</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="strutture">Strutture</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Equipment Grid */}
                                <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                                    {filteredEquipment.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                            <Package className="mx-auto h-6 w-6 mb-2 text-slate-400" />
                                            Nessun articolo trovato nel magazzino.
                                        </div>
                                    ) : (
                                        filteredEquipment.map(item => {
                                            const isSelected = selectedEquipment.some(s => s.equipment.id === item.id)
                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isSelected ? 'border-teal-300 bg-teal-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded flex items-center justify-center ${categoryColors[item.category] || 'bg-slate-100 text-slate-600'}`}>
                                                            {categoryIcons[item.category] || <Package className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-slate-900">{item.name}</p>
                                                            <p className="text-xs text-slate-500">
                                                                Disp: {item.current_available}/{item.total_quantity} &bull; &euro; {item.daily_rental_price.toFixed(2)}/gg
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isSelected ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-teal-600 font-medium mr-2">Aggiunto</span>
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs border-teal-300 text-teal-600 hover:bg-teal-50"
                                                            onClick={() => addEquipment(item)}
                                                            disabled={item.current_available === 0}
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" /> Aggiungi
                                                        </Button>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                {/* Selected equipment summary */}
                                {selectedEquipment.length > 0 && (
                                    <div className="border-t border-slate-200 pt-4 space-y-2">
                                        <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            Attrezzatura Selezionata ({selectedEquipment.length})
                                        </h4>
                                        {selectedEquipment.map(s => (
                                            <div key={s.equipment.id} className="flex items-center justify-between py-2 px-3 bg-white border border-slate-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] capitalize">{s.equipment.category}</Badge>
                                                    <span className="text-sm font-medium text-slate-900">{s.equipment.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-7 w-7"
                                                        onClick={() => updateQuantity(s.equipment.id, -1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm font-semibold">{s.quantity}</span>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-7 w-7"
                                                        onClick={() => updateQuantity(s.equipment.id, 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-red-400 hover:text-red-600"
                                                        onClick={() => removeEquipment(s.equipment.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-right text-sm font-semibold text-teal-700">
                                            Subtotale: &euro; {totalPrice.toFixed(2)} ({totalDays} {totalDays === 1 ? 'giorno' : 'giorni'})
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Summary */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                {/* Event Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Evento</p>
                                        <p className="font-semibold text-slate-900">{eventName || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
                                        <p className="font-medium text-slate-700">
                                            {startDate ? new Date(startDate).toLocaleDateString('it-IT') : '-'}
                                            {endDate && ` — ${new Date(endDate).toLocaleDateString('it-IT')}`}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Cliente</p>
                                        <p className="font-medium text-slate-700">{selectedClient?.company_name || selectedClient?.name || 'Nessuno'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">Location</p>
                                        <p className="font-medium text-slate-700">{location || 'Da definire'}</p>
                                    </div>
                                </div>

                                {/* Equipment Summary */}
                                {selectedEquipment.length > 0 ? (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium text-slate-600">Articolo</th>
                                                    <th className="px-4 py-2 text-center font-medium text-slate-600">Q.t&agrave;</th>
                                                    <th className="px-4 py-2 text-right font-medium text-slate-600">Prezzo/GG</th>
                                                    <th className="px-4 py-2 text-right font-medium text-slate-600">Totale</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedEquipment.map(s => (
                                                    <tr key={s.equipment.id}>
                                                        <td className="px-4 py-2 font-medium text-slate-900">{s.equipment.name}</td>
                                                        <td className="px-4 py-2 text-center">{s.quantity}</td>
                                                        <td className="px-4 py-2 text-right">&euro; {s.equipment.daily_rental_price.toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-right font-semibold">
                                                            &euro; {(s.quantity * s.equipment.daily_rental_price * totalDays).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-teal-50">
                                                    <td colSpan={3} className="px-4 py-3 text-right font-bold text-teal-800">
                                                        TOTALE ({totalDays} {totalDays === 1 ? 'giorno' : 'giorni'})
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-teal-800 text-base">
                                                        &euro; {totalPrice.toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-sm text-slate-500">
                                        Nessuna attrezzatura selezionata per questo evento.
                                    </div>
                                )}

                                <p className="text-sm text-slate-500">
                                    L&apos;evento verr&agrave; salvato. Potrai modificarlo successivamente.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Indietro
                </Button>
                {currentStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSave}
                        className="bg-teal-500 hover:bg-teal-600"
                        disabled={isPending || !isStep1Valid}
                    >
                        {isPending ? 'Salvataggio...' : initialData?.id ? 'Aggiorna Evento' : 'Salva Evento'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        className="bg-teal-500 hover:bg-teal-600"
                        disabled={currentStep === 0 && !isStep1Valid}
                    >
                        Avanti <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
