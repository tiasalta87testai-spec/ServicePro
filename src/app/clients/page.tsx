import { getClientsList } from "@/app/actions/clients"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function ClientsPage() {
    const { data: clients, error } = await getClientsList()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clienti</h1>
                    <p className="text-slate-500 mt-2">
                        Gestisci la tua anagrafica clienti
                    </p>
                </div>
                <Button asChild className="bg-teal-500 hover:bg-teal-600">
                    <Link href="/clients/new">
                        <Plus className="mr-2 h-4 w-4" /> Nuovo Cliente
                    </Link>
                </Button>
            </div>

            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                    Errore nel caricamento dei clienti: {error}
                </div>
            ) : clients?.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4 focus:outline-none">
                            <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">Nessun cliente trovato</h3>
                        <p className="text-slate-500 mb-4 max-w-sm">
                            Non hai ancora aggiunto alcun cliente. Inizia ad aggiungere i contatti delle aziende o privati con cui lavori.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/clients/new">Aggiungi il tuo primo cliente</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Nominativo</th>
                                    <th className="px-6 py-4">Tipologia</th>
                                    <th className="px-6 py-4">P. IVA / CF</th>
                                    <th className="px-6 py-4">Contatti</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {clients?.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/clients/${client.id}`} className="font-medium text-slate-900 hover:text-teal-600">
                                                {client.company_name || client.name}
                                            </Link>
                                            {client.company_name && client.name && (
                                                <div className="text-xs text-slate-500 mt-0.5">{client.name}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={
                                                client.client_type === 'company' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                    client.client_type === 'agency' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
                                                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }>
                                                {client.client_type === 'company' ? (
                                                    <><Building2 className="mr-1 h-3 w-3 inline" /> Azienda</>
                                                ) : client.client_type === 'agency' ? (
                                                    <><Building2 className="mr-1 h-3 w-3 inline" /> Agenzia</>
                                                ) : (
                                                    <><User className="mr-1 h-3 w-3 inline" /> Privato</>
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {client.vat_number || client.tax_code || <span className="text-slate-400 italic">Non specificato</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex flex-col gap-0.5 text-xs">
                                                {client.email ? <span>{client.email}</span> : null}
                                                {client.phone ? <span>{client.phone}</span> : null}
                                                {!client.email && !client.phone && <span className="text-slate-400 italic">Nessun contatto</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
