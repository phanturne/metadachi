CREATE EXTENSION IF NOT EXISTS vector;

-- Remove the embeddings column
ALTER TABLE embedding
DROP COLUMN embeddings;

-- Add the embedding column of type vector(1536)
ALTER TABLE embedding
ADD COLUMN embedding vector(1536) NOT NULL;

-- Make file_id, hash, and tokens columns NOT NULL
ALTER TABLE embedding
ALTER COLUMN file_id SET NOT NULL,
ALTER COLUMN hash SET NOT NULL,
ALTER COLUMN tokens SET NOT NULL;

-- Function to recursively get all file_ids from each folder
CREATE OR REPLACE FUNCTION get_all_file_ids_from_folders(folder_ids UUID[])
RETURNS UUID[] AS $$
DECLARE
    file_ids UUID[];
BEGIN
    WITH RECURSIVE folder_tree AS (
        SELECT id
        FROM folder
        WHERE id = ANY(folder_ids)
        UNION ALL
        SELECT f.id
        FROM folder f
        INNER JOIN folder_tree ft ON f.parent_id = ft.id
    )
    SELECT ARRAY_AGG(DISTINCT file.id)
    INTO file_ids
    FROM file
    WHERE folder_id = ANY(SELECT id FROM folder_tree);

    RETURN file_ids;
END;
$$ LANGUAGE plpgsql;

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
  from embedding
  where (file_id = ANY(file_ids))
  order by embedding.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name)
VALUES ('files', 'files');

-- RLS policies for storage.objects table
CREATE POLICY select_files_policy ON storage.objects
FOR SELECT
USING (
    bucket_id = 'files' AND (
        NOT EXISTS (
            SELECT 1 FROM file
            WHERE file.file_path = storage.objects.name
        ) OR (
            EXISTS (
                SELECT 1 FROM file
                WHERE file.file_path = storage.objects.name
                AND (
                    file.sharing = 'public' OR
                    (file.sharing = 'private' AND file.user_id = auth.uid()) OR
                    (file.sharing = 'custom' AND (
                        file.user_id = auth.uid() OR
                        has_permission('file', file.id, auth.uid())
                    ))
                )
            )
        )
    )
);

CREATE POLICY insert_files_policy ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'files'
    AND (SELECT auth.uid()::text) = (storage.foldername(name))[1]
);

CREATE POLICY update_files_policy ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'files'
    AND (SELECT auth.uid()::text) = (storage.foldername(name))[1]
);

CREATE POLICY delete_files_policy ON storage.objects
FOR DELETE
USING (
    bucket_id = 'files'
    AND (SELECT auth.uid()::text) = (storage.foldername(name))[1]
);

-- Function to handle file deletion
CREATE OR REPLACE FUNCTION delete_old_file()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only proceed if file_path has changed and old file exists
    IF OLD.file_path IS NOT NULL AND (TG_OP = 'DELETE' OR NEW.file_path IS DISTINCT FROM OLD.file_path) THEN
        -- Extract the path from the file_path
        -- Assuming file_path format: https://[your-project].supabase.co/storage/v1/object/public/files/[path]
        DECLARE
            file_path TEXT;
        BEGIN
            file_path := regexp_replace(OLD.file_path, '^.*/files/', '');
            
            -- Delete the old file from storage
            DELETE FROM storage.objects
            WHERE bucket_id = 'files'
            AND name = file_path;
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
BEFORE DELETE OR UPDATE OF file_path ON file
FOR EACH ROW
EXECUTE FUNCTION delete_old_file();