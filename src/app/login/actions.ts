"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect("/login?error=Invalid email or password")
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function loginWithOtp(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get("email") as string

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    })

    if (error) {
        console.error("Magic Link Error:", error.message, error.status)
        if (error.status === 429) {
            redirect("/login?error=Troppe richieste. Riprova tra qualche minuto.")
        }
        redirect("/login?error=Non è stato possibile inviare il link magico")
    }

    redirect("/login?success=Link magico inviato! Controlla la tua email")
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        options: {
            data: {
                full_name: formData.get("full_name") as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        redirect("/login?error=Could not authenticate user")
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
}
