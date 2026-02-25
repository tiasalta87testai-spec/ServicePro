-- Function to check equipment availability for a given date range
-- Returns the total quantity of the specified equipment that is already booked in other CONFIRMED or COMPLETED events overlapping with the given dates.
-- It excludes events with 'draft' or 'cancelled' status.

CREATE OR REPLACE FUNCTION public.check_equipment_booked_quantity(
    p_equipment_id uuid,
    p_start_date timestamp with time zone,
    p_end_date timestamp with time zone,
    p_exclude_event_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booked_quantity integer;
BEGIN
    SELECT COALESCE(SUM(ee.quantity), 0)
    INTO v_booked_quantity
    FROM public.event_equipment ee
    JOIN public.events e ON ee.event_id = e.id
    WHERE ee.equipment_id = p_equipment_id
      AND e.status IN ('confirmed', 'completed')
      -- Handle logic to exclude current event if updating
      AND (p_exclude_event_id IS NULL OR e.id != p_exclude_event_id)
      -- Check for date overlap (start1 <= end2 AND start2 <= end1)
      -- We use in_date and out_date as they represent when the equipment leaves/returns
      AND e.out_date <= p_end_date
      AND e.in_date >= p_start_date;

    RETURN v_booked_quantity;
END;
$$;
