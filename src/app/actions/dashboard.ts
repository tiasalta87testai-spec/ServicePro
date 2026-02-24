"use server"

import { createClient } from "@/utils/supabase/server"

export async function getDashboardStats() {
    const supabase = await createClient()

    // 1. Get current tenant/user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Non autorizzato' }
    }

    // Realistically we'd use the tenant_id constraint through RLS,
    // but let's grab the actual tenant context just to be safe
    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData?.tenant_id) {
        return { error: 'Tenant non trovato' }
    }

    // 1) Active events
    const today = new Date().toISOString()
    const { count: activeEventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('in_date', today)
        .lte('out_date', today)

    // 2) Equipment out (loaded but not returned)
    const { count: equipmentOutCount } = await supabase
        .from('event_equipment')
        .select('*', { count: 'exact', head: true })
        .eq('is_loaded', true)
        .eq('is_returned', false)

    // 3) Weekly revenue (quotes linked to active events this week)
    // For simplicity, we aggregate total_amount of accepted quotes
    const { data: quotes } = await supabase
        .from('quotes')
        .select('total_amount')
        .eq('status', 'accepted')

    const totalRevenue = quotes?.reduce((acc, q) => acc + (q.total_amount || 0), 0) || 0

    return {
        activeEvents: activeEventsCount || 0,
        equipmentOut: equipmentOutCount || 0,
        weeklyRevenue: totalRevenue || 0
    }
}
