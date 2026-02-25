import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, PackageOpen, TrendingUp } from "lucide-react"
import { getDashboardStats, getDashboardEvents } from "@/app/actions/dashboard"
import { DashboardCalendar } from "@/components/DashboardCalendar"

export default async function Home() {
  const stats = await getDashboardStats()
  const dbEvents = await getDashboardEvents()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>

      {('error' in stats) ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {stats.error}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {/* KPI 1 */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Eventi attivi (Oggi)</CardTitle>
              <CalendarDays className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.activeEvents}</div>
              <p className="text-xs text-slate-500 mt-1">
                Eventi attualmente in corso
              </p>
            </CardContent>
          </Card>

          {/* KPI 2 */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Strumentazione fuori</CardTitle>
              <PackageOpen className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.equipmentOut} pz.</div>
              <p className="text-xs text-slate-500 mt-1">
                Materiale caricato non ancora rientrato
              </p>
            </CardContent>
          </Card>

          {/* KPI 3 */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Fatturato Previsionale</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">€ {stats.weeklyRevenue.toLocaleString('it-IT')}</div>
              <p className="text-xs text-slate-500 mt-1">
                Totale preventivi confermati
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm border-slate-200 mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Timeline Eventi</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardCalendar initialEvents={dbEvents} />
        </CardContent>
      </Card>
    </div>
  )
}
