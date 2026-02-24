import { getEquipmentList } from "@/app/actions/equipment"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function EquipmentPage() {
    const response = await getEquipmentList()

    if ('error' in response) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
                Errore caricamento magazzino: {response.error}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Magazzino</h1>
                <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white">
                    <Link href="/equipment/new">
                        <Plus className="mr-2 h-4 w-4" /> Nuovo Articolo
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <DataTable columns={columns} data={response.data || []} />
            </div>
        </div>
    )
}
