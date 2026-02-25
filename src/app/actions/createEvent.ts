"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { createGoogleEvent } from "@/lib/google-calendar"

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
                        p_end_date: data.end_date
                    })

                const actualAvailable = eqData.current_available - (Number(bookedCount) || 0)

                if (item.quantity > actualAvailable) {
                    return { error: `Disponibilità insufficiente per: ${eqData.name}. Richiesti: ${item.quantity}, Disponibili: ${Math.max(0, actualAvailable)}` }
                }
            }
        }
    }

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
        .select('*')
        .single()

    if (eventError || !event) return { error: eventError?.message || 'Errore creazione evento' }

    // Sync to Google Calendar if configured
    try {
        const { data: config } = await supabase
            .from('google_calendar_configs')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single()

        if (config) {
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
                    .eq('id', event.id)
            }
        }
    } catch (err) {
        console.error('Error syncing to Google Calendar:', err)
        // Non blocchiamo la creazione dell'evento se la sincronizzazione fallisce
    }

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
