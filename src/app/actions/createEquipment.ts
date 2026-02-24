"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createEquipment(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Non autorizzato' }
    }

    // Get current tenant_id
    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData?.tenant_id) {
        return { error: 'Tenant non trovato' }
    }

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const track_type = formData.get('track_type') as string

    // For unique items, quantity is forced to 1, otherwise parse it from the input
    const total_quantity = track_type === 'unique' ? 1 : (parseInt(formData.get('total_quantity') as string) || 1)

    const daily_rental_price = parseFloat(formData.get('daily_rental_price') as string) || 0
    const brand_model = formData.get('brand_model') as string || null
    const serial_number = formData.get('serial_number') as string || null

    let document_url: string | null = null

    // Handle document upload if present
    const documentFile = formData.get('document') as File | null
    if (documentFile && documentFile.size > 0 && documentFile.name !== 'undefined') {
        const fileExt = documentFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `${userData.tenant_id}/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('equipment_docs')
            .upload(filePath, documentFile)

        if (uploadError) {
            console.error("Upload error:", uploadError)
            return { error: 'Errore nel caricamento del documento: ' + uploadError.message }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('equipment_docs')
            .getPublicUrl(uploadData.path)

        document_url = publicUrl
    }

    const { error } = await supabase
        .from('equipment')
        .insert({
            tenant_id: userData.tenant_id,
            name,
            category,
            track_type,
            total_quantity,
            current_available: total_quantity,
            daily_rental_price,
            brand_model: track_type === 'unique' ? brand_model : null,
            serial_number: track_type === 'unique' ? serial_number : null,
            document_url: track_type === 'unique' ? document_url : null,
            status: 'active'
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/equipment')
    redirect('/equipment')
}
