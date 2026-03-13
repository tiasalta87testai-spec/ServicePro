import { createClient } from "@/utils/supabase/server"

export async function getEquipmentById(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) {
        return null
    }

    return data
}

export async function getEquipmentEvents(equipmentId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('event_equipment')
        .select(`
            quantity,
            is_loaded,
            is_returned,
            events (
                id,
                name,
                status,
                start_date,
                end_date,
                out_date,
                in_date
            )
        `)
        .eq('equipment_id', equipmentId)
        .order('start_date', { foreignTable: 'events', ascending: false })

    if (error) {
        console.error('Error fetching equipment events:', error)
        return []
    }

    return data || []
}
