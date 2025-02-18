-- Add parts column to message table with default value as empty JSON object and ensure it is not null
ALTER TABLE message
ADD COLUMN parts JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Change content column type from JSON to string
ALTER TABLE message
ALTER COLUMN content TYPE TEXT USING content::TEXT,
ALTER COLUMN content SET NOT NULL;