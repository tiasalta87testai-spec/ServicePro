"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Equipment } from "../actions/equipment"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, QrCode } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export const columns: ColumnDef<Equipment>[] = [
    {
        accessorKey: "name",
        header: "Nome Articolo",
        cell: ({ row }) => <div className="font-semibold text-slate-800">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "category",
        header: "Categoria",
        cell: ({ row }) => {
            const cat = row.getValue("category") as string
            return <span className="capitalize text-slate-600">{cat}</span>
        }
    },
    {
        accessorKey: "track_type",
        header: "Tipologia",
        cell: ({ row }) => {
            const type = row.getValue("track_type") as string
            if (type === 'unique') return <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Singolo</Badge>
            if (type === 'bulk') return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Quantità</Badge>
            if (type === 'kit') return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Kit</Badge>
            return null
        }
    },
    {
        accessorKey: "current_available",
        header: "Disponibilità",
        cell: ({ row }) => {
            const avail = row.original.current_available
            const total = row.original.total_quantity
            const status = row.original.status

            if (status === 'maintenance') {
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">In Manutenzione</Badge>
            }

            if (avail === 0) {
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Esaurito ({avail}/{total})</Badge>
            }

            return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Disponibile ({avail}/{total})</Badge>
        }
    },
    {
        accessorKey: "daily_rental_price",
        header: "Prezzo/GG",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("daily_rental_price") || "0")
            return <div className="font-medium">€ {price.toFixed(2)}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const eq = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Apri menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/equipment/${eq.id}/edit`} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" /> Modifica
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <QrCode className="mr-2 h-4 w-4" /> Genera Etichetta
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Elimina
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
