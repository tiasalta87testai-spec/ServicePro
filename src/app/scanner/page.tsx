"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QrCode, X, Camera, RefreshCw, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { getEquipmentByQRCode } from "@/app/actions/equipment"

export default function ScannerPage() {
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const router = useRouter()

    useEffect(() => {
        let html5QrCode: Html5Qrcode | null = null;

        if (scanning) {
            html5QrCode = new Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    setResult(decodedText);
                    setScanning(false);
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // console.log(errorMessage);
                }
            ).catch((err) => {
                console.error("Errore avvio fotocamera:", err);
                toast({
                    title: "Errore fotocamera",
                    description: "Assicurati di aver dato i permessi per accedere alla fotocamera.",
                    variant: "destructive",
                });
                setScanning(false);
            });
        }

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error("Error stopping scanner", err));
            }
        };
    }, [scanning]);

    const handleScanSuccess = async (decodedText: string) => {
        setIsSearching(true)
        try {
            // Prima proviamo a vedere se è un JSON del nostro sistema
            let equipmentId = null;
            try {
                const data = JSON.parse(decodedText);
                if (data.type === "equipment_check" && data.equipmentId) {
                    equipmentId = data.equipmentId;
                } else if (data.type === "event" && data.eventId) {
                    router.push(`/events/${data.eventId}`);
                    return;
                }
            } catch (e) {
                // Non è un JSON, procediamo con la ricerca per qr_code testuale
            }

            if (equipmentId) {
                toast({
                    title: "Articolo Rilevato",
                    description: `Redirect all'articolo...`,
                });
                router.push(`/equipment/${equipmentId}`);
                return;
            }

            // Ricerca per campo qr_code
            const { data: equipment, error } = await getEquipmentByQRCode(decodedText);

            if (equipment) {
                toast({
                    title: "Articolo Trovato",
                    description: `${equipment.name} rilevato. Apertura dettaglio...`,
                });
                router.push(`/equipment/${equipment.id}`);
            } else {
                setResult(decodedText);
                toast({
                    title: "Nessuna attrezzatura trovata",
                    description: "Nessuna attrezzatura trovata per questo QR code.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Errore durante la ricerca:", error);
            toast({
                title: "Errore di sistema",
                description: "Si è verificato un errore durante la ricerca dell'attrezzatura.",
                variant: "destructive",
            });
        } finally {
            setIsSearching(false)
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                    Scanner QR
                </h1>
                <p className="text-slate-400">Inquadra un codice QR per caricare materiale o vedere dettagli</p>
            </div>

            <Card className="w-full max-w-md overflow-hidden bg-slate-900 border-white/10 glass shadow-2xl relative aspect-square flex flex-col items-center justify-center">
                {!scanning ? (
                    <div className="flex flex-col items-center space-y-6 p-8">
                        <div className="w-24 h-24 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                            <QrCode className="h-12 w-12 text-teal-400" />
                        </div>
                        <Button 
                            size="lg" 
                            onClick={() => setScanning(true)}
                            disabled={isSearching}
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-6 px-10 rounded-2xl shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {isSearching ? (
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            ) : (
                                <Camera className="mr-2 h-6 w-6" />
                            )}
                            {isSearching ? "Ricerca in corso..." : "Avvia Scanner"}
                        </Button>
                    </div>
                ) : (
                    <div className="w-full h-full relative">
                        <div id="reader" className="w-full h-full overflow-hidden" />
                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                            <div className="w-full h-full border-2 border-teal-400 border-dashed rounded-lg animate-pulse" />
                        </div>
                        <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => setScanning(false)}
                            className="absolute top-4 right-4 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-6 left-0 right-0 text-center">
                            <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                                Allinea il codice nel rettangolo
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            {result && !scanning && (
                <div className="w-full max-w-md p-4 bg-slate-800 rounded-xl border border-white/5 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Ultima Scansione</p>
                    <p className="text-white font-mono text-sm break-all">{result}</p>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setResult(null)}
                        className="mt-2 text-slate-400 hover:text-white"
                    >
                        Pulisci
                    </Button>
                </div>
            )}

            <div className="flex gap-4">
                <Button variant="outline" className="rounded-xl border-white/10 text-slate-400">
                    <RefreshCw className="mr-2 h-4 w-4" /> Cambia Camera
                </Button>
            </div>
        </div>
    )
}
