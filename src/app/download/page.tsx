"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { 
    Download, 
    Smartphone, 
    Share, 
    PlusSquare, 
    CheckCircle2, 
    Info,
    ArrowBigDownDash,
    MonitorSmartphone,
    Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DownloadPage() {
    const [baseUrl, setBaseUrl] = useState("")
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        setBaseUrl(window.location.origin)

        // Handler per l'installazione PWA (solo Android/Chrome)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
        })

        window.addEventListener('appinstalled', () => {
            setIsInstalled(true)
            setDeferredPrompt(null)
        })

        // Verifica se è già installata
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setDeferredPrompt(null)
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 md:p-8">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Left Side: App Branding & QR */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6">
                    <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/30 inline-block">
                        <Smartphone className="h-10 w-10 text-teal-400" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            Service<span className="text-teal-400">Pro</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md">
                            Gestisci i tuoi eventi e le attrezzature direttamente dal tuo smartphone come una vera app.
                        </p>
                    </div>

                    <div className="hidden md:flex flex-col items-start gap-4 p-6 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl">
                        <div className="bg-white p-3 rounded-xl border-4 border-slate-700">
                            {baseUrl && (
                                <QRCodeSVG 
                                    value={baseUrl} 
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/icon-192x192.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 30,
                                        width: 30,
                                        excavate: true,
                                    }}
                                />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-white">Scansiona per scaricare</p>
                            <p className="text-xs text-slate-400">Inquadra con la fotocamera del tuo cellulare</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Instructions Card */}
                <Card className="bg-slate-900/40 backdrop-blur-2xl border-slate-800 shadow-2xl text-white overflow-hidden">
                    <CardHeader className="border-b border-slate-800/50 pb-6">
                        <div className="flex items-center gap-2 text-teal-400 mb-1">
                            <Info className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Guida Installazione</span>
                        </div>
                        <CardTitle className="text-xl">Scegli il tuo dispositivo</CardTitle>
                        <CardDescription className="text-slate-400">
                            L'app è gratuita e non richiede store ufficiali.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        <Tabs defaultValue="ios" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 p-1 mb-6">
                                <TabsTrigger value="ios" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all">
                                    iPhone (iOS)
                                </TabsTrigger>
                                <TabsTrigger value="android" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white transition-all">
                                    Android
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="ios" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 mt-0.5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">1</div>
                                    <p className="text-sm text-slate-300">Apri <span className="text-white font-medium italic">Safari</span> e vai su questo link.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 mt-0.5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">2</div>
                                    <p className="text-sm text-slate-300">Clicca l'icona <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700 inline-flex items-center gap-1 mx-1"><Share className="h-3 w-3" /> Condividi</span> nella barra in basso.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 mt-0.5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">3</div>
                                    <p className="text-sm text-slate-300">Scorri e seleziona <span className="text-white font-medium border-b border-white">"Aggiungi a Home"</span> <PlusSquare className="h-4 w-4 inline ml-1 text-slate-400" />.</p>
                                </div>
                                <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
                                    <p className="text-xs text-teal-100/80 leading-relaxed">
                                        Fatto! Troverai l'icona di ServicePro sulla tua schermata principale come una vera app.
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="android" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 mt-0.5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">1</div>
                                    <p className="text-sm text-slate-300">Apri <span className="text-white font-medium italic">Chrome</span> e vai su questo link.</p>
                                </div>
                                
                                {deferredPrompt ? (
                                    <div className="py-4">
                                        <Button 
                                            onClick={handleInstallClick}
                                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-teal-500/20"
                                        >
                                            <Download className="mr-2 h-5 w-5" /> Installa Ora
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <div className="h-6 w-6 mt-0.5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">2</div>
                                            <p className="text-sm text-slate-300">Clicca i tre puntini <span className="font-bold">⋮</span> in alto a destra.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="h-6 w-6 mt-0.5 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border border-slate-700">3</div>
                                            <p className="text-sm text-slate-300">Seleziona <span className="text-white font-medium border-b border-white">"Installa applicazione"</span>.</p>
                                        </div>
                                    </>
                                )}
                                
                                <div className="mt-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
                                    <p className="text-xs text-teal-100/80 leading-relaxed">
                                        L'app verrà installata e apparirà nel tuo menu applicazioni.
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>

                    <div className="p-6 bg-slate-950/40 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg">
                                <MonitorSmartphone className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-tighter">
                                Version 1.0.4 • PWA Technology
                            </div>
                        </div>
                        <Button variant="ghost" className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 text-xs px-0" asChild>
                            <a href="/login">Vai al Login <ArrowBigDownDash className="ml-2 h-3 w-3 rotate-[-90deg]" /></a>
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Footer */}
            <footer className="mt-12 text-slate-600 text-xs flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> servicepro.app</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full" />
                    <span>© 2026 ServicePro</span>
                </div>
            </footer>
        </div>
    )
}
