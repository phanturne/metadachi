CREATE EXTENSION IF NOT EXISTS vector;

-- Create storage bucket for library images
INSERT INTO storage.buckets (id, name)
VALUES ('library-images', 'Library Images');

-- Create Library table
CREATE TABLE "Library" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "imagePath" VARCHAR(255),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibility" VARCHAR DEFAULT 'private' NOT NULL CHECK ("visibility" IN ('public', 'private'))
);

-- Add indices for Library
CREATE INDEX "idx_library_userId" ON "Library" ("userId");
CREATE UNIQUE INDEX "idx_library_name_user" ON "Library" ("userId", "name");

-- Enable RLS for Library
ALTER TABLE "Library" ENABLE ROW LEVEL SECURITY;

-- Add policies for Library
CREATE POLICY "Users can view their own libraries" ON "Library"
    FOR SELECT
    USING ("visibility" = 'public' OR "userId" = auth.uid());

CREATE POLICY "Users can manage their own libraries" ON "Library"
    FOR ALL TO authenticated
    USING ("userId" = auth.uid())
    WITH CHECK ("userId" = auth.uid());

-- Add storage policies for library images
CREATE POLICY "Allow public read access on library images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'library-images');

CREATE POLICY "Allow authenticated access to own library images"
    ON storage.objects FOR ALL TO authenticated
    USING (
        bucket_id = 'library-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'library-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Create File table
CREATE TABLE "File" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visibility" VARCHAR DEFAULT 'private' NOT NULL CHECK ("visibility" IN ('public', 'private')),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "filePath" VARCHAR(255) NOT NULL,
    "size" INT,
    "tokens" INT,
    "hash" VARCHAR(64),
    "type" VARCHAR(50),
    "metadata" JSONB,
    "libraryId" UUID REFERENCES "Library"(id) ON DELETE SET NULL
);

-- Indices for File table
CREATE INDEX "idx_file_userId" ON "File" ("userId");
CREATE INDEX "idx_file_hash" ON "File" ("hash");
CREATE INDEX "idx_file_libraryId" ON "File" ("libraryId");

-- Enable RLS for File
ALTER TABLE "File" ENABLE ROW LEVEL SECURITY;

-- File policies
CREATE POLICY "Users can view public or own files" ON "File"
    FOR SELECT
    USING ("visibility" = 'public' OR "userId" = auth.uid());

CREATE POLICY "Users can manage their own files" ON "File"
    FOR ALL TO authenticated
    USING ("userId" = auth.uid())
    WITH CHECK ("userId" = auth.uid());

-- Create Embedding table
CREATE TABLE "Embedding" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "fileId" UUID NOT NULL REFERENCES "File"(id) ON DELETE CASCADE,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "tokens" INT NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "metadata" JSONB
);

-- Indices for Embedding table
CREATE INDEX "idx_embedding_userId" ON "Embedding" ("userId");
CREATE INDEX "idx_embedding_fileId" ON "Embedding" ("fileId");
CREATE INDEX "idx_embedding_hash" ON "Embedding" ("hash");

-- Enable RLS
ALTER TABLE "Embedding" ENABLE ROW LEVEL SECURITY;

-- Policies for Embedding table
CREATE POLICY select_embedding_policy ON "Embedding"
FOR SELECT
USING ("userId" = auth.uid());

CREATE POLICY insert_embedding_policy ON "Embedding"
FOR INSERT
WITH CHECK ("userId" = auth.uid());

CREATE POLICY update_embedding_policy ON "Embedding"
FOR UPDATE
USING ("userId" = auth.uid());

CREATE POLICY delete_embedding_policy ON "Embedding"
FOR DELETE
USING ("userId" = auth.uid());

-- Update match_embeddings function to combine file_ids with folder_ids and ensure distinct file_ids
CREATE OR REPLACE FUNCTION match_embeddings (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  file_ids UUID[] DEFAULT null
) returns table (
  id UUID,
  file_id UUID,
  content TEXT,
  tokens INT,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    file_id,
    content,
    tokens,
    1 - (embedding.embedding <=> query_embedding) as similarity
  from "Embedding"
  where (file_id = ANY(file_ids))
  order by embedding.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name)
VALUES ('files', 'Files');

-- Simplified storage policies
CREATE POLICY "Allow public read access on file objects"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'files');

CREATE POLICY "Allow authenticated access to own file objects"
    ON storage.objects FOR ALL TO authenticated
    USING (
        bucket_id = 'files'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'files'
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND (ARRAY_LENGTH(regexp_split_to_array(name, '/'), 1) = 2)
    );

-- Function to handle file deletion
CREATE OR REPLACE FUNCTION delete_old_file()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only proceed if "filePath" has changed and old file exists
    IF OLD."filePath" IS NOT NULL AND (TG_OP = 'DELETE' OR NEW."filePath" IS DISTINCT FROM OLD."filePath") THEN
        -- Extract the path from the "filePath"
        -- Assuming "filePath" format: https://[your-project].supabase.co/storage/v1/object/public/files/[path]
        DECLARE
            "filePath" TEXT;
        BEGIN
            "filePath" := regexp_replace(OLD."filePath", '^.*/files/', '');
            
            -- Delete the old file from storage
            DELETE FROM storage.objects
            WHERE bucket_id = 'files'
            AND name = "filePath";
        EXCEPTION
            WHEN OTHERS THEN
                -- Log error but don't prevent the trigger from completing
                RAISE WARNING 'Failed to delete old file: %', SQLERRM;
        END;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger to handle file deletion
CREATE TRIGGER trigger_delete_old_file
BEFORE DELETE OR UPDATE OF "filePath" ON "File"
FOR EACH ROW
EXECUTE FUNCTION delete_old_file();

-- Add libraryId to Chat table
ALTER TABLE "Chat"
ADD COLUMN "libraryId" UUID REFERENCES "Library"(id) ON DELETE SET NULL;

CREATE INDEX "idx_chat_libraryId" ON "Chat" ("libraryId");