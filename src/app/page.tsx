import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, PackageOpen, TrendingUp, AlertTriangle, Percent, ArrowRight } from "lucide-react"
import { getDashboardStats, getDashboardEvents, getUpcomingEvents } from "@/app/actions/dashboard"
import { DashboardCalendar } from "@/components/DashboardCalendar"
import Link from "next/link"
import { format } from "date-fns"
import { it } from "date-fns/locale"

export default async function Home() {
  const stats = await getDashboardStats()
  const dbEvents = await getDashboardEvents()
  const upcomingEvents = await getUpcomingEvents()

  const safeStats = stats as any;
  const utilizationPercent = (!stats.error && safeStats.equipmentTotal > 0) 
    ? Math.round((safeStats.equipmentOut / safeStats.equipmentTotal) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>

      {('error' in stats) ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {stats.error}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 xl:grid-rows-1 xl:grid-cols-5">
          {/* KPI 1 */}
          <Card className="shadow-sm border-slate-200 glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Eventi attivi (Oggi)</CardTitle>
              <CalendarDays className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.activeEvents}</div>
              <p className="text-xs text-slate-500 mt-1">Eventi attualmente in corso</p>
            </CardContent>
          </Card>

          {/* KPI 2 */}
          <Card className="shadow-sm border-slate-200 glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Materiale Fuori</CardTitle>
              <PackageOpen className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.equipmentOut} pz.</div>
              <p className="text-xs text-slate-500 mt-1">Materiale non ancora rientrato</p>
            </CardContent>
          </Card>

          {/* KPI 3 (New) */}
          <Card className="shadow-sm border-slate-200 glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Utilizzo Magazzino</CardTitle>
              <Percent className="h-4 w-4 text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{utilizationPercent}%</div>
              <p className="text-xs text-slate-500 mt-1">Pezzi impegnati / Totale pezzi</p>
            </CardContent>
          </Card>

          {/* KPI 4 (New) */}
          <Card className="shadow-sm border-slate-200 glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Manutenzioni Diff.</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats.maintenanceAlerts > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.maintenanceAlerts}</div>
              <p className="text-xs text-slate-500 mt-1">Articoli "Da Revisionare"</p>
            </CardContent>
          </Card>

          {/* KPI 5 */}
          <Card className="shadow-sm border-slate-200 glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Fatturato Previs.</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">€ {stats.weeklyRevenue.toLocaleString('it-IT')}</div>
              <p className="text-xs text-slate-500 mt-1">Totale preventivi confermati</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Prossimi Eventi Column */}
        <Card className="shadow-sm border-slate-200 md:col-span-1 border-t-4 border-t-teal-500 glass">
          <CardHeader>
            <CardTitle className="text-lg">Prossimi Eventi</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-slate-500">Nessun evento in arrivo.</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-medium text-slate-900 line-clamp-1">{event.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{event.clients?.company_name || event.clients?.name}</p>
                      <p className="text-xs font-medium text-teal-600 mt-1">
                        {format(new Date(event.start_date), "d MMM", { locale: it })}
                        {event.start_date !== event.end_date && ` - ${format(new Date(event.end_date), "d MMM", { locale: it })}`}
                      </p>
                    </div>
                    <Link href={`/events/${event.id}`} className="p-2 hover:bg-slate-100 rounded-md transition-colors shrink-0">
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/events" className="text-sm text-teal-600 hover:text-teal-800 font-medium flex items-center justify-center">
                Vedi tutti gli eventi
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Eventi Column */}
        <Card className="shadow-sm border-slate-200 md:col-span-2 overflow-hidden glass">
          <CardHeader>
            <CardTitle className="text-lg">Timeline Eventi</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardCalendar initialEvents={dbEvents} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
