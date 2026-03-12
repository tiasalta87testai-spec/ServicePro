import { getEventsList } from "@/app/actions/events"
import CalendarClient from "./calendar-client"

export const metadata = {
  title: 'Calendario Eventi | ServicePro',
  description: 'Visualizzazione calendario eventi',
}

export default async function CalendarPage() {
    // 1. Fetch events on the server side
    const response = await getEventsList()

    if ('error' in response) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                Errore caricamento eventi: {response.error}
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Calendario Operativo</h1>
            
            {/* 2. Client Component for React Big Calendar interaction */}
            <CalendarClient initialEvents={response.data || []} />
        </div>
    )
}
