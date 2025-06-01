-- Add title column to sources table
ALTER TABLE sources ADD COLUMN title TEXT NOT NULL DEFAULT 'Untitled';

-- Update existing records to use file_name as title for FILE type sources
UPDATE sources 
SET title = file_name 
WHERE type = 'FILE' AND file_name IS NOT NULL;

-- Remove the default value constraint after updating existing records
ALTER TABLE sources ALTER COLUMN title DROP DEFAULT; 