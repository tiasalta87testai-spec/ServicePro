import { getEquipmentById } from "@/app/actions/equipmentDetail"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import EditEquipmentForm from "./form"

export default async function EditEquipmentPage({ params }: { params: { id: string } }) {
    const equipment = await getEquipmentById(params.id)

    if (!equipment) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Modifica Articolo</h1>
                <Button asChild variant="outline">
                    <Link href={`/equipment/${equipment.id}`}>Annulla</Link>
                </Button>
            </div>

            <EditEquipmentForm equipment={equipment} />
        </div>
    )
}
