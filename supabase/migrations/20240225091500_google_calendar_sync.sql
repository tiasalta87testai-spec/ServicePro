-- Create table for Google Calendar configurations
CREATE TABLE IF NOT EXISTS public.google_calendar_configs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token text,
    refresh_token text,
    expiry_date bigint,
    calendar_id text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- Add Google Event ID and sync status to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS google_event_id text,
ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone;

-- Enable RLS for google_calendar_configs
ALTER TABLE public.google_calendar_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for google_calendar_configs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their own calendar config' AND tablename = 'google_calendar_configs'
  ) THEN
    CREATE POLICY "Users can manage their own calendar config" ON public.google_calendar_configs
    FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
