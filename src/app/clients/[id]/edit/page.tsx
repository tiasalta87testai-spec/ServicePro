import { getClientById } from "@/app/actions/clients"
import { ClientForm } from "../../form"
import { notFound } from "next/navigation"

export default async function EditClientPage({ params }: { params: { id: string } }) {
    const { data, error } = await getClientById(params.id)

    if (error || !data || !data.client) {
        notFound()
    }

    return <ClientForm initialData={data.client} />
}
