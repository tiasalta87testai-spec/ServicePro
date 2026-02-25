-- Migration to add brand customization fields to the tenants table

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS brand_primary_color varchar(20) DEFAULT '#0f766e',
ADD COLUMN IF NOT EXISTS brand_logo_url text,
ADD COLUMN IF NOT EXISTS brand_document_footer text;
