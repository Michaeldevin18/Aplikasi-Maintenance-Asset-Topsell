-- Insert a new bucket for maintenance photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('maintenance-photos', 'maintenance-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload maintenance photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'maintenance-photos');

-- Policy to allow public to view images
CREATE POLICY "Public can view maintenance photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'maintenance-photos');
