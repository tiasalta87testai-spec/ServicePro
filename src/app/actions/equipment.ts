"use server"

import { createClient } from "@/utils/supabase/server"

export type Equipment = {
    id: string
    tenant_id: string
    name: string
    category: 'audio' | 'luci' | 'video' | 'strutture'
    track_type: 'unique' | 'bulk' | 'kit'
    serial_number: string | null
    barcode: string | null
    total_quantity: number
    current_available: number
    daily_rental_price: number
    status: string | null
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

    const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
