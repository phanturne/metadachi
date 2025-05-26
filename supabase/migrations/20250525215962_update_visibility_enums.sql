-- Drop existing enum and create new one
DROP TYPE IF EXISTS notebook_visibility CASCADE;
CREATE TYPE visibility_type AS ENUM ('PRIVATE', 'PUBLIC', 'SHARED');

-- Drop all policies that depend on is_public
DROP POLICY IF EXISTS "Users can view their own sources or public sources" ON sources;
DROP POLICY IF EXISTS "Users can view their own summaries or public summaries" ON summaries;
DROP POLICY IF EXISTS "Anyone can read public files" ON storage.objects;

-- Drop trigger and function that depend on is_public column
DROP TRIGGER IF EXISTS sync_source_summary_public_status ON sources;
DROP FUNCTION IF EXISTS sync_source_summary_public_status();

-- Add visibility column to sources table
ALTER TABLE sources 
    DROP COLUMN is_public,
    ADD COLUMN visibility visibility_type DEFAULT 'PRIVATE' NOT NULL;

-- Update summaries table to use new enum
ALTER TABLE summaries 
    DROP COLUMN is_public,
    ADD COLUMN visibility visibility_type DEFAULT 'PRIVATE' NOT NULL;

-- Create function to sync visibility between source and summary
CREATE OR REPLACE FUNCTION sync_source_summary_visibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all summaries linked to this source
    UPDATE summaries
    SET visibility = NEW.visibility
    WHERE source_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync visibility
DROP TRIGGER IF EXISTS sync_source_summary_visibility ON sources;
CREATE TRIGGER sync_source_summary_visibility
    AFTER INSERT OR UPDATE OF visibility ON sources
    FOR EACH ROW
    EXECUTE FUNCTION sync_source_summary_visibility();

-- Update RLS policies for sources
CREATE POLICY "Users can view their own sources"
    ON sources FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public or shared sources"
    ON sources FOR SELECT
    USING (visibility IN ('PUBLIC', 'SHARED'));

-- Update RLS policies for summaries
CREATE POLICY "Users can view their own summaries"
    ON summaries FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public or shared summaries"
    ON summaries FOR SELECT
    USING (visibility IN ('PUBLIC', 'SHARED'));

-- Create new storage policy for public and shared files
CREATE POLICY "Anyone can read public or shared files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'source_files' AND
    EXISTS (
        SELECT 1 FROM sources
        WHERE sources.file_path = storage.objects.name
        AND sources.visibility IN ('PUBLIC', 'SHARED')
    )
);

-- Create indexes for visibility
CREATE INDEX idx_sources_visibility ON sources(visibility);
CREATE INDEX idx_summaries_visibility ON summaries(visibility); 