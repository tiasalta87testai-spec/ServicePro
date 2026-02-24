import { EventWizard } from "./wizard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getEquipmentList } from "@/app/actions/equipment"
import { getClientsList } from "@/app/actions/clients"

export default async function NewEventPage() {
    const [eqResult, clResult] = await Promise.all([
        getEquipmentList(),
        getClientsList(),
    ])

    const equipment = ('data' in eqResult) ? (eqResult.data || []) : []
    const clients = ('data' in clResult) ? (clResult.data || []) : []

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/events">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crea Nuovo Evento</h1>
            </div>

            <EventWizard equipment={equipment} clients={clients} />
        </div>
    )
}
