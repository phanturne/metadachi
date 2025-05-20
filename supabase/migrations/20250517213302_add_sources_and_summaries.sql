-- Create enum type for source type
CREATE TYPE source_type AS ENUM ('TEXT', 'URL', 'FILE');

-- Create sources table
CREATE TABLE sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    type source_type NOT NULL,
    url TEXT, -- For URL sources: the URL, For others: null
    content TEXT, -- For TEXT: user's text, For URL: extracted webpage content, For FILE: null
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    is_public BOOLEAN DEFAULT false NOT NULL,
    file_path TEXT, -- For FILE sources: path in storage bucket, For others: null
    file_name TEXT, -- For FILE sources: original filename, For others: null
    file_size INTEGER, -- For FILE sources: size in bytes, For others: null
    file_type TEXT, -- For FILE sources: MIME type, For others: null
    CONSTRAINT file_size_check CHECK (file_size <= 5242880), -- 5MB in bytes
    CONSTRAINT file_fields_check CHECK (
        (type = 'FILE' AND file_path IS NOT NULL AND file_name IS NOT NULL AND file_size IS NOT NULL AND file_type IS NOT NULL AND content IS NULL) OR
        (type != 'FILE' AND file_path IS NULL AND file_name IS NULL AND file_size IS NULL AND file_type IS NULL)
    ),
    CONSTRAINT url_fields_check CHECK (
        (type = 'URL' AND url IS NOT NULL AND content IS NOT NULL) OR
        (type != 'URL' AND url IS NULL)
    ),
    CONSTRAINT text_field_check CHECK (
        (type IN ('TEXT', 'URL') AND content IS NOT NULL) OR
        (type = 'FILE' AND content IS NULL)
    )
);

-- Create summaries table
CREATE TABLE summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
    summary_text TEXT NOT NULL,
    key_points TEXT[] NOT NULL,
    quotes TEXT[] NOT NULL,
    tags TEXT[] NOT NULL,
    style TEXT NOT NULL,
    custom_instructions TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    is_public BOOLEAN DEFAULT false NOT NULL
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_sources_updated_at
    BEFORE UPDATE ON sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at
    BEFORE UPDATE ON summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public)
VALUES ('source_files', 'source_files', false);

-- Create storage policy to allow authenticated users to upload files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'source_files' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Create storage policy to allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'source_files' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Create storage policy to allow users to read public files
CREATE POLICY "Anyone can read public files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'source_files' AND
    EXISTS (
        SELECT 1 FROM sources
        WHERE sources.file_path = storage.objects.name
        AND sources.is_public = true
    )
);

-- Create storage policy to allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'source_files' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Enable Row Level Security
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for sources
CREATE POLICY "Users can view their own sources or public sources"
    ON sources FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own sources"
    ON sources FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sources"
    ON sources FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources"
    ON sources FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for summaries
CREATE POLICY "Users can view their own summaries or public summaries"
    ON summaries FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries"
    ON summaries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries"
    ON summaries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries"
    ON summaries FOR DELETE
    USING (auth.uid() = user_id);

-- Add function to clean up files when source is deleted
CREATE OR REPLACE FUNCTION delete_source_file()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.file_path IS NOT NULL THEN
        DELETE FROM storage.objects
        WHERE bucket_id = 'source_files'
        AND name = OLD.file_path;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to clean up files
CREATE TRIGGER cleanup_source_file
    BEFORE DELETE ON sources
    FOR EACH ROW
    EXECUTE FUNCTION delete_source_file();

-- Add function to sync public status between source and summary
CREATE OR REPLACE FUNCTION sync_source_summary_public_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all summaries linked to this source
    UPDATE summaries
    SET is_public = NEW.is_public
    WHERE source_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to sync public status
CREATE TRIGGER sync_source_summary_public_status
    AFTER UPDATE OF is_public ON sources
    FOR EACH ROW
    EXECUTE FUNCTION sync_source_summary_public_status();

-- Create indexes for better query performance
CREATE INDEX sources_user_id_idx ON sources(user_id);
CREATE INDEX summaries_user_id_idx ON summaries(user_id);
CREATE INDEX summaries_source_id_idx ON summaries(source_id);
CREATE INDEX sources_is_public_idx ON sources(is_public);
CREATE INDEX summaries_is_public_idx ON summaries(is_public);
