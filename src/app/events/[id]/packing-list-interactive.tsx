"use client"

import { useState } from "react"
import { toggleEquipmentLoaded, toggleEquipmentReturned } from "@/app/actions/packingList"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Box, Truck, RotateCcw, AlertTriangle } from "lucide-react"
import { EquipmentQRCode } from "@/components/EquipmentQRCode"
import { ScannerPlaceholder } from "./scanner"
import { toast } from "@/hooks/use-toast"

interface PackingItem {
    id: string
    quantity: number
    is_loaded: boolean
    loaded_at: string | null
    is_returned: boolean
    returned_at: string | null
    condition_on_return: string | null
    equipment: {
        id: string
        name: string
        category: string
        serial_number: string | null
        brand_model: string | null
    }
}

export default function PackingListInteractive({
    packingList,
    eventId,
    eventName,
}: {
    packingList: any[]
    eventId: string
    eventName: string
}) {
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
    const [returnConditions, setReturnConditions] = useState<Record<string, string>>({})

    const handleToggleLoaded = async (item: PackingItem) => {
        setLoadingIds(prev => new Set(prev).add(item.id))
        const res = await toggleEquipmentLoaded(item.id, eventId, !item.is_loaded)
        if (res?.error) {
            alert(res.error)
        }
        setLoadingIds(prev => {
            const next = new Set(prev)
            next.delete(item.id)
            return next
        })
    }

    const handleToggleReturned = async (item: PackingItem) => {
        setLoadingIds(prev => new Set(prev).add(item.id))
        const condition = returnConditions[item.id] || 'ottimo'
        const res = await toggleEquipmentReturned(item.id, eventId, !item.is_returned, condition)
        if (res?.error) {
            alert(res.error)
        }
        setLoadingIds(prev => {
            const next = new Set(prev)
            next.delete(item.id)
            return next
        })
    }

    const handleScan = async (data: any) => {
        if (data.type === "equipment_check" && data.equipmentId) {
            const item = packingList.find(i => i.equipment.id === data.equipmentId)
            if (item) {
                if (!item.is_loaded) {
                    await handleToggleLoaded(item)
                    toast({
                        title: "Articolo Caricato",
                        description: `${item.equipment.name} segnato come caricato.`,
                    })
                } else if (!item.is_returned) {
                    await handleToggleReturned(item)
                    toast({
                        title: "Articolo Rientrato",
                        description: `${item.equipment.name} segnato come rientrato.`,
                    })
                } else {
                    toast({
                        title: "Articolo già completato",
                        description: `${item.equipment.name} è già stato caricato e rientrato.`,
                    })
                }
            } else {
                toast({
                    title: "Articolo non trovato",
                    description: "Questo articolo non fa parte della packing list di questo evento.",
                    variant: "destructive",
                })
            }
        }
    }

    const totalItems = packingList.length
    const loadedCount = packingList.filter(i => i.is_loaded).length
    const returnedCount = packingList.filter(i => i.is_returned).length

    return (
        <div className="space-y-6">
            <ScannerPlaceholder onScan={handleScan} />

            {/* Progress indicators */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-amber-800 flex items-center gap-1.5">
                            <Truck className="h-4 w-4" /> Caricati
                        </span>
                        <span className="text-lg font-bold text-amber-800">{loadedCount}/{totalItems}</span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden mt-2">
                        <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: totalItems > 0 ? `${(loadedCount / totalItems) * 100}%` : '0%' }}
                        />
                    </div>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-teal-800 flex items-center gap-1.5">
                            <RotateCcw className="h-4 w-4" /> Rientrati
                        </span>
                        <span className="text-lg font-bold text-teal-800">{returnedCount}/{totalItems}</span>
                    </div>
                    <div className="w-full h-1.5 bg-teal-200 rounded-full overflow-hidden mt-2">
                        <div
                            className="h-full bg-teal-500 rounded-full transition-all"
                            style={{ width: totalItems > 0 ? `${(returnedCount / totalItems) * 100}%` : '0%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-medium text-slate-600">Articolo</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-center">Q.tà</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-center">Carico</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-center">Rientro</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-center w-20">QR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {packingList.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                    Nessun articolo assegnato a questo evento.
                                </td>
                            </tr>
                        ) : (
                            packingList.map((item) => (
                                <tr key={item.id} className={`transition-colors ${item.is_returned ? 'bg-emerald-50/50' : item.is_loaded ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{item.equipment.name}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{item.equipment.category}</Badge>
                                            {item.equipment.brand_model && <span>{item.equipment.brand_model}</span>}
                                            {item.equipment.serial_number && <span className="font-mono">SN: {item.equipment.serial_number}</span>}
                                        </div>
                                        {item.condition_on_return && item.condition_on_return !== 'ottimo' && (
                                            <div className="mt-1 flex items-center gap-1">
                                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                                <span className="text-xs text-amber-700 capitalize">{item.condition_on_return.replace('_', ' ')}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center font-semibold text-slate-900">
                                        {item.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Button
                                            size="sm"
                                            variant={item.is_loaded ? "default" : "outline"}
                                            className={item.is_loaded
                                                ? "bg-emerald-500 hover:bg-emerald-600 text-white h-8 w-8 p-0"
                                                : "h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:border-emerald-300"
                                            }
                                            onClick={() => handleToggleLoaded(item)}
                                            disabled={loadingIds.has(item.id) || item.is_returned}
                                            title={item.is_loaded ? "Annulla caricamento" : "Segna come caricato"}
                                        >
                                            {loadingIds.has(item.id) ? (
                                                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {item.is_loaded && !item.is_returned && (
                                                <Select
                                                    value={returnConditions[item.id] || 'ottimo'}
                                                    onValueChange={(val) => setReturnConditions(prev => ({ ...prev, [item.id]: val }))}
                                                >
                                                    <SelectTrigger className="h-7 w-[90px] text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ottimo">✅ Ottimo</SelectItem>
                                                        <SelectItem value="buono">🟡 Buono</SelectItem>
                                                        <SelectItem value="danneggiato">🔴 Danneggiato</SelectItem>
                                                        <SelectItem value="mancante">⚫ Mancante</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            <Button
                                                size="sm"
                                                variant={item.is_returned ? "default" : "outline"}
                                                className={item.is_returned
                                                    ? "bg-teal-500 hover:bg-teal-600 text-white h-8 w-8 p-0"
                                                    : "h-8 w-8 p-0 text-slate-400 hover:text-teal-600 hover:border-teal-300"
                                                }
                                                onClick={() => handleToggleReturned(item)}
                                                disabled={loadingIds.has(item.id) || !item.is_loaded}
                                                title={item.is_returned ? "Annulla rientro" : "Segna come rientrato"}
                                            >
                                                {loadingIds.has(item.id) ? (
                                                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                                ) : (
                                                    <RotateCcw className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <EquipmentQRCode
                                            equipmentId={item.equipment.id}
                                            equipmentName={item.equipment.name}
                                            serialNumber={item.equipment.serial_number}
                                            eventId={eventId}
                                            eventName={eventName}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
