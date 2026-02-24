"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { UserPlus, MoreHorizontal, Trash2, Edit, Phone, Mail, Wrench, Shield, User, Crown } from "lucide-react"
import { addTeamMember, updateTeamMember, removeTeamMember } from "@/app/actions/team"
import { useRouter } from "next/navigation"

type TeamMember = {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    role: string
    specialization: string | null
    created_at: string
}

const roleLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    super_admin: { label: "Super Admin", color: "bg-purple-100 text-purple-700", icon: <Crown className="h-3 w-3" /> },
    admin: { label: "Admin", color: "bg-blue-100 text-blue-700", icon: <Shield className="h-3 w-3" /> },
    manager: { label: "Manager", color: "bg-teal-100 text-teal-700", icon: <Shield className="h-3 w-3" /> },
    technician: { label: "Tecnico", color: "bg-amber-100 text-amber-700", icon: <Wrench className="h-3 w-3" /> },
    viewer: { label: "Solo Lettura", color: "bg-slate-100 text-slate-600", icon: <User className="h-3 w-3" /> },
}

function getRoleBadge(role: string) {
    const info = roleLabels[role] || { label: role, color: "bg-slate-100 text-slate-700", icon: <User className="h-3 w-3" /> }
    return (
        <Badge className={`${info.color} hover:${info.color} gap-1`}>
            {info.icon}{info.label}
        </Badge>
    )
}

export function TeamManagement({ members: initialMembers }: { members: TeamMember[] }) {
    const [members, setMembers] = useState(initialMembers)
    const [addOpen, setAddOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editMember, setEditMember] = useState<TeamMember | null>(null)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleAdd = (formData: FormData) => {
        startTransition(async () => {
            const result = await addTeamMember(formData)
            if (result.success) {
                setAddOpen(false)
                router.refresh()
            } else {
                alert(result.error || "Errore durante l'aggiunta")
            }
        })
    }

    const handleUpdate = (formData: FormData) => {
        if (!editMember) return
        startTransition(async () => {
            const result = await updateTeamMember(editMember.id, formData)
            if (result.success) {
                setEditOpen(false)
                setEditMember(null)
                router.refresh()
            } else {
                alert(result.error || "Errore durante l'aggiornamento")
            }
        })
    }

    const handleRemove = (id: string, name: string) => {
        if (!confirm(`Sei sicuro di voler rimuovere ${name} dal team?`)) return
        startTransition(async () => {
            const result = await removeTeamMember(id)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || "Errore durante la rimozione")
            }
        })
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gestione Team</CardTitle>
                    <CardDescription>Aggiungi, modifica o rimuovi membri del team.</CardDescription>
                </div>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-500 hover:bg-teal-600">
                            <UserPlus className="mr-2 h-4 w-4" /> Aggiungi Membro
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nuovo Membro del Team</DialogTitle>
                            <DialogDescription>Inserisci i dati del nuovo membro. Riceverà un invito via email.</DialogDescription>
                        </DialogHeader>
                        <form action={handleAdd}>
                            <div className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="add_full_name">Nome Completo *</Label>
                                    <Input id="add_full_name" name="full_name" placeholder="Mario Rossi" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="add_email">Email *</Label>
                                    <Input id="add_email" name="email" type="email" placeholder="mario@example.com" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="add_password">Password (Temporanea / Iniziale) *</Label>
                                    <Input id="add_password" name="password" type="text" placeholder="Es. Servic3Pr0!" required minLength={6} />
                                    <p className="text-xs text-slate-500">
                                        Assicurati di comunicare questa password al nuovo membro in modo sicuro.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="add_phone">Telefono</Label>
                                        <Input id="add_phone" name="phone" type="tel" placeholder="+39 333 ..." />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="add_role">Ruolo *</Label>
                                        <Select name="role" defaultValue="technician">
                                            <SelectTrigger id="add_role">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="manager">Manager</SelectItem>
                                                <SelectItem value="technician">Tecnico</SelectItem>
                                                <SelectItem value="viewer">Solo Lettura</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="add_spec">Specializzazione</Label>
                                    <Input id="add_spec" name="specialization" placeholder="Audio, Luci, Video, Rigging..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Annulla</Button>
                                <Button type="submit" className="bg-teal-500 hover:bg-teal-600" disabled={isPending}>
                                    {isPending ? 'Aggiunta...' : 'Aggiungi'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <UserPlus className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                        <p className="font-medium text-slate-900">Nessun membro nel team</p>
                        <p className="text-sm mt-1">Aggiungi il primo membro del tuo team per iniziare.</p>
                    </div>
                ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Membro</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600 hidden md:table-cell">Contatti</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600">Ruolo</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-600 hidden lg:table-cell">Specializzazione</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-600 w-20">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                                    {member.full_name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{member.full_name}</p>
                                                    <p className="text-xs text-slate-500 md:hidden">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <div className="space-y-1">
                                                {member.email && (
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs">{member.email}</span>
                                                    </div>
                                                )}
                                                {member.phone && (
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs">{member.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getRoleBadge(member.role)}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {member.specialization ? (
                                                <span className="text-sm text-slate-700">{member.specialization}</span>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-teal-600"
                                                    onClick={() => {
                                                        setEditMember(member)
                                                        setEditOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                    onClick={() => handleRemove(member.id, member.full_name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditMember(null) }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifica Membro</DialogTitle>
                            <DialogDescription>Aggiorna le informazioni di {editMember?.full_name}.</DialogDescription>
                        </DialogHeader>
                        {editMember && (
                            <form action={handleUpdate}>
                                <div className="space-y-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_full_name">Nome Completo</Label>
                                        <Input id="edit_full_name" name="full_name" defaultValue={editMember.full_name} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_password">Nuova Password (Opzionale)</Label>
                                        <Input id="edit_password" name="password" type="text" placeholder="Lascia vuoto per non modificare" minLength={6} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit_phone">Telefono</Label>
                                            <Input id="edit_phone" name="phone" type="tel" defaultValue={editMember.phone || ''} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit_role">Ruolo</Label>
                                            <Select name="role" defaultValue={editMember.role}>
                                                <SelectTrigger id="edit_role">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="manager">Manager</SelectItem>
                                                    <SelectItem value="technician">Tecnico</SelectItem>
                                                    <SelectItem value="viewer">Solo Lettura</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit_spec">Specializzazione</Label>
                                        <Input id="edit_spec" name="specialization" defaultValue={editMember.specialization || ''} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => { setEditOpen(false); setEditMember(null) }}>Annulla</Button>
                                    <Button type="submit" className="bg-teal-500 hover:bg-teal-600" disabled={isPending}>
                                        {isPending ? 'Salvataggio...' : 'Salva'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
