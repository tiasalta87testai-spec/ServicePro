import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useClashDetection(
    equipmentId: string | null,
    startDate: string | null,
    endDate: string | null,
    excludeEventId?: string | null
) {
    const [bookedQuantity, setBookedQuantity] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function checkAvailability() {
            if (!equipmentId || !startDate || !endDate) {
                setBookedQuantity(0)
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .rpc('check_equipment_booked_quantity', {
                        p_equipment_id: equipmentId,
                        p_start_date: startDate,
                        p_end_date: endDate,
                        p_exclude_event_id: excludeEventId || null
                    })

                if (error) {
                    throw error
                }

                setBookedQuantity(Number(data) || 0)
            } catch (err: any) {
                console.error('Error checking availability:', err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        // Debounce the call slightly to avoid too many requests while typing dates
        const timeoutId = setTimeout(() => {
            checkAvailability()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [equipmentId, startDate, endDate, excludeEventId])

    return { bookedQuantity, isLoading, error }
}
