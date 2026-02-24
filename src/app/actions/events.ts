"use server"

import { createClient } from "@/utils/supabase/server"

export type Event = {
    id: string
    tenant_id: string
    client_id: string | null
    name: string
    start_date: string
    end_date: string
    in_date: string
    out_date: string
    location: string | null
    status: string
    total_price: number | null
    created_at: string
}

export async function getEventsList() {
    const supabase = await createClient()

    // Get active tenant
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    // Join con la tabella clients per avere il nome
    const { data, error } = await supabase
        .from('events')
        .select(`
      *,
      clients (
        name,
        company_name
      )
    `)
        .order('start_date', { ascending: true })

    if (error) {
        return { error: error.message }
    }

    return { data: data }
}
