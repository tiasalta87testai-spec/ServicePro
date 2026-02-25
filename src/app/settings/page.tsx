import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { TeamManagement } from "@/components/TeamManagement"
import { getTeamMembers } from "@/app/actions/team"
import { GoogleCalendarSync } from "@/components/GoogleCalendarSync"
import { createClient } from "@/utils/supabase/server"
import { CompanySettingsForm } from "@/components/CompanySettingsForm"

export default async function SettingsPage() {
    const teamResult = await getTeamMembers()
    const teamMembers = ('data' in teamResult) ? (teamResult.data || []) : []

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isGoogleConnected = false
    let tenantSettings: any = null

    if (user) {
        const { data: config } = await supabase
            .from('google_calendar_configs')
            .select('id')
            .eq('user_id', user.id)
            .single()
        isGoogleConnected = !!config

        // Get tenant data
        const { data: currentUser } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (currentUser?.tenant_id) {
            const { data: tenant } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', currentUser.tenant_id)
                .single()
            tenantSettings = tenant
        }
    }

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
                    {tenantSettings ? (
                        <CompanySettingsForm initialData={tenantSettings} />
                    ) : (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-500 text-sm">
                            Impossibile caricare i dati dell'azienda.
                        </div>
                    )}
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
                    <GoogleCalendarSync initialStatus={isGoogleConnected} />
                </TabsContent>

                {/* Tab Team */}
                <TabsContent value="team" className="mt-6">
                    <TeamManagement members={teamMembers} />
                </TabsContent>

            </Tabs>
        </div>
    )
}
