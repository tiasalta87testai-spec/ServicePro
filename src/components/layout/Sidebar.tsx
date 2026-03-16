"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    CalendarDays,
    Calendar,
    Package,
    Settings,
    QrCode,
    Users,
    LogOut
} from "lucide-react"

import { cn } from "@/lib/utils"
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

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clienti", href: "/clients", icon: Users },
    { name: "Eventi", href: "/events", icon: CalendarDays },
    { name: "Calendario", href: "/calendar", icon: Calendar },
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
            <div className="p-4 border-b border-slate-700">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-slate-700/50 transition-colors group focus:outline-none text-left">
                            <Avatar className="h-9 w-9 ring-2 ring-transparent group-hover:ring-teal-400/50 group-hover:ring-offset-2 group-hover:ring-offset-slate-800 transition-all">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-teal-100 text-teal-700">U</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start overflow-hidden">
                                <span className="text-sm font-medium text-white truncate w-full">Utente</span>
                                <span className="text-xs text-slate-400 truncate w-full">Il mio account</span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right" className="w-56 ml-2 bg-slate-800 border-slate-700 text-white">
                        <DropdownMenuLabel className="text-slate-400 font-normal">Il mio Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem onClick={() => signout()} className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Esci</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 app-bottom-nav">
            <div className="flex justify-around items-center h-full">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive ? "text-teal-400 font-bold" : "text-slate-500/80"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6 transition-transform", isActive && "scale-110")} aria-hidden="true" />
                            <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
