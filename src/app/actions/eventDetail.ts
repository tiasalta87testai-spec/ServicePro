import { createClient } from "@/utils/supabase/server"

export async function getEventById(id: string) {
  const supabase = await createClient()

  // Get active user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('[getEventById] No user found')
    return null
  }

  // Fetch event base data
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    console.error('[getEventById] Error fetching event:', error?.message)
    return null
  }

  // Fetch client data separately
  let clientData = null
  if (event.client_id) {
    const { data: client } = await supabase
      .from('clients')
      .select('name, company_name, email, phone')
      .eq('id', event.client_id)
      .single()
    clientData = client
  }

  // Fetch tenant data separately
  let tenantData = null
  if (event.tenant_id) {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, company_type, brand_primary_color, brand_logo_url, brand_document_footer')
      .eq('id', event.tenant_id)
      .single()
    tenantData = tenant
  }

  // Fetch packing list (event_equipment)
  const { data: equipmentDetails } = await supabase
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
    event: {
      ...event,
      clients: clientData,
      tenants: tenantData,
    },
    packingList: equipmentDetails || []
  }
}
