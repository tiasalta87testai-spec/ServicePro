"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { createGoogleEvent, updateGoogleEvent } from "@/lib/google-calendar"

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

    // Get current event to check for google_event_id
    const { data: currentEvent } = await supabase
        .from('events')
        .select('google_event_id')
        .eq('id', id)
        .single()

    // Clash Detection (Availability Check)
    if (data.equipment.length > 0) {
        for (const item of data.equipment) {
            const { data: eqData } = await supabase
                .from('equipment')
                .select('name, current_available')
                .eq('id', item.equipment_id)
                .single()

            if (eqData) {
                const { data: bookedCount } = await supabase
                    .rpc('check_equipment_booked_quantity', {
                        p_equipment_id: item.equipment_id,
                        p_start_date: data.start_date,
                        p_end_date: data.end_date,
                        p_exclude_event_id: id
                    })

                const actualAvailable = eqData.current_available - (Number(bookedCount) || 0)

                if (item.quantity > actualAvailable) {
                    return { error: `Disponibilità insufficiente per: ${eqData.name}. Richiesti: ${item.quantity}, Disponibili: ${Math.max(0, actualAvailable)}` }
                }
            }
        }
    }

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

    // Sync to Google Calendar if configured
    try {
        const { data: config } = await supabase
            .from('google_calendar_configs')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single()

        if (config) {
            if (currentEvent?.google_event_id) {
                await updateGoogleEvent(user.id, currentEvent.google_event_id, {
                    name: data.name,
                    location: data.location,
                    notes: data.notes,
                    start_date: data.start_date,
                    end_date: data.end_date
                })

                await supabase
                    .from('events')
                    .update({ last_synced_at: new Date().toISOString() })
                    .eq('id', id)
            } else {
                // Se non era sincronizzato, proviamo a crearlo ora
                const googleEvent = await createGoogleEvent(user.id, {
                    name: data.name,
                    location: data.location,
                    notes: data.notes,
                    start_date: data.start_date,
                    end_date: data.end_date
                })

                if (googleEvent.id) {
                    await supabase
                        .from('events')
                        .update({
                            google_event_id: googleEvent.id,
                            last_synced_at: new Date().toISOString()
                        })
                        .eq('id', id)
                }
            }
        }
    } catch (err) {
        console.error('Error syncing to Google Calendar:', err)
    }

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
