"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2 } from "lucide-react"

function ConfirmContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isVerifying, setIsVerifying] = useState(false)
    
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/"

    const handleConfirm = async () => {
        if (!code) return
        
        setIsVerifying(true)
        // Reindirizziamo al callback che farà lo scambio effettivo del codice
        router.push(`/auth/callback?code=${code}&next=${next}`)
    }

    if (!code) {
        return (
            <Card className="mx-auto max-w-md border-rose-100">
                <CardHeader className="text-center">
                    <CardTitle className="text-rose-600">Errore di autenticazione</CardTitle>
                    <CardDescription>Codice di sessione mancante. Prova a richiedere un nuovo link.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button onClick={() => router.push("/login")} className="w-full bg-teal-500">
                        Torna al Login
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="mx-auto max-w-md border-teal-100 shadow-xl shadow-teal-900/5">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-teal-50 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-teal-500" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Quasi fatto!</CardTitle>
                <CardDescription className="text-slate-500 mt-2">
                    Clicca il pulsante qui sotto per completare l'accesso a ServicePro.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                    onClick={handleConfirm} 
                    className="w-full bg-teal-500 hover:bg-teal-600 h-12 text-lg font-semibold"
                    disabled={isVerifying}
                >
                    {isVerifying ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifica in corso...
                        </>
                    ) : (
                        "Conferma Accesso"
                    )}
                </Button>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-xs text-slate-400 text-center">
                    Questo passaggio aggiuntivo impedisce ai filtri email di invalidare il tuo link di accesso.
                </p>
            </CardFooter>
        </Card>
    )
}

export default function AuthConfirmPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-slate-50">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-teal-500" />}>
                <ConfirmContent />
            </Suspense>
        </div>
    )
}
