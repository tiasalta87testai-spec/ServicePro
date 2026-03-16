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
            {error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                    Errore nel caricamento dei clienti: {error}
                </div>
            ) : clients?.length === 0 ? (
                <Card className="glass">
                    <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-4 focus:outline-none dark:bg-slate-800">
                            <Building2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1 dark:text-white">Nessun cliente trovato</h3>
                        <p className="text-slate-500 mb-4 max-w-sm">
                            Non hai ancora aggiunto alcun cliente.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/clients/new">Aggiungi il tuo primo cliente</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
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
                                                    client.client_type === 'company' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                        client.client_type === 'agency' ? 'bg-sky-50 text-sky-700 border-sky-200' :
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

                    {/* Mobile Premium Cards View */}
                    <div className="md:hidden space-y-4">
                        {/* Search Mockup for mobile */}
                        <div className="relative mb-6">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input type="text" placeholder="Cerca clienti..." className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-500" />
                        </div>

                        {clients?.map((client) => (
                            <Link href={`/clients/${client.id}`} key={client.id} className="block glass p-5 relative group overflow-hidden">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-400/20 to-purple-400/20 flex items-center justify-center border border-white/10 shrink-0">
                                        {client.client_type === 'private' ? (
                                            <User className="h-6 w-6 text-teal-400" />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-purple-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-white truncate">
                                            {client.company_name || client.name}
                                        </h3>
                                        <p className="text-sm text-teal-400/90 font-medium">
                                            {client.client_type === 'company' ? 'Azienda' : client.client_type === 'agency' ? 'Agenzia' : 'Privato'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        ID: #{client.id.slice(0, 4)}
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Floating Action Button (FAB) for mobile app */}
                        <Link href="/clients/new" className="fixed bottom-24 right-6 h-16 w-16 bg-teal-500 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-teal-500/20 text-white z-50 border border-teal-400 group active:scale-95 transition-transform">
                            <Plus className="h-6 w-6 mb-0.5" />
                            <span className="text-[10px] font-bold">NUOVO</span>
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}
