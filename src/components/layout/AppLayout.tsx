"use client"

import { ReactNode } from "react"
import { Sidebar, MobileNav } from "./Sidebar"

export function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 md:ml-[260px] pb-16 md:pb-0 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile Header - Keep for mobile navigation context if needed, otherwise can be removed */}
                <header className="md:hidden flex h-14 bg-slate-800 items-center justify-center gap-3 sticky top-0 z-50 shrink-0">
                    <img src="/icon.png" alt="Logo" className="w-6 h-6 rounded-md" />
                    <span className="text-lg font-bold font-sans text-white tracking-tight">
                        Service<span className="text-teal-400">Pro</span>
                    </span>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
                    {children}
                </main>
            </div>
            <MobileNav />
        </div>
    )
}
