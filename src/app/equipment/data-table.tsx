"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table"
import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Package, Smartphone, List, Search, Filter } from "lucide-react"
import Link from "next/link"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
            columnVisibility: {
                subcategory: false
            }
        }
    })

    const categoryFilterValue = (table.getColumn("category")?.getFilterValue() as string) || "all"
    const subcategoryFilterValue = (table.getColumn("subcategory")?.getFilterValue() as string) || "all"
    const conditionFilterValue = (table.getColumn("condition")?.getFilterValue() as string) || "all"
    
    // Derived subcategories based on standard categories
    const EQUIPMENT_SUBCATEGORIES: Record<string, string[]> = {
        audio: ['Casse', 'Mixer', 'Microfoni', 'Cavi', 'Aste', 'Altro'],
        luci: ['Fari', 'Mixer Luci', 'Teste Mobili', 'Cavi', 'Stativi', 'Altro'],
        video: ['Proiettori', 'Schermi', 'Telecamere', 'Cavi', 'Altro'],
        strutture: ['Americane', 'Elevatori', 'Pedane', 'Zavorre', 'Altro'],
        servizio: ['Cavi Elettrici', 'Quadri Elettrici', 'Fascette', 'Nastro', 'Altro']
    }

    const availableSubcategories = categoryFilterValue !== "all" 
        ? EQUIPMENT_SUBCATEGORIES[categoryFilterValue] || []
        : [];

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4 bg-white border-b border-slate-200 rounded-t-lg dark:bg-transparent dark:border-white/10">
                <div className="relative w-full sm:max-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cerca per nome..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-10 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-xl"
                    />
                </div>
                
                <div className="flex flex-wrap gap-2 flex-1 w-full">
                    <Select
                        value={categoryFilterValue}
                        onValueChange={(value) => {
                            table.getColumn("category")?.setFilterValue(value === "all" ? "" : value)
                            table.getColumn("subcategory")?.setFilterValue("")
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[160px] dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-xl">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                            <SelectItem value="all">Tutte le Categorie</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="luci">Luci</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="strutture">Strutture</SelectItem>
                            <SelectItem value="servizio">Servizio</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={conditionFilterValue}
                        onValueChange={(value) =>
                            table.getColumn("condition")?.setFilterValue(value === "all" ? "" : value)
                        }
                    >
                        <SelectTrigger className="w-full sm:w-[160px] dark:bg-slate-800/50 dark:border-slate-700 dark:text-white rounded-xl">
                            <SelectValue placeholder="Stato Materiale" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                            <SelectItem value="all">Tutti gli Stati</SelectItem>
                            <SelectItem value="ottimo">Ottimo</SelectItem>
                            <SelectItem value="buono">Buono</SelectItem>
                            <SelectItem value="da_revisionare">Da Revisionare</SelectItem>
                            <SelectItem value="dismesso">Dismesso</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Default Table for Desktop */}
            <div className="hidden md:block rounded-none border-0">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nessun articolo trovato.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Premium Cards for Mobile (PWA) */}
            <div className="md:hidden p-4 space-y-4">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const item = row.original as any;
                        const statusColor = 
                            item.condition === 'ottimo' ? 'text-teal-400 bg-teal-400/10' :
                            item.condition === 'buono' ? 'text-blue-400 bg-blue-400/10' :
                            item.condition === 'da_revisionare' ? 'text-amber-400 bg-amber-400/10' :
                            'text-red-400 bg-red-400/10';

                        return (
                            <Link href={`/equipment/${item.id}`} key={row.id} className="block glass p-4 relative group overflow-hidden">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                                        <Package className="h-8 w-8 text-slate-400 group-hover:text-teal-400 transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-base font-bold text-white line-clamp-2">
                                                {item.name}
                                            </h3>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                {item.category}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${statusColor}`}>
                                                {item.condition?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                                            <span className="text-xs text-slate-300">
                                                Quantità: <span className="font-bold text-white">{item.total_quantity}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-slate-400 font-medium uppercase">Noleggio:</span>
                                            <span className="text-xs font-bold text-teal-400">€ {parseFloat(item.daily_rental_price || 0).toFixed(2)} /gg</span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono self-end">
                                        ID: {item.id.slice(0, 6)}
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="text-center py-12 glass">
                        <p className="text-slate-500">Nessun articolo trovato.</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end space-x-2 p-4 border-t border-slate-200 dark:border-white/10">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Precedente
                </Button>
                <span className="text-sm text-slate-500">
                    Pagina {table.getState().pagination.pageIndex + 1} di {table.getPageCount()}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Successiva
                </Button>
            </div>
        </div>
    )
}
