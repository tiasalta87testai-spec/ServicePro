"use server"

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"

export async function getTeamMembers() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true })

    if (error) {
        return { error: error.message }
    }

    return { data: data || [] }
}

export async function addTeamMember(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    // Get current user's tenant_id
    const { data: currentUser } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!currentUser) return { error: 'Utente non trovato' }

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const role = formData.get('role') as string
    const phone = formData.get('phone') as string
    const specialization = formData.get('specialization') as string
    const password = formData.get('password') as string

    // Create auth user via Supabase Admin service role
    const adminAuthClient = createAdminClient()

    const { data: newAuthUser, error: authError } = await adminAuthClient.auth.admin.createUser({
        email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
    })

    if (authError) {
        return { error: 'Impossibile creare account in Supabase Auth: ' + authError.message }
    }

    // Insert user into the public.users database pointing to the newly created auth user id
    const { error: insertError } = await supabase
        .from('users')
        .insert({
            id: newAuthUser.user.id,
            tenant_id: currentUser.tenant_id,
            full_name: fullName,
            email,
            phone,
            role,
            specialization,
        })

    if (insertError) {
        // Fallback: delete auth user if profile creation fails avoiding detached account
        await adminAuthClient.auth.admin.deleteUser(newAuthUser.user.id)
        return { error: insertError.message }
    }

    return { success: true, note: 'Membro aggiunto al team con successo!' }
}

export async function updateTeamMember(id: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    const fullName = formData.get('full_name') as string
    const role = formData.get('role') as string
    const phone = formData.get('phone') as string
    const specialization = formData.get('specialization') as string
    const password = formData.get('password') as string // optional password update

    // If password is provided, update it via Admin API
    if (password && password.trim().length > 0) {
        const adminAuthClient = createAdminClient()
        const { error: pwdError } = await adminAuthClient.auth.admin.updateUserById(
            id,
            { password: password }
        )
        if (pwdError) {
            return { error: 'Impossibile aggiornare la password: ' + pwdError.message }
        }
    }

    const { error } = await supabase
        .from('users')
        .update({
            full_name: fullName,
            role,
            phone,
            specialization,
        })
        .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
}

export async function removeTeamMember(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorizzato' }

    // Don't allow removing yourself
    if (id === user.id) return { error: 'Non puoi rimuovere te stesso' }

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    return { success: true }
}
