"use client"

import { ReactNode } from "react"
import { Sidebar, MobileNav } from "./Sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signout } from "@/app/login/actions"
import { LogOut } from "lucide-react"

export function AppLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 md:ml-[260px] pb-16 md:pb-0 flex flex-col min-h-screen">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 shrink-0 items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex-1" /> {/* Spacer */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-700">Utente</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-teal-400 hover:ring-offset-2 transition-all">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="bg-teal-100 text-teal-700">U</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Il mio Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signout()} className="text-red-500 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Esci</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Mobile Header */}
                <header className="md:hidden flex h-14 bg-slate-800 items-center justify-center sticky top-0 z-10 shrink-0">
                    <span className="text-lg font-bold font-sans text-white tracking-tight">
                        Service<span className="text-teal-400">Pro</span>
                    </span>
                </header>

                <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
            <MobileNav />
        </div>
    )
}
