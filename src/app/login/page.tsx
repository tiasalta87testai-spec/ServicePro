"use client"

import { login, loginWithOtp } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function LoginPage({ searchParams }: { searchParams: { error?: string, success?: string } }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-slate-50">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-bold tracking-tight">
                        Service<span className="text-teal-500">Pro</span>
                    </CardTitle>
                    <CardDescription className="text-center">
                        Accedi alla tua area riservata
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                disabled={isLoading || isMagicLinkLoading}
                            />
                        </div>

                        {searchParams?.error && (
                            <div className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded text-center">
                                {searchParams.error}
                            </div>
                        )}

                        {searchParams?.success && (
                            <div className="text-sm font-medium text-emerald-600 bg-emerald-50 p-2 rounded text-center border border-emerald-100">
                                {searchParams.success}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                disabled={isLoading || isMagicLinkLoading}
                            />
                        </div>

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
                                <span className="bg-white px-2 text-slate-500">Oppure</span>
                            </div>
                        </div>

                        <Button 
                            formAction={async (formData) => {
                                setIsMagicLinkLoading(true);
                                await loginWithOtp(formData);
                                setIsMagicLinkLoading(false);
                            }} 
                            variant="outline" 
                            className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
                            disabled={isLoading || isMagicLinkLoading}
                        >
                            {isMagicLinkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Accedi con Magic Link
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-xs text-slate-400">
                    © 2026 ServicePro - Powering your Service
                </CardFooter>
            </Card>
        </div>
    )
}
