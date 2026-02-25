"use client"

import { QRCodeSVG } from "qrcode.react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"

interface EquipmentQRCodeProps {
    equipmentId: string
    equipmentName: string
    serialNumber?: string | null
    eventId: string
    eventName: string
}

export function EquipmentQRCode({ equipmentId, equipmentName, serialNumber, eventId, eventName }: EquipmentQRCodeProps) {
    const qrValue = JSON.stringify({
        type: "equipment_check",
        equipmentId,
        eventId,
        serialNumber: serialNumber || null,
        ts: Date.now()
    })

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-teal-600">
                    <QrCode className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">{equipmentName}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <QRCodeSVG
                            value={qrValue}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <div className="text-center space-y-1">
                        {serialNumber && (
                            <p className="text-sm font-mono text-slate-600">S/N: {serialNumber}</p>
                        )}
                        <p className="text-xs text-slate-400">Evento: {eventName}</p>
                        <p className="text-xs text-slate-400">Scansiona per confermare carico/scarico</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
