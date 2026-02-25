"use server"

import { createClient } from "@/utils/supabase/server"

export async function updateCompanySettings(data: {
    name: string
    vat_number?: string | null
    address?: string | null
    email?: string | null
    phone?: string | null
    brand_primary_color?: string | null
    brand_logo_url?: string | null
    brand_document_footer?: string | null
}) {
    try {
        const supabase = await createClient()

        // Ensure user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error("Utente non autenticato")

        // Get tenant ID for current user
        const { data: currentUser, error: userFetchError } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (userFetchError || !currentUser?.tenant_id) {
            throw new Error("Impossibile trovare l'azienda associata all'utente")
        }

        // Update tenant
        const { error: updateError } = await supabase
            .from('tenants')
            .update({
                name: data.name,
                vat_number: data.vat_number,
                address: data.address,
                email: data.email,
                phone: data.phone,
                brand_primary_color: data.brand_primary_color,
                brand_logo_url: data.brand_logo_url,
                brand_document_footer: data.brand_document_footer,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.tenant_id)

        if (updateError) {
            console.error('Error updating tenant:', updateError)
            return { success: false, error: "Errore durante il salvataggio delle impostazioni." }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Update company settings error:', error)
        return { success: false, error: error.message || "Si è verificato un errore imprevisto." }
    }
}
