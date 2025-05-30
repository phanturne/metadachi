-- Drop the existing featured_check constraint
ALTER TABLE notebooks DROP CONSTRAINT IF EXISTS featured_check;

-- Add the new featured_check constraint
ALTER TABLE notebooks ADD CONSTRAINT featured_check CHECK (
    (is_featured = true AND featured_at IS NOT NULL) OR
    (is_featured = false AND featured_at IS NULL)
); 

-- Drop existing foreign key constraints
ALTER TABLE sources DROP CONSTRAINT IF EXISTS sources_user_id_fkey;
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS summaries_user_id_fkey;
ALTER TABLE notebook_sources DROP CONSTRAINT IF EXISTS notebook_sources_added_by_fkey;

-- Add cascade deletion for user references
ALTER TABLE sources ADD CONSTRAINT sources_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE summaries ADD CONSTRAINT summaries_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE notebook_sources ADD CONSTRAINT notebook_sources_added_by_fkey 
    FOREIGN KEY (added_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add missing foreign key constraints for proper cascading
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS summaries_source_id_fkey;
ALTER TABLE summaries ADD CONSTRAINT summaries_source_id_fkey 
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE;

ALTER TABLE notebook_sources DROP CONSTRAINT IF EXISTS notebook_sources_source_id_fkey;
ALTER TABLE notebook_sources ADD CONSTRAINT notebook_sources_source_id_fkey 
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE;

ALTER TABLE notebook_sources DROP CONSTRAINT IF EXISTS notebook_sources_notebook_id_fkey;
ALTER TABLE notebook_sources ADD CONSTRAINT notebook_sources_notebook_id_fkey 
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE;