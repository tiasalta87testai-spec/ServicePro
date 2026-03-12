"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getMaintenanceList(equipmentId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false })

    if (error) {
        return { error: error.message }
    }

    return { data: data || [] }
}

export async function createMaintenance(data: {
    equipment_id: string
    issue_description: string
    repair_cost: number
    maintenance_type: string
    performed_by: string
    event_id?: string | null
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

    const { error } = await supabase
        .from('maintenance')
        .insert({
            tenant_id: userData.tenant_id,
            equipment_id: data.equipment_id,
            event_id: data.event_id || null,
            issue_description: data.issue_description,
            repair_cost: data.repair_cost || 0,
            maintenance_type: data.maintenance_type,
            maintenance_date: new Date().toISOString().split('T')[0],
            performed_by: data.performed_by,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/equipment/${data.equipment_id}`)
    return { success: true }
}

export async function resolveMaintenance(maintenanceId: string, equipmentId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('maintenance')
        .update({
            resolved_at: new Date().toISOString(),
        })
        .eq('id', maintenanceId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/equipment/${equipmentId}`)
    return { success: true }
}
