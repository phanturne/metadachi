-- Create notebooks table
CREATE TABLE notebooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 100),
    description TEXT CHECK (char_length(description) <= 500),
    visibility visibility_type DEFAULT 'PRIVATE' NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cover_image_url TEXT CHECK (
        cover_image_url IS NULL OR (
            char_length(cover_image_url) <= 1000
            AND cover_image_url ~* '^https?://'
        )
    ),
    tags TEXT[] DEFAULT '{}'::TEXT[],
    is_featured BOOLEAN DEFAULT false NOT NULL,
    featured_at TIMESTAMPTZ,
    CONSTRAINT featured_check CHECK (
        (visibility = 'PUBLIC' AND is_featured = true AND featured_at IS NOT NULL) OR
        (visibility != 'PUBLIC' AND is_featured = false AND featured_at IS NULL)
    )
);

-- Create notebook_sources junction table
CREATE TABLE notebook_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(notebook_id, source_id)
);

-- Add updated_at trigger
CREATE TRIGGER update_notebooks_updated_at
    BEFORE UPDATE ON notebooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX idx_notebooks_visibility ON notebooks(visibility);
CREATE INDEX idx_notebooks_is_featured ON notebooks(is_featured);
CREATE INDEX idx_notebook_sources_notebook_id ON notebook_sources(notebook_id);
CREATE INDEX idx_notebook_sources_source_id ON notebook_sources(source_id);

-- Enable Row Level Security
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notebooks
CREATE POLICY "Users can view their own notebooks"
    ON notebooks FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public or shared notebooks"
    ON notebooks FOR SELECT
    USING (visibility IN ('PUBLIC', 'SHARED'));

CREATE POLICY "Users can create notebooks"
    ON notebooks FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notebooks"
    ON notebooks FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notebooks"
    ON notebooks FOR DELETE
    USING (user_id = auth.uid());

-- RLS Policies for notebook_sources
CREATE POLICY "Users can view sources in their notebooks"
    ON notebook_sources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM notebooks
            WHERE notebooks.id = notebook_sources.notebook_id
            AND notebooks.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view sources in public or shared notebooks"
    ON notebook_sources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM notebooks
            WHERE notebooks.id = notebook_sources.notebook_id
            AND notebooks.visibility IN ('PUBLIC', 'SHARED')
        )
    );

CREATE POLICY "Users can add sources to their notebooks"
    ON notebook_sources FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM notebooks
            WHERE notebooks.id = notebook_sources.notebook_id
            AND notebooks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sources in their notebooks"
    ON notebook_sources FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM notebooks
            WHERE notebooks.id = notebook_sources.notebook_id
            AND notebooks.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM notebooks
            WHERE notebooks.id = notebook_sources.notebook_id
            AND notebooks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove sources from their notebooks"
    ON notebook_sources FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM notebooks
            WHERE notebooks.id = notebook_sources.notebook_id
            AND notebooks.user_id = auth.uid()
        )
    ); 

-- Create notebook covers bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('notebook_covers', 'notebook_covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for notebook covers
CREATE POLICY "Allow public read access on notebook covers"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'notebook_covers');

CREATE POLICY "Allow authenticated access to own notebook covers"
    ON storage.objects FOR ALL TO authenticated
    USING (
        bucket_id = 'notebook_covers' 
        AND owner = auth.uid()
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'notebook_covers' 
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND (ARRAY_LENGTH(regexp_split_to_array(name, '/'), 1) = 2)
    );

-- Function to sync visibility between notebook and its sources
CREATE OR REPLACE FUNCTION sync_notebook_source_visibility()
RETURNS TRIGGER AS $$
BEGIN
    -- Update all sources linked to this notebook through notebook_sources
    UPDATE sources
    SET visibility = NEW.visibility
    WHERE id IN (
        SELECT source_id 
        FROM notebook_sources 
        WHERE notebook_id = NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync visibility
DROP TRIGGER IF EXISTS sync_notebook_source_visibility ON notebooks;
CREATE TRIGGER sync_notebook_source_visibility
    AFTER INSERT OR UPDATE OF visibility ON notebooks
    FOR EACH ROW
    EXECUTE FUNCTION sync_notebook_source_visibility();

-- Function to handle cover image deletion
CREATE OR REPLACE FUNCTION delete_old_notebook_cover()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only proceed if cover_image_url has changed and old cover exists
    IF OLD.cover_image_url IS NOT NULL AND (TG_OP = 'DELETE' OR NEW.cover_image_url IS DISTINCT FROM OLD.cover_image_url) THEN
        -- Extract the path from the cover_image_url
        -- Assuming cover_image_url format: https://[your-project].supabase.co/storage/v1/object/public/notebook_covers/[path]
        DECLARE
            cover_path TEXT;
        BEGIN
            cover_path := regexp_replace(OLD.cover_image_url, '^.*/notebook_covers/', '');
            
            -- Delete the old cover from storage
            DELETE FROM storage.objects
            WHERE bucket_id = 'notebook_covers'
            AND name = cover_path;
        EXCEPTION
            WHEN OTHERS THEN
                -- Log error but don't prevent the trigger from completing
                RAISE WARNING 'Failed to delete old notebook cover: %', SQLERRM;
        END;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger for cover image deletion
CREATE TRIGGER on_notebook_cover_change
    BEFORE UPDATE OR DELETE ON notebooks
    FOR EACH ROW EXECUTE FUNCTION delete_old_notebook_cover(); 