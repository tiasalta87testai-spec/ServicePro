"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Search } from "lucide-react"

export function ScannerPlaceholder() {
    const [isSimulating, setIsSimulating] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input className="pl-9" placeholder="Cerca manualmente un articolo..." />
                </div>
                <Button
                    className="md:hidden bg-slate-800 text-white"
                    onClick={() => setIsSimulating(!isSimulating)}
                >
                    <QrCode className="mr-2 h-4 w-4" /> Scanner
                </Button>
            </div>

            {isSimulating && (
                <div className="p-6 bg-slate-900 text-white rounded-lg flex flex-col items-center justify-center space-y-4 md:hidden">
                    <div className="w-48 h-48 border-2 border-teal-500 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 w-full h-1 bg-teal-500 animate-[scan_2s_ease-in-out_infinite]" />
                        <QrCode className="h-12 w-12 text-slate-600" />
                    </div>
                    <p className="text-sm text-center text-slate-400">Punta la fotocamera verso il codice QR</p>
                    <Button variant="destructive" size="sm" onClick={() => setIsSimulating(false)}>Annulla</Button>
                </div>
            )}
        </div>
    )
}
