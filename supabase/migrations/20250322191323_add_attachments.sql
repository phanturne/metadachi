-- Create public attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'Attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create access policies for attachments
-- Since the bucket is public, anyone can view files, but we still need policies for modifications

-- Users can upload their own attachments
CREATE POLICY "Users can upload their own attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Users can update their own attachments
CREATE POLICY "Users can update their own attachments"
ON storage.objects FOR UPDATE
USING (auth.uid() = (storage.foldername(name))[1]::uuid);

-- Users can delete their own attachments
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING (auth.uid() = (storage.foldername(name))[1]::uuid);

-- Add index to improve performance for JSON containment operations
CREATE INDEX IF NOT EXISTS idx_message_attachments ON "Message" USING GIN (attachments);