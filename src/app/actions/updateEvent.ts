"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateEvent(
    id: string,
    data: {
        name: string
        start_date: string
        end_date: string
        client_id: string | null
        location: string
        notes: string
        equipment: Array<{ equipment_id: string; quantity: number }>
    }
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    // Update the event
    const { error: eventError } = await supabase
        .from('events')
        .update({
            name: data.name,
            start_date: data.start_date,
            end_date: data.end_date,
            out_date: data.start_date,
            in_date: data.end_date,
            client_id: data.client_id || null,
            location: data.location || null,
        })
        .eq('id', id)

    if (eventError) return { error: eventError.message || 'Errore nell\'aggiornamento dell\'evento' }

    // Update equipment (packing list)
    // First delete existing equipment records
    const { error: deleteError } = await supabase
        .from('event_equipment')
        .delete()
        .eq('event_id', id)

    if (deleteError) return { error: deleteError.message }

    // Insert new equipment records
    if (data.equipment.length > 0) {
        const { data: userData } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!userData) return { error: 'Tenant non trovato' }

        const equipmentRows = data.equipment.map(item => ({
            tenant_id: userData.tenant_id,
            event_id: id,
            equipment_id: item.equipment_id,
            quantity: item.quantity,
            is_loaded: false,
            is_returned: false,
        }))

        const { error: eqError } = await supabase
            .from('event_equipment')
            .insert(equipmentRows)

        if (eqError) return { error: eqError.message }
    }

    revalidatePath('/events')
    revalidatePath(`/events/${id}`)
    return { success: true }
}
