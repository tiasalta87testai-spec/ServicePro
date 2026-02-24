"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createEvent(data: {
    name: string
    start_date: string
    end_date: string
    client_id: string | null
    location: string
    notes: string
    equipment: Array<{ equipment_id: string; quantity: number }>
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData) return { error: 'Tenant non trovato' }

    // Create the event
    const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
            tenant_id: userData.tenant_id,
            name: data.name,
            start_date: data.start_date,
            end_date: data.end_date,
            out_date: data.start_date,
            in_date: data.end_date,
            client_id: data.client_id || null,
            location: data.location || null,
            status: 'draft',
        })
        .select('id')
        .single()

    if (eventError || !event) return { error: eventError?.message || 'Errore creazione evento' }

    // Add equipment (packing list)
    if (data.equipment.length > 0) {
        const equipmentRows = data.equipment.map(item => ({
            tenant_id: userData.tenant_id,
            event_id: event.id,
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
    return { success: true, eventId: event.id }
}
