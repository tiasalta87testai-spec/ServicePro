"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QrCode, Search, X, Camera } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ScannerProps {
    onScan?: (data: any) => void
}

export function ScannerPlaceholder({ onScan }: ScannerProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [manualCode, setManualCode] = useState("")

    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;

        if (isScanning) {
            html5QrCode = new Html5Qrcode("event-reader");
            const config = { fps: 10, qrbox: { width: 200, height: 200 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    handleScanSuccess(decodedText);
                    setIsScanning(false);
                },
                (errorMessage) => {
                    // console.log(errorMessage);
                }
            ).catch((err) => {
                console.error("Errore scanner:", err);
                toast({
                    title: "Errore fotocamera",
                    description: "Permessi fotocamera negati o dispositivo non supportato.",
                    variant: "destructive",
                });
                setIsScanning(false);
            });
        }

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error(err));
            }
        };
    }, [isScanning]);

    const handleScanSuccess = (decodedText: string) => {
        try {
            const data = JSON.parse(decodedText);
            if (onScan) {
                onScan(data);
            }
            toast({
                title: "Codice QR Rilevato",
                description: "Aggiornamento packing list...",
            });
        } catch (e) {
            toast({
                title: "Formato non valido",
                description: "Il QR code scansionato non è un codice ServicePro.",
                variant: "destructive",
            });
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim() && onScan) {
            onScan({ type: "manual_search", query: manualCode });
            setManualCode("");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <form onSubmit={handleManualSubmit} className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        className="pl-9 bg-slate-50 border-slate-200" 
                        placeholder="Cerca manualmente un articolo..." 
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                    />
                </form>
                <Button
                    className="bg-slate-900 text-white hover:bg-black rounded-lg transition-all"
                    onClick={() => setIsScanning(!isScanning)}
                >
                    {isScanning ? <X className="mr-2 h-4 w-4" /> : <QrCode className="mr-2 h-4 w-4" />}
                    {isScanning ? "Chiudi" : "Scanner"}
                </Button>
            </div>

            {isScanning && (
                <div className="p-4 bg-slate-950 text-white rounded-2xl flex flex-col items-center justify-center space-y-4 overflow-hidden relative border border-white/10 shadow-2xl">
                    <div id="event-reader" className="w-full max-w-[300px] aspect-square rounded-xl overflow-hidden" />
                    <div className="text-center">
                        <p className="text-sm font-medium text-teal-400">Scanner Attivo</p>
                        <p className="text-xs text-slate-500">Inquadra il codice QR dell'articolo</p>
                    </div>
                </div>
            )}
        </div>
    )
}
