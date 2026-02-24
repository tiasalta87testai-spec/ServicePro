"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateEquipment(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const track_type = formData.get('track_type') as string

    // For unique items, quantity is forced to 1
    const total_quantity = track_type === 'unique' ? 1 : (parseInt(formData.get('total_quantity') as string) || 1)

    const daily_rental_price = parseFloat(formData.get('daily_rental_price') as string) || 0
    const brand_model = formData.get('brand_model') as string || null
    const serial_number = formData.get('serial_number') as string || null

    // Prepare update payload
    const updatePayload: any = {
        name,
        category,
        track_type,
        total_quantity,
        daily_rental_price,
        brand_model: track_type === 'unique' ? brand_model : null,
        serial_number: track_type === 'unique' ? serial_number : null,
    }

    // Handle document upload if present
    const documentFile = formData.get('document') as File | null
    if (documentFile && documentFile.size > 0 && documentFile.name !== 'undefined') {
        const { data: userData } = await supabase.auth.getUser()
        const { data: userTenant } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', userData.user?.id)
            .single()

        if (userTenant?.tenant_id) {
            const fileExt = documentFile.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `${userTenant.tenant_id}/${fileName}`

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('equipment_docs')
                .upload(filePath, documentFile)

            if (!uploadError && uploadData) {
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('equipment_docs')
                    .getPublicUrl(uploadData.path)

                updatePayload.document_url = publicUrl
            } else {
                console.error("Upload error:", uploadError)
                return { error: 'Errore nel caricamento del documento: ' + uploadError?.message }
            }
        }
    } else if (track_type !== 'unique') {
        updatePayload.document_url = null
    }

    const { error } = await supabase
        .from('equipment')
        .update(updatePayload)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/equipment')
    revalidatePath(`/equipment/${id}`)
    redirect(`/equipment/${id}`)
}
