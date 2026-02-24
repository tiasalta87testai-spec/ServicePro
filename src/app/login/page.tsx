import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-slate-50">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Service<span className="text-teal-500">Pro</span></CardTitle>
                    <CardDescription>
                        Inserisci i tuoi dati per accedere all'app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>

                            {searchParams?.error && (
                                <div className="text-sm font-medium text-destructive">
                                    {searchParams.error}
                                </div>
                            )}

                            <Button formAction={login} className="w-full bg-teal-500 hover:bg-teal-600">
                                Accedi
                            </Button>
                        </div>
                        {/* Omitted signup formAction to enforce Invitation logic later if needed 
            <Button formAction={signup} variant="outline" className="w-full mt-2">
              Registrati
            </Button>
            */}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
