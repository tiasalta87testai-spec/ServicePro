-- Add missing company details columns to the tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS vat_number text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
