"use server"

import { createClient } from "@/utils/supabase/server"

export type Equipment = {
    id: string
    tenant_id: string
    name: string
    category: 'audio' | 'luci' | 'video' | 'strutture' | 'servizio'
    subcategory: string | null
    track_type: 'unique' | 'bulk' | 'kit'
    serial_number: string | null
    brand_model: string | null
    barcode: string | null
    total_quantity: number
    current_available: number
    daily_rental_price: number
    status: string | null
    condition: string
    weight_kg: number | null
    power_consumption_w: number | null
    purchase_price: number | null
    purchase_date: string | null
    insurance_value: number | null
    notes_maintenance: string | null
    document_url: string | null
}


export async function getEquipmentList() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        return { error: error.message }
    }

    return { data: data as Equipment[] }
}

export async function deleteEquipment(id: string) {
    const supabase = await createClient()

    // 1. Elimina prima i record di manutenzione associati (Cascade manuale)
    await supabase.from('maintenance_records').delete().eq('equipment_id', id)

    // 2. Elimina i legami con gli eventi (oppure potremmo bloccare se fosse in eventi confermati)
    // Dato che stiamo in fase di setup/testing, eliminiamo le associazioni
    await supabase.from('event_equipment').delete().eq('equipment_id', id)

    // 3. Infine, elimina l'equipaggiamento stesso
    const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id)

    if (error) {
        // Se è un errore di Foreign Key (codice 23503 in PostgreSQL), restituisci un msg amichevole
        if (error.code === '23503') {
             return { error: 'Questo articolo è in uso in uno o più eventi e non può essere eliminato.' }
        }
        return { error: error.message }
    }

    const { revalidatePath } = require("next/cache")
    revalidatePath('/equipment')

    return { success: true }
}
