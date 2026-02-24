import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { TeamManagement } from "@/components/TeamManagement"
import { getTeamMembers } from "@/app/actions/team"

export default async function SettingsPage() {
    const teamResult = await getTeamMembers()
    const teamMembers = ('data' in teamResult) ? (teamResult.data || []) : []

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Impostazioni</h1>
            </div>

            <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="company">Azienda</TabsTrigger>
                    <TabsTrigger value="messaging">Messaggistica</TabsTrigger>
                    <TabsTrigger value="calendar">Calendario</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>

                {/* Tab Azienda */}
                <TabsContent value="company" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dettagli Aziendali</CardTitle>
                            <CardDescription>
                                Informazioni sull&apos;azienda utilizzate per la fatturazione e nei preventivi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Nome Azienda</Label>
                                    <Input id="companyName" defaultValue="Service Pro Audio Lighting" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vat">Partita IVA</Label>
                                    <Input id="vat" defaultValue="IT01234567890" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Indirizzo Sede Legale</Label>
                                <Input id="address" defaultValue="Via Milano 12, 20100 Milano (MI)" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Contatto</Label>
                                    <Input id="email" type="email" defaultValue="info@servicepro.it" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefono</Label>
                                    <Input id="phone" type="tel" defaultValue="+39 02 1234567" />
                                </div>
                            </div>
                            <Button className="mt-4 bg-teal-500 hover:bg-teal-600">Salva Modifiche</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Messaggistica */}
                <TabsContent value="messaging" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integrazione WhatsApp e Email</CardTitle>
                            <CardDescription>
                                Configura le credenziali API per l&apos;invio automatico di messaggi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 border-b border-slate-200 pb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-slate-900 border-none">Notifiche WhatsApp (API)</h3>
                                        <p className="text-sm text-slate-500">Usa WhatsApp Business API (p.es EvolutionAPI, Twilio, Meta) per inviare i dettagli evento ai tecnici.</p>
                                    </div>
                                    <Switch id="wa-enabled" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>API Key</Label>
                                    <Input type="password" placeholder="******************" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Base URL Endpoint</Label>
                                    <Input placeholder="https://api.tuoprovider.com/v1/messages" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <h3 className="text-lg font-medium text-slate-900">Template Messaggio Standard</h3>
                                <div className="grid gap-2">
                                    <Label>Testo Template</Label>
                                    <Textarea
                                        rows={5}
                                        defaultValue={`Ciao {{tecnico_nome}},\nSei stato assegnato all'evento "{{evento_nome}}" in data {{evento_data_inizio}}.\nLocation: {{evento_location}}.\n\nAccedi alla Dashboard per vedere il Packing List.`}
                                    />
                                    <p className="text-xs text-slate-500">Variabili supportate: {'{{tecnico_nome}}, {{evento_nome}}, {{evento_data_inizio}}, {{evento_location}}'}</p>
                                </div>
                            </div>
                            <Button className="mt-4 bg-teal-500 hover:bg-teal-600">Salva Impostazioni</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Calendar */}
                <TabsContent value="calendar" className="mt-6 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Google Calendar Sync</CardTitle>
                            <CardDescription>
                                Sincronizza gli eventi confermati con un Google Calendar condiviso col team.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-slate-900">Stato Connessione</p>
                                    <p className="text-sm text-slate-500">Nessun account Google collegato.</p>
                                </div>
                                <Button variant="outline">Collega Google Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Team */}
                <TabsContent value="team" className="mt-6">
                    <TeamManagement members={teamMembers} />
                </TabsContent>

            </Tabs>
        </div>
    )
}
