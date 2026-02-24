import { createClient } from "@/utils/supabase/server"

export async function getEventById(id: string) {
  const supabase = await createClient()

  // Get active tenant
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Join con la tabella clients
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      clients (
        name,
        company_name,
        email,
        phone
      )
    `)
    .eq('id', id)
    .single()

  if (error || !event) {
    return null
  }

  // Fetch packing list (event_equipment)
  const { data: equipmentDetails, error: eqError } = await supabase
    .from('event_equipment')
    .select(`
      id,
      quantity,
      is_loaded,
      is_returned,
      equipment (
        id,
        name,
        category,
        track_type,
        serial_number,
        daily_rental_price
      )
    `)
    .eq('event_id', id)

  return {
    event,
    packingList: equipmentDetails || []
  }
}
