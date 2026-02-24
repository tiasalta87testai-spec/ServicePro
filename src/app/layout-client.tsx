"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { createClient } from "@/utils/supabase/client"

export default function RootLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsAuthenticated(!!session)
        }

        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session)
        })

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth')

    // Don't render layout structure for auth pages
    if (isAuthPage) {
        return <>{children}</>
    }

    // Still checking auth state
    if (isAuthenticated === null) {
        return <div className="h-screen w-full bg-slate-50 flex items-center justify-center">Caricamento...</div>
    }

    return (
        <AppLayout>
            {children}
        </AppLayout>
    )
}
