"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Minus, Trash2, Package, Speaker, Lightbulb, Monitor, Wrench, Briefcase, Save, Loader2, Calendar } from "lucide-react"
import { useClashDetection } from "@/hooks/useClashDetection"
import { updateEvent } from "@/app/actions/updateEvent"
import { createEvent } from "@/app/actions/createEvent"
import { format } from "date-fns"
import { it } from "date-fns/locale"

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

interface EventFormProps {
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
        status?: string
        equipment: SelectedEquipment[]
    }
}

const categoryIcons: Record<string, React.ReactNode> = {
    audio: <Speaker className="h-4 w-4" />,
    luci: <Lightbulb className="h-4 w-4" />,
    video: <Monitor className="h-4 w-4" />,
    strutture: <Wrench className="h-4 w-4" />,
    servizio: <Briefcase className="h-4 w-4" />,
}

const categoryColors: Record<string, string> = {
    audio: "bg-blue-100 text-blue-700",
    luci: "bg-amber-100 text-amber-700",
    video: "bg-cyan-100 text-cyan-700",
    strutture: "bg-slate-100 text-slate-700",
    servizio: "bg-emerald-100 text-emerald-700",
}

function EquipmentListItem({
    item,
    isSelected,
    onAdd,
    startDate,
    endDate,
    eventId,
}: {
    item: EquipmentItem;
    isSelected: boolean;
    onAdd: () => void;
    startDate: string;
    endDate: string;
    eventId?: string;
}) {
    const { bookedQuantity, isLoading } = useClashDetection(item.id, startDate, endDate, eventId)
    const actualAvailable = Math.max(0, item.current_available - bookedQuantity)

    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isSelected ? 'border-teal-300 bg-teal-50' : (actualAvailable === 0 && !isSelected) ? 'border-red-200 bg-red-50 opacity-70' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${categoryColors[item.category] || 'bg-slate-100 text-slate-600'}`}>
                    {categoryIcons[item.category] || <Package className="h-4 w-4" />}
                </div>
                <div>
                    <p className="font-medium text-sm text-slate-900">{item.name}</p>
                    <p className={`text-xs ${actualAvailable === 0 && !isSelected ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                        Disp: {isLoading ? '...' : actualAvailable}/{item.total_quantity} &bull; &euro; {item.daily_rental_price.toFixed(2)}/gg
                    </p>
                </div>
            </div>
            {isSelected ? (
                <span className="text-xs text-teal-600 font-medium mr-2">Aggiunto</span>
            ) : (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-teal-300 text-teal-600 hover:bg-teal-50"
                    onClick={onAdd}
                    disabled={actualAvailable === 0 || isLoading}
                >
                    <Plus className="h-3 w-3 mr-1" /> Aggiungi
                </Button>
            )}
        </div>
    )
}

