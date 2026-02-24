"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient, updateClient, Client } from "@/app/actions/clients"
import { ArrowLeft, Save, Building2, User } from "lucide-react"
import Link from "next/link"

export function ClientForm({ initialData }: { initialData?: Client }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [clientType, setClientType] = useState<'company' | 'private' | 'agency'>(initialData?.client_type || 'company')
    const [error, setError] = useState<string | null>(null)

    const isEditing = !!initialData

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        formData.set('client_type', clientType)

        startTransition(async () => {
            if (isEditing) {
                const result = await updateClient(initialData.id, formData)
                if (result.success) {
                    router.push(`/clients/${initialData.id}`)
                } else {
                    setError(result.error || "Errore durante l'aggiornamento.")
                }
            } else {
                const result = await createClient(formData)
                if (result.success) {
                    router.push(`/clients/${result.clientId}`)
                } else {
                    setError(result.error || "Errore durante il salvataggio.")
                }
            }
        })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={isEditing ? `/clients/${initialData.id}` : "/clients"}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        {isEditing ? "Modifica Cliente" : "Nuovo Cliente"}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isEditing ? `Aggiorna i dati di ${initialData.company_name || initialData.name}` : "Inserisci i dati del nuovo cliente."}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            <form action={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Dati Principali</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Tipologia Cliente *</Label>
                                <Select value={clientType} onValueChange={(val: any) => setClientType(val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company"><Building2 className="w-4 h-4 inline mr-2" /> Azienda</SelectItem>
                                        <SelectItem value="agency"><Building2 className="w-4 h-4 inline mr-2 text-fuchsia-600" /> Agenzia</SelectItem>
                                        <SelectItem value="private"><User className="w-4 h-4 inline mr-2" /> Privato</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(clientType === 'company' || clientType === 'agency') && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="company_name">Ragione Sociale *</Label>
                                        <Input id="company_name" name="company_name" defaultValue={initialData?.company_name || ''} required />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="name">{clientType === 'private' ? 'Nome e Cognome *' : 'Referente (Opzionale)'}</Label>
                                    <Input id="name" name="name" defaultValue={initialData?.name || ''} required={clientType === 'private'} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Contatti</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={initialData?.email || ''} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Telefono</Label>
                                <Input id="phone" name="phone" type="tel" defaultValue={initialData?.phone || ''} />
                            </div>
                            <div className="grid gap-2 mt-2 pt-4 border-t border-slate-100">
                                <Label htmlFor="pec_email">Indirizzo PEC</Label>
                                <Input id="pec_email" name="pec_email" type="email" defaultValue={initialData?.pec_email || ''} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sdi_code">Codice SDI</Label>
                                <Input id="sdi_code" name="sdi_code" defaultValue={initialData?.sdi_code || ''} maxLength={7} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Dati Fiscali e Indirizzo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="vat_number">Partita IVA</Label>
                                    <Input id="vat_number" name="vat_number" defaultValue={initialData?.vat_number || ''} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tax_code">Codice Fiscale</Label>
                                    <Input id="tax_code" name="tax_code" defaultValue={initialData?.tax_code || ''} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Indirizzo / Sede Legale</Label>
                                <Input id="address" name="address" defaultValue={initialData?.address || ''} />
                            </div>

                            <div className="grid grid-cols-6 gap-4">
                                <div className="grid gap-2 col-span-2">
                                    <Label htmlFor="zip_code">CAP</Label>
                                    <Input id="zip_code" name="zip_code" defaultValue={initialData?.zip_code || ''} />
                                </div>
                                <div className="grid gap-2 col-span-4">
                                    <Label htmlFor="city">Città</Label>
                                    <Input id="city" name="city" defaultValue={initialData?.city || ''} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="province">Provincia (Sigla)</Label>
                                    <Input id="province" name="province" defaultValue={initialData?.province || ''} maxLength={2} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Nazione</Label>
                                    <Input id="country" name="country" defaultValue={initialData?.country || 'Italia'} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" asChild type="button">
                        <Link href={isEditing ? `/clients/${initialData.id}` : "/clients"}>Annulla</Link>
                    </Button>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-500" disabled={isPending}>
                        <Save className="w-4 h-4 mr-2" /> {isPending ? 'Salvataggio...' : 'Salva Cliente'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
