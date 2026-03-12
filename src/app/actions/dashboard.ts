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
    // We use today's date format YYYY-MM-DD to avoid time zone issues with timestamp
    const today = new Date().toISOString().split('T')[0]
    const { count: activeEventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('in_date', today)
        .lte('out_date', today)
        .in('status', ['confirmed', 'completed'])

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

    // 4) Warehouse utilization and maintenance alerts
    const { data: equipData } = await supabase
        .from('equipment')
        .select('total_quantity, current_available, condition')

    let totalEq = 0
    let availEq = 0
    let maintenanceAlerts = 0

    if (equipData) {
        equipData.forEach(eq => {
            totalEq += (eq.total_quantity || 0)
            availEq += (eq.current_available || 0)
            if (eq.condition === 'da_revisionare') {
                maintenanceAlerts++
            }
        })
    }

    return {
        activeEvents: activeEventsCount || 0,
        equipmentOut: equipmentOutCount || 0,
        weeklyRevenue: totalRevenue || 0,
        equipmentTotal: totalEq,
        equipmentAvailable: availEq,
        maintenanceAlerts
    }
}

export async function getUpcomingEvents() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const today = new Date().toISOString().split('T')[0]

    const { data: events, error } = await supabase
        .from('events')
        .select('id, name, start_date, end_date, status, clients(name, company_name)')
        .gte('start_date', today)
        .order('start_date', { ascending: true })
        .limit(5)

    if (error) {
        console.error('Error fetching upcoming events:', error)
        return []
    }

    return events || []
}

export async function getDashboardEvents() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Next 30 days roughly
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: events, error } = await supabase
        .from('events')
        .select('id, name, start_date, end_date, status')
        .order('start_date', { ascending: true })

    if (error) {
        console.error('Error fetching dashboard events:', error)
        return []
    }

    return events || []
}