export function EventForm({ equipment, clients, initialData }: EventFormProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Helper to extract YYYY-MM-DDTHH:mm from various date string formats
    const formatDateTimeForInput = (dateStr?: string) => {
        if (!dateStr) return ""
        try {
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return ""
            
            // Format to YYYY-MM-DDTHH:mm for datetime-local input
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            
            return `${year}-${month}-${day}T${hours}:${minutes}`
        } catch (e) {
            return ""
        }
    }

    // Form state
    const [eventName, setEventName] = useState(initialData?.name || "")
    const [startDate, setStartDate] = useState(formatDateTimeForInput(initialData?.start_date))
    const [endDate, setEndDate] = useState(formatDateTimeForInput(initialData?.end_date))
    const [notes, setNotes] = useState(initialData?.notes || "")
    const [selectedClientId, setSelectedClientId] = useState<string>(initialData?.client_id || "")
    const [location, setLocation] = useState(initialData?.location || "")
    const [status, setStatus] = useState(initialData?.status || "draft")

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
                    ? { ...s, quantity: s.quantity + 1 }
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
                return { ...s, quantity: newQty }
            })
        )
    }

    const removeEquipment = (equipmentId: string) => {
        setSelectedEquipment(prev => prev.filter(s => s.equipment.id !== equipmentId))
    }

    const handleSave = () => {
        startTransition(async () => {
             const payload = {
                name: eventName,
                start_date: startDate,
                end_date: endDate || startDate,
                client_id: selectedClientId && selectedClientId !== "none" ? selectedClientId : null,
                location,
                notes: notes || "",
                status,
                equipment: selectedEquipment.map(s => ({
                    equipment_id: s.equipment.id,
                    quantity: s.quantity,
                })),
            }

            if (initialData?.id) {
                const result = await updateEvent(initialData.id, payload)
                if (result.success) {
                    router.push(`/events/${initialData.id}`)
                } else {
                    alert(result.error || "Errore durante l'aggiornamento")
                }
            } else {
                const result = await createEvent(payload)
                if (result.success) {
                    router.push(`/events/${result.eventId}`)
                } else {
                    alert(result.error || "Errore durante il salvataggio")
                }
            }
        })
    }

    const isFormValid = eventName.trim() !== "" && startDate !== ""

    return (
        <div className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="flex w-full overflow-x-auto justify-start md:grid md:grid-cols-3 bg-slate-100/50 p-1 mb-2 scrollbar-none">
                    <TabsTrigger value="general" className="flex-1 min-w-[100px] whitespace-nowrap">Generale</TabsTrigger>
                    <TabsTrigger value="client" className="flex-1 min-w-[150px] whitespace-nowrap">Cliente & Location</TabsTrigger>
                    <TabsTrigger value="equipment" className="flex-1 min-w-[120px] whitespace-nowrap">Attrezzatura</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {/* Tab 1: Generale */}
                    <TabsContent value="general" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Dettagli Evento</CardTitle>
                                <CardDescription>Inserisci le informazioni principali.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Nome Evento *</Label>
                                    <Input placeholder="Es. Matrimonio Rossi" value={eventName} onChange={e => setEventName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Inizio Evento *</Label>
                                        <Input type="datetime-local" className="bg-white" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Fine Evento</Label>
                                        <Input type="datetime-local" className="bg-white" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Stato Evento</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Bozza</SelectItem>
                                            <SelectItem value="confirmed">Confermato</SelectItem>
                                            <SelectItem value="completed">Completato</SelectItem>
                                            <SelectItem value="cancelled">Annullato</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Note Interne</Label>
                                    <Textarea placeholder="Annotazioni specifiche..." value={notes || ""} onChange={e => setNotes(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Cliente */}
                    <TabsContent value="client" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cliente e Luogo</CardTitle>
                                <CardDescription>Assegna un cliente e specifica la location.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Seleziona Cliente</Label>
                                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleziona un cliente..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Nessun cliente</SelectItem>
                                            {clients.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.company_name || c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Indirizzo Location</Label>
                                    <Input placeholder="Via Roma 1, Milano" value={location || ""} onChange={e => setLocation(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Attrezzatura */}
                    <TabsContent value="equipment" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Cerca in Magazzino</CardTitle>
                                    <CardDescription>Aggiungi articoli al catalogo.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Cerca..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="pl-10 h-9"
                                            />
                                        </div>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[140px] h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tutti</SelectItem>
                                                <SelectItem value="audio">Audio</SelectItem>
                                                <SelectItem value="luci">Luci</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="strutture">Strutture</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="h-[400px] overflow-y-auto space-y-2 pr-2">
                                        {filteredEquipment.length === 0 ? (
                                            <p className="text-center text-slate-500 py-10 text-sm">Nessun articolo trovato.</p>
                                        ) : (
                                            filteredEquipment.map(item => (
                                                <EquipmentListItem
                                                    key={item.id}
                                                    item={item}
                                                    isSelected={selectedEquipment.some(s => s.equipment.id === item.id)}
                                                    onAdd={() => addEquipment(item)}
                                                    startDate={startDate}
                                                    endDate={endDate || startDate}
                                                    eventId={initialData?.id}
                                                />
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-teal-200 bg-teal-50/20">
                                <CardHeader>
                                    <CardTitle className="text-lg">Materiale Selezionato</CardTitle>
                                    <CardDescription>Riepilogo attrezzatura per l'evento.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="max-h-[460px] overflow-y-auto space-y-3">
                                        {selectedEquipment.length === 0 ? (
                                            <div className="text-center py-20">
                                                <Package className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                                <p className="text-sm text-slate-500">Nessun articolo selezionato.</p>
                                            </div>
                                        ) : (
                                            selectedEquipment.map(item => (
                                                <div key={item.equipment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                                    <div className="min-w-0 flex-1 mr-4">
                                                        <p className="text-sm font-semibold text-slate-900 truncate">{item.equipment.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            &euro; {item.equipment.daily_rental_price.toFixed(2)}/gg
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                                                            <button
                                                                className="p-1 hover:bg-slate-100 disabled:opacity-30"
                                                                onClick={() => updateQuantity(item.equipment.id, -1)}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                                            <button
                                                                className="p-1 hover:bg-slate-100"
                                                                onClick={() => updateQuantity(item.equipment.id, 1)}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => removeEquipment(item.equipment.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            <div className="flex justify-end pt-6 border-t border-slate-200">
                <Button 
                    className="bg-teal-500 hover:bg-teal-600 px-8" 
                    disabled={!isFormValid || isPending}
                    onClick={handleSave}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvataggio...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salva Modifiche
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
