-- Add columns for unique equipment type (brand/model) and document URL
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS brand_model text,
ADD COLUMN IF NOT EXISTS document_url text;

-- Create storage bucket for equipment documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('equipment_docs', 'equipment_docs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for equipment_docs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to upload documents' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'equipment_docs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to update documents' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow authenticated users to update documents" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'equipment_docs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated users to delete documents' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete documents" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'equipment_docs');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to documents' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Allow public read access to documents" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'equipment_docs');
  END IF;
END $$;
