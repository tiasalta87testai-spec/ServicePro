"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getGoogleAuthUrl, disconnectGoogleCalendar } from "@/app/actions/google-auth"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

interface GoogleCalendarSyncProps {
    initialStatus: boolean
}

export function GoogleCalendarSync({ initialStatus }: GoogleCalendarSyncProps) {
    const [isConnected, setIsConnected] = useState(initialStatus)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success === 'google_connected') {
            setIsConnected(true)
            toast({
                title: "Connesso!",
                description: "Il tuo account Google è stato collegato con successo.",
            })
            // Rimuovi i parametri dall'URL
            router.replace('/settings')
        }

        if (error) {
            toast({
                title: "Errore",
                description: "Impossibile collegare l'account Google.",
                variant: "destructive"
            })
            router.replace('/settings')
        }
    }, [searchParams, toast, router])

    const handleConnect = async () => {
        setIsLoading(true)
        try {
            const url = await getGoogleAuthUrl()
            window.location.href = url
        } catch (error) {
            toast({
                title: "Errore",
                description: "Impossibile avviare il processo di autenticazione.",
                variant: "destructive"
            })
            setIsLoading(false)
        }
    }

    const handleDisconnect = async () => {
        setIsLoading(true)
        try {
            const result = await disconnectGoogleCalendar()
            if (result.success) {
                setIsConnected(false)
                toast({
                    title: "Scollegato",
                    description: "L'account Google è stato rimosso.",
                })
            } else {
                throw new Error(result.error)
            }
        } catch (error: any) {
            toast({
                title: "Errore",
                description: error.message || "Impossibile scollegare l'account.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Google Calendar Sync</CardTitle>
                <CardDescription>
                    Sincronizza gli eventi confermati con un Google Calendar condiviso col team.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isConnected ? (
                            <CheckCircle2 className="text-green-500 h-5 w-5" />
                        ) : (
                            <AlertCircle className="text-slate-400 h-5 w-5" />
                        )}
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-900">
                                {isConnected ? "Account Collegato" : "Stato Connessione"}
                            </p>
                            <p className="text-sm text-slate-500">
                                {isConnected
                                    ? "Il tuo calendario è ora sincronizzato."
                                    : "Nessun account Google collegato."}
                            </p>
                        </div>
                    </div>
                    {isConnected ? (
                        <Button
                            variant="outline"
                            onClick={handleDisconnect}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Scollega Account
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleConnect}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Collega Google Account
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
