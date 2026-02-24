"use server"

import { createClient as createSupabaseClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type Client = {
    id: string
    tenant_id: string
    name: string | null
    company_name: string | null
    email: string | null
    phone: string | null
    client_type: 'private' | 'company' | 'agency'
    vat_number: string | null
    tax_code: string | null
    address: string | null
    city: string | null
    zip_code: string | null
    province: string | null
    country: string | null
    sdi_code: string | null
    pec_email: string | null
    created_at?: string
}

export async function getClientsList() {
    const supabase = await createSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name', { ascending: true })
        .order('name', { ascending: true })

    if (error) return { error: error.message }
    return { data: data || [] }
}

export async function getClientById(id: string) {
    const supabase = await createSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    // Fetch client details
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

    if (clientError) {
        return { error: clientError.message }
    }

    // Fetch related events history (Storico attività svolte)
    const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
            id,
            name,
            start_date,
            end_date,
            status,
            location
        `)
        .eq('client_id', id)
        .order('start_date', { ascending: false })

    if (eventsError) {
        console.error("Errore recupero storico eventi:", eventsError)
    }

    return { data: { client, events: events || [] } }
}

export async function createClient(formData: FormData) {
    const supabase = await createSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userData) return { error: 'Utente non trovato' }

    const clientType = formData.get('client_type') as string || 'company'
    const companyName = formData.get('company_name') as string
    const name = formData.get('name') as string

    if (!companyName && !name) {
        return { error: 'Inserisci almeno un Nome o Ragione Sociale' }
    }

    const newClient = {
        tenant_id: userData.tenant_id,
        client_type: clientType,
        company_name: companyName || null,
        name: name || null,
        email: formData.get('email') as string || null,
        phone: formData.get('phone') as string || null,
        vat_number: formData.get('vat_number') as string || null,
        tax_code: formData.get('tax_code') as string || null,
        address: formData.get('address') as string || null,
        city: formData.get('city') as string || null,
        zip_code: formData.get('zip_code') as string || null,
        province: formData.get('province') as string || null,
        country: formData.get('country') as string || null,
        sdi_code: formData.get('sdi_code') as string || null,
        pec_email: formData.get('pec_email') as string || null,
    }

    const { data, error } = await supabase
        .from('clients')
        .insert(newClient)
        .select('id')
        .single()

    if (error) {
        console.error("Create Client Error:", error)
        return { error: error.message }
    }

    revalidatePath('/clients')
    return { success: true, clientId: data.id }
}

export async function updateClient(id: string, formData: FormData) {
    const supabase = await createSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    const clientType = formData.get('client_type') as string || 'company'
    const companyName = formData.get('company_name') as string
    const name = formData.get('name') as string

    if (!companyName && !name) {
        return { error: 'Inserisci almeno un Nome o Ragione Sociale' }
    }

    const updatedClient = {
        client_type: clientType,
        company_name: companyName || null,
        name: name || null,
        email: formData.get('email') as string || null,
        phone: formData.get('phone') as string || null,
        vat_number: formData.get('vat_number') as string || null,
        tax_code: formData.get('tax_code') as string || null,
        address: formData.get('address') as string || null,
        city: formData.get('city') as string || null,
        zip_code: formData.get('zip_code') as string || null,
        province: formData.get('province') as string || null,
        country: formData.get('country') as string || null,
        sdi_code: formData.get('sdi_code') as string || null,
        pec_email: formData.get('pec_email') as string || null,
    }

    const { error } = await supabase
        .from('clients')
        .update(updatedClient)
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/clients')
    revalidatePath(`/clients/${id}`)
    return { success: true }
}

export async function deleteClient(id: string) {
    const supabase = await createSupabaseClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    // Check if client is used in events
    const { count, error: countError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', id)

    if (countError) {
        return { error: countError.message }
    }

    if (count && count > 0) {
        return { error: 'Impossibile eliminare un cliente associato ad eventi. Rimuovi prima gli eventi.' }
    }

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/clients')
    return { success: true }
}
