import Link from "next/link"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-slate-50">
            <Card className="mx-auto max-w-md border-rose-100 shadow-xl shadow-rose-900/5">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-rose-50 rounded-full">
                            <AlertCircle className="h-8 w-8 text-rose-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Link non valido o scaduto</CardTitle>
                    <CardDescription className="text-slate-500 mt-2">
                        Il link di accesso che hai utilizzato non è più valido.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <div className="p-4 bg-slate-100 rounded-lg text-sm text-slate-600 border border-slate-200">
                        <p>Questo può accadere se:</p>
                        <ul className="text-left mt-2 space-y-1 list-disc list-inside">
                            <li>Il link è stato già utilizzato</li>
                            <li>Il link è scaduto (validità di circa 1 ora)</li>
                            <li>Il tuo client email ha "pre-cliccato" il link per sicurezza</li>
                        </ul>
                    </div>
                    <p className="text-sm text-slate-500">
                        Torna alla pagina di login e richiedi un nuovo link magico.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button asChild className="w-full bg-teal-500 hover:bg-teal-600">
                        <Link href="/login" className="flex items-center justify-center">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Richiedi nuovo link
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full text-slate-500">
                        <Link href="/" className="flex items-center justify-center font-normal">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Torna alla home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
