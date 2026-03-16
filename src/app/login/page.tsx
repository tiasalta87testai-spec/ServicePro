"use client"

import { login, loginWithOtp, verifyOtp } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, Mail, Key, ArrowRight } from "lucide-react"

export default function LoginPage({ searchParams }: { searchParams: { error?: string, success?: string } }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [email, setEmail] = useState("")

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-slate-50">
            <Card className="mx-auto max-w-sm w-full shadow-lg border-slate-200">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-bold tracking-tight">
                        Service<span className="text-teal-500">Pro</span>
                    </CardTitle>
                    <CardDescription className="text-center">
                        {showOtpInput 
                            ? "Inserisci il codice che ti abbiamo inviato per mail" 
                            : "Accedi alla tua area riservata"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showOtpInput ? (
                        <form className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="tua@email.com"
                                        required
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading || isMagicLinkLoading}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    disabled={isLoading || isMagicLinkLoading}
                                />
                            </div>

                            {searchParams?.error && (
                                <div className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded text-center border border-destructive/20">
                                    {searchParams.error}
                                </div>
                            )}

                            <Button 
                                formAction={async (formData) => {
                                    setIsLoading(true);
                                    await login(formData);
                                    setIsLoading(false);
                                }} 
                                className="w-full bg-teal-500 hover:bg-teal-600 font-semibold" 
                                disabled={isLoading || isMagicLinkLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Accedi con Password
                            </Button>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-500 font-medium">Oppure</span>
                                </div>
                            </div>

                            <Button 
                                type="button"
                                onClick={async () => {
                                    if (!email) return;
                                    setIsMagicLinkLoading(true);
                                    const formData = new FormData();
                                    formData.append("email", email);
                                    const result = await loginWithOtp(formData);
                                    setIsMagicLinkLoading(false);
                                    if (result?.success) {
                                        setShowOtpInput(true);
                                    }
                                }} 
                                variant="outline" 
                                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                                disabled={isLoading || isMagicLinkLoading || !email}
                            >
                                {isMagicLinkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Ricevi Codice Email
                            </Button>
                        </form>
                    ) : (
                        <form className="grid gap-4">
                            <input type="hidden" name="email" value={email} />
                            <div className="grid gap-2 text-center">
                                <Label htmlFor="token" className="text-sm font-medium">Codice di verifica</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 h-4 w-4 text-teal-500" />
                                    <Input
                                        id="token"
                                        name="token"
                                        type="text"
                                        placeholder="000000"
                                        required
                                        className="pl-10 text-center text-xl tracking-[0.5em] font-mono h-12"
                                        autoFocus
                                        maxLength={6}
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Controlla la tua email (anche nello spam)
                                </p>
                            </div>

                            <Button 
                                formAction={async (formData) => {
                                    setIsLoading(true);
                                    await verifyOtp(formData);
                                    setIsLoading(false);
                                }} 
                                className="w-full bg-teal-600 hover:bg-teal-700 font-semibold h-11" 
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                Verifica e Accedi
                            </Button>

                            <button 
                                type="button"
                                onClick={() => setShowOtpInput(false)}
                                className="text-xs text-teal-600 hover:underline text-center"
                            >
                                Usa un'altra email o password
                            </button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center text-[10px] text-slate-400 pb-4">
                    © 2026 ServicePro - Sicurezza Garantita
                </CardFooter>
            </Card>
        </div>
    )
}

