"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteEquipment } from "@/app/actions/equipment"

export default function DeleteEquipmentButton({ id }: { id: string }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (window.confirm("Sei sicuro di voler eliminare questo articolo? Questa azione terminerà definitivamente l'articolo.")) {
            setIsDeleting(true)
            const res = await deleteEquipment(id)
            if (res.error) {
                alert(`Impossibile eliminare l'articolo: ${res.error}`)
                setIsDeleting(false)
            } else {
                router.push('/equipment')
            }
        }
    }

    return (
        <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
        >
            <Trash2 className="mr-2 h-4 w-4" /> 
            {isDeleting ? "Eliminazione..." : "Elimina"}
        </Button>
    )
}
