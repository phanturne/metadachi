-- Create public attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'Attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create access policies for attachments
-- Public read access policy
CREATE POLICY "Allow public read access on attachments"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'attachments');

-- Authenticated users can access their own attachments for all operations
CREATE POLICY "Allow authenticated access to own attachments"
    ON storage.objects FOR ALL TO authenticated
    USING (
        bucket_id = 'attachments'
        AND owner = auth.uid()
        AND (storage.foldername(name))[1] = auth.uid()::text
    )    WITH CHECK (        bucket_id = 'attachments'        AND (storage.foldername(name))[1] = auth.uid()::text
        AND (ARRAY_LENGTH(regexp_split_to_array(name, '/'), 1) = 2)
    );
