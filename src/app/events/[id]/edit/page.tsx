import { EventWizard } from "@/app/events/new/wizard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getEquipmentList } from "@/app/actions/equipment"
import { getClientsList } from "@/app/actions/clients"
import { getEventById } from "@/app/actions/eventDetail"
import { notFound } from "next/navigation"

export default async function EditEventPage({ params }: { params: { id: string } }) {
    const eventResult = await getEventById(params.id)
    if (!eventResult) notFound()

    const { event, packingList } = eventResult

    const [eqResult, clResult] = await Promise.all([
        getEquipmentList(),
        getClientsList(),
    ])

    const equipment = ('data' in eqResult) ? (eqResult.data || []) : []
    const clients = ('data' in clResult) ? (clResult.data || []) : []

    const initialData = {
        id: event.id,
        name: event.name,
        start_date: event.start_date,
        end_date: event.end_date,
        client_id: event.client_id,
        location: event.location,
        notes: event.notes,
        equipment: packingList.map((item: any) => ({
            equipment: item.equipment,
            quantity: item.quantity
        }))
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/events/${params.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Modifica Evento</h1>
            </div>

            <EventWizard equipment={equipment} clients={clients} initialData={initialData} />
        </div>
    )
}
