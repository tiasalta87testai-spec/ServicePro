"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    CalendarDays,
    Package,
    Settings,
    QrCode,
    Users
} from "lucide-react"

import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clienti", href: "/clients", icon: Users },
    { name: "Eventi", href: "/events", icon: CalendarDays },
    { name: "Magazzino", href: "/equipment", icon: Package },
    { name: "Scanner", href: "/scanner", icon: QrCode, mobileOnly: true },
    { name: "Impostazioni", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden md:flex flex-col w-[260px] bg-slate-800 h-screen fixed top-0 left-0 border-r border-slate-700">
            <div className="flex items-center h-16 px-6 border-b border-slate-700">
                <span className="text-xl font-bold font-sans text-white tracking-tight">
                    Service<span className="text-teal-400">Pro</span>
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.filter(item => !item.mobileOnly).map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-slate-700/50 text-teal-400"
                                        : "text-slate-400 hover:bg-slate-700 hover:text-white"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-3 flex-shrink-0 h-5 w-5",
                                        isActive ? "text-teal-400" : "text-slate-400 group-hover:text-white"
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}

export function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
            <div className="flex justify-around items-center h-16">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-teal-500" : "text-slate-500"
                            )}
                        >
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
