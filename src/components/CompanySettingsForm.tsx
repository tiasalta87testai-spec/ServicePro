"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { updateCompanySettings } from "@/app/actions/settings"

type TenantSettings = {
    id: string
    name: string
    vat_number: string | null
    address: string | null
    email: string | null
    phone: string | null
    brand_primary_color: string | null
    brand_logo_url: string | null
    brand_document_footer: string | null
}

export function CompanySettingsForm({ initialData }: { initialData: TenantSettings }) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        vat_number: initialData?.vat_number || "",
        address: initialData?.address || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        brand_primary_color: initialData?.brand_primary_color || "#0f766e",
        brand_document_footer: initialData?.brand_document_footer || "",
        brand_logo_url: initialData?.brand_logo_url || "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateCompanySettings(formData)
            if (result.success) {
                toast({ title: "Impostazioni salvate", description: "I dettagli aziendali e il brand sono stati aggiornati." })
                router.refresh()
            } else {
                throw new Error(result.error)
            }
        } catch (err: any) {
            toast({ title: "Errore", description: err.message, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Dettagli Aziendali e Brand</CardTitle>
                    <CardDescription>
                        Informazioni sull'azienda utilizzate per la fatturazione e nei preventivi PDF personalizzati.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Azienda</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vat_number">Partita IVA</Label>
                            <Input id="vat_number" name="vat_number" value={formData.vat_number} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Indirizzo Sede Legale</Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Contatto</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefono</Label>
                            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-lg font-medium text-slate-900 mb-4">Personalizzazione Preventivi PDF</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand_primary_color">Colore Primario Brand</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="brand_primary_color"
                                        name="brand_primary_color"
                                        type="color"
                                        className="w-16 h-10 p-1 cursor-pointer"
                                        value={formData.brand_primary_color}
                                        onChange={handleChange}
                                    />
                                    <span className="text-sm font-mono text-slate-500">{formData.brand_primary_color}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brand_logo_url">URL Logo Aziendale</Label>
                                <Input
                                    id="brand_logo_url"
                                    name="brand_logo_url"
                                    placeholder="https://..."
                                    value={formData.brand_logo_url}
                                    onChange={handleChange}
                                // In a real app we'd upload a file to Supabase Storage.
                                // For simplicity we allow a URL here as requested in the plan logic without over-engineering file uploads.
                                />
                            </div>
                        </div>
                        <div className="space-y-2 mt-4">
                            <Label htmlFor="brand_document_footer">Piè di pagina (Coordinate Bancarie, Termini, etc.)</Label>
                            <Textarea
                                id="brand_document_footer"
                                name="brand_document_footer"
                                rows={3}
                                placeholder="IBAN: IT00000... Banca..."
                                value={formData.brand_document_footer}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="mt-4 bg-teal-500 hover:bg-teal-600">
                        {isLoading ? "Salvataggio..." : "Salva Modifiche"}
                    </Button>
                </CardContent>
            </Card>
        </form>
    )
}
