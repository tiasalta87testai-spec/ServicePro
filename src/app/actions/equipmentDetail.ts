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
