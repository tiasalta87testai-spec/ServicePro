import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex items-center justify-center p-12 w-full h-full min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <p className="text-sm font-medium animate-pulse">Caricamento dati in corso...</p>
            </div>
        </div>
    )
}
