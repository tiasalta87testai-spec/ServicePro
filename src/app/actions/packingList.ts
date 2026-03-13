"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleEquipmentLoaded(eventEquipmentId: string, eventId: string, isLoaded: boolean) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    if (isLoaded) {
        // Find the equipment ID and quantity for this record
        const { data: eeData } = await supabase
            .from('event_equipment')
            .select('equipment_id, quantity')
            .eq('id', eventEquipmentId)
            .single()

        if (eeData) {
            const { data: eqData } = await supabase
                .from('equipment')
                .select('name, current_available')
                .eq('id', eeData.equipment_id)
                .single()

            if (eqData && eqData.current_available < eeData.quantity) {
                 return { error: `Impossibile caricare: ${eqData.name} non è disponibile in magazzino (Attualmente in sede: ${eqData.current_available}).` }
            }
        }
    }

    const updateData: any = {
        is_loaded: isLoaded,
    }

    if (isLoaded) {
        updateData.loaded_at = new Date().toISOString()
        updateData.loaded_by = user.id
    } else {
        updateData.loaded_at = null
        updateData.loaded_by = null
    }

    const { error } = await supabase
        .from('event_equipment')
        .update(updateData)
        .eq('id', eventEquipmentId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}`)
    revalidatePath('/equipment')
    return { success: true }
}

export async function toggleEquipmentReturned(
    eventEquipmentId: string,
    eventId: string,
    isReturned: boolean,
    conditionOnReturn?: string
) {
    const supabase = await createClient()

    const updateData: any = {
        is_returned: isReturned,
    }

    if (isReturned) {
        updateData.returned_at = new Date().toISOString()
        updateData.condition_on_return = conditionOnReturn || 'ottimo'
    } else {
        updateData.returned_at = null
        updateData.condition_on_return = null
    }

    const { error } = await supabase
        .from('event_equipment')
        .update(updateData)
        .eq('id', eventEquipmentId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/events/${eventId}`)
    revalidatePath('/equipment')
    return { success: true }
}
