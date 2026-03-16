"use client"

import { useState } from "react"
import { toggleEquipmentLoaded, toggleEquipmentReturned } from "@/app/actions/packingList"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Box, Truck, RotateCcw, AlertTriangle, RefreshCw } from "lucide-react"
import { EquipmentQRCode } from "@/components/EquipmentQRCode"
import { ScannerPlaceholder } from "./scanner"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
            <div className="pwa-only:mt-2">
                <ScannerPlaceholder onScan={handleScan} />
            </div>

            {/* Progress indicators - Glass Effect */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 border-amber-500/20 shadow-lg shadow-amber-500/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5" /> Caricati
                        </span>
                        <span className="text-xl font-black text-white">{loadedCount}<span className="text-xs font-normal text-slate-500 ml-1">/ {totalItems}</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
                        <div
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700 ease-out"
                            style={{ width: totalItems > 0 ? `${(loadedCount / totalItems) * 100}%` : '0%' }}
                        />
                    </div>
                </div>
                <div className="glass p-4 border-teal-500/20 shadow-lg shadow-teal-500/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                            <RotateCcw className="h-3.5 w-3.5" /> Rientrati
                        </span>
                        <span className="text-xl font-black text-white">{returnedCount}<span className="text-xs font-normal text-slate-500 ml-1">/ {totalItems}</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
                        <div
                            className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700 ease-out"
                            style={{ width: totalItems > 0 ? `${(returnedCount / totalItems) * 100}%` : '0%' }}
                        />
                    </div>
                </div>
            </div>

            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block glass overflow-hidden border-white/5">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Articolo</th>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-center">Q.tà</th>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-center">Carico</th>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-center">Rientro</th>
                            <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-center w-20">QR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {packingList.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                    Nessun articolo assegnato a questo evento.
                                </td>
                            </tr>
                        ) : (
                            packingList.map((item) => (
                                <tr key={item.id} className={cn(
                                    "transition-colors group",
                                    item.is_returned ? "bg-teal-500/5 hover:bg-teal-500/10" : 
                                    item.is_loaded ? "bg-amber-500/5 hover:bg-amber-500/10" : 
                                    "hover:bg-white/5"
                                )}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white group-hover:text-teal-400 transition-colors">{item.equipment.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-white/5 text-slate-400 border-white/10 uppercase tracking-tighter">
                                                {item.equipment.category}
                                            </Badge>
                                            {item.equipment.serial_number && <span className="text-[10px] font-mono text-slate-500">SN: {item.equipment.serial_number}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 font-bold text-white border border-white/10">
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            size="icon"
                                            variant={item.is_loaded ? "default" : "outline"}
                                            className={cn(
                                                "h-10 w-10 rounded-xl transition-all duration-300",
                                                item.is_loaded 
                                                    ? "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20" 
                                                    : "border-white/10 text-slate-500 hover:text-amber-500 hover:border-amber-500/50"
                                            )}
                                            onClick={() => handleToggleLoaded(item)}
                                            disabled={loadingIds.has(item.id) || item.is_returned}
                                        >
                                            {loadingIds.has(item.id) ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Truck className={cn("h-5 w-5", item.is_loaded ? "text-white" : "text-current")} />
                                            )}
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {item.is_loaded && !item.is_returned && (
                                                <Select
                                                    value={returnConditions[item.id] || 'ottimo'}
                                                    onValueChange={(val) => setReturnConditions(prev => ({ ...prev, [item.id]: val }))}
                                                >
                                                    <SelectTrigger className="h-10 w-[110px] text-xs bg-white/5 border-white/10 text-white rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-900 border-white/10 text-white glass">
                                                        <SelectItem value="ottimo">Ottimo</SelectItem>
                                                        <SelectItem value="buono">Buono</SelectItem>
                                                        <SelectItem value="danneggiato">Danneggiato</SelectItem>
                                                        <SelectItem value="mancante">Mancante</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            <Button
                                                size="icon"
                                                variant={item.is_returned ? "default" : "outline"}
                                                className={cn(
                                                    "h-10 w-10 rounded-xl transition-all duration-300",
                                                    item.is_returned 
                                                        ? "bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/20" 
                                                        : "border-white/10 text-slate-500 hover:text-teal-500 hover:border-teal-500/50"
                                                )}
                                                onClick={() => handleToggleReturned(item)}
                                                disabled={loadingIds.has(item.id) || !item.is_loaded}
                                            >
                                                {loadingIds.has(item.id) ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <RotateCcw className={cn("h-5 w-5", item.is_returned ? "text-white" : "text-current")} />
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
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

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="md:hidden space-y-4">
                {packingList.length === 0 ? (
                    <div className="glass p-12 text-center text-slate-500 italic">
                        Nessun articolo assegnato.
                    </div>
                ) : (
                    packingList.map((item) => (
                        <div key={item.id} className={cn(
                            "glass p-4 relative overflow-hidden transition-all border-l-4",
                            item.is_returned ? "border-l-teal-500 bg-teal-500/5" : 
                            item.is_loaded ? "border-l-amber-500 bg-amber-500/5" : 
                            "border-l-transparent bg-white/5"
                        )}>
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-base leading-tight">
                                        {item.equipment.name}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-white/5 text-slate-400 border-white/10 uppercase font-bold tracking-tighter">
                                            {item.equipment.category}
                                        </Badge>
                                        <span className="text-[11px] text-slate-500 font-bold">Q.tà: {item.quantity}</span>
                                    </div>
                                    {item.equipment.serial_number && (
                                        <p className="text-[10px] font-mono text-slate-500 mt-1">S/N: {item.equipment.serial_number}</p>
                                    )}
                                </div>
                                <div className="shrink-0">
                                    <EquipmentQRCode
                                        equipmentId={item.equipment.id}
                                        equipmentName={item.equipment.name}
                                        serialNumber={item.equipment.serial_number}
                                        eventId={eventId}
                                        eventName={eventName}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <Button
                                    className={cn(
                                        "flex-1 h-12 gap-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg",
                                        item.is_loaded 
                                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
                                            : "bg-white/5 border border-white/10 text-slate-400 hover:text-amber-500 hover:border-amber-500/50"
                                    )}
                                    onClick={() => handleToggleLoaded(item)}
                                    disabled={loadingIds.has(item.id) || item.is_returned}
                                >
                                    {loadingIds.has(item.id) ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Truck className="h-4 w-4" />
                                    )}
                                    {item.is_loaded ? "Caricato" : "Carica"}
                                </Button>

                                <div className="flex-[1.5] flex gap-2">
                                    {item.is_loaded && !item.is_returned && (
                                        <Select
                                            value={returnConditions[item.id] || 'ottimo'}
                                            onValueChange={(val) => setReturnConditions(prev => ({ ...prev, [item.id]: val }))}
                                        >
                                            <SelectTrigger className="h-12 flex-1 bg-white/10 border-white/10 text-white font-bold text-xs rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-white glass">
                                                <SelectItem value="ottimo">Ottimo</SelectItem>
                                                <SelectItem value="buono">Buono</SelectItem>
                                                <SelectItem value="danneggiato">Danni</SelectItem>
                                                <SelectItem value="mancante">Mancante</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                    <Button
                                        className={cn(
                                            "h-12 gap-2 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg min-w-[100px] flex-1",
                                            item.is_returned 
                                                ? "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/20" 
                                                : "bg-white/5 border border-white/10 text-slate-400 hover:text-teal-500 hover:border-teal-500/50"
                                        )}
                                        onClick={() => handleToggleReturned(item)}
                                        disabled={loadingIds.has(item.id) || !item.is_loaded}
                                    >
                                        {loadingIds.has(item.id) ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RotateCcw className="h-4 w-4" />
                                        )}
                                        {item.is_returned ? "Rientrato" : "Rientro"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
