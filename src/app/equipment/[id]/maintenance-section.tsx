"use client"

import { useState } from "react"
import { createMaintenance, resolveMaintenance } from "@/app/actions/maintenance"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle } from "lucide-react"

export default function MaintenanceSection({
    equipmentId,
    maintenanceList,
}: {
    equipmentId: string
    maintenanceList: any[]
}) {
    const [showForm, setShowForm] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [resolvingId, setResolvingId] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setIsPending(true)
        const result = await createMaintenance({
            equipment_id: equipmentId,
            issue_description: formData.get('issue_description') as string,
            repair_cost: parseFloat(formData.get('repair_cost') as string) || 0,
            maintenance_type: formData.get('maintenance_type') as string,
            performed_by: formData.get('performed_by') as string,
        })
        setIsPending(false)
        if (!result.error) {
            setShowForm(false)
        }
    }

    const handleResolve = async (maintenanceId: string) => {
        setResolvingId(maintenanceId)
        await resolveMaintenance(maintenanceId, equipmentId)
        setResolvingId(null)
    }

    const openIssues = maintenanceList.filter(m => !m.resolved_at)
    const resolvedIssues = maintenanceList.filter(m => m.resolved_at)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-slate-400" />
                            Registro Manutenzione
                        </CardTitle>
                        <CardDescription>Storico interventi e segnalazioni per questo articolo</CardDescription>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setShowForm(!showForm)}
                        className={showForm ? "bg-slate-500 hover:bg-slate-600" : "bg-teal-500 hover:bg-teal-600"}
                    >
                        {showForm ? "Annulla" : <><Plus className="mr-2 h-4 w-4" /> Nuovo Intervento</>}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Form nuovo intervento */}
                    {showForm && (
                        <form action={handleSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="maintenance_type">Tipo Intervento *</Label>
                                    <Select name="maintenance_type" defaultValue="correttiva">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="preventiva">🔧 Preventiva</SelectItem>
                                            <SelectItem value="correttiva">🔴 Correttiva</SelectItem>
                                            <SelectItem value="ispezione">🔍 Ispezione</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="performed_by">Eseguito da</Label>
                                    <Input id="performed_by" name="performed_by" placeholder="Nome tecnico" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="issue_description">Descrizione *</Label>
                                <Textarea
                                    id="issue_description"
                                    name="issue_description"
                                    required
                                    placeholder="Descrivi il problema o l'intervento..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="repair_cost">Costo Riparazione (€)</Label>
                                <Input id="repair_cost" name="repair_cost" type="number" step="0.01" min="0" defaultValue="0" />
                            </div>

                            <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600" disabled={isPending}>
                                {isPending ? 'Salvataggio...' : 'Registra Intervento'}
                            </Button>
                        </form>
                    )}

                    {/* Issues aperte */}
                    {openIssues.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-red-700 flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4" />
                                Interventi Aperti ({openIssues.length})
                            </h4>
                            {openIssues.map((m: any) => (
                                <div key={m.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {m.maintenance_type || 'correttiva'}
                                                </Badge>
                                                {m.maintenance_date && (
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {m.maintenance_date}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-800">{m.issue_description}</p>
                                            {m.performed_by && (
                                                <p className="text-xs text-slate-500 mt-1">Tecnico: {m.performed_by}</p>
                                            )}
                                            {m.repair_cost > 0 && (
                                                <p className="text-xs text-slate-500 mt-0.5">Costo: € {parseFloat(m.repair_cost).toFixed(2)}</p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 shrink-0"
                                            onClick={() => handleResolve(m.id)}
                                            disabled={resolvingId === m.id}
                                        >
                                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                            {resolvingId === m.id ? '...' : 'Risolto'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Issues risolte */}
                    {resolvedIssues.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Storico Risolti ({resolvedIssues.length})
                            </h4>
                            {resolvedIssues.map((m: any) => (
                                <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg opacity-70">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {m.maintenance_type || 'correttiva'}
                                        </Badge>
                                        {m.maintenance_date && (
                                            <span className="text-xs text-slate-400">
                                                {m.maintenance_date}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 line-through">{m.issue_description}</p>
                                    {m.repair_cost > 0 && (
                                        <p className="text-xs text-slate-400 mt-0.5">Costo: € {parseFloat(m.repair_cost).toFixed(2)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {maintenanceList.length === 0 && !showForm && (
                        <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                            <Wrench className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                            <p className="text-sm">Nessun intervento di manutenzione registrato.</p>
                            <p className="text-xs text-slate-400 mt-1">Clicca &quot;Nuovo Intervento&quot; per registrare un problema o una manutenzione programata.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
