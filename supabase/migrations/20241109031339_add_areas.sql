-- Areas table
CREATE TABLE areas (
    -- Identity and Relationships
    area_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,

    -- Core Metadata
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Organization and Classification
    is_archived BOOLEAN DEFAULT FALSE,

    -- Temporal Information
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for common query patterns
CREATE INDEX idx_areas_user_id ON areas(user_id);
CREATE INDEX idx_areas_archived ON areas(is_archived);

-- Enable Row Level Security (RLS)
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY areas_policy ON areas FOR ALL USING (auth.uid() = user_id);

-- Areas table trigger for updating the updated_at timestamp
CREATE TRIGGER update_areas_modtime
    BEFORE UPDATE ON areas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Utility function to get tags for an area
CREATE OR REPLACE FUNCTION get_area_tags(p_area_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'tag_id', t.tag_id,
                    'name', t.name,
                    'context', tg.context
                )
            ),
            '[]'::jsonb
        )
        FROM taggables tg
        JOIN tags t ON t.tag_id = tg.tag_id
        WHERE tg.taggable_id = p_area_id
        AND tg.taggable_type = 'area'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get area summary
CREATE OR REPLACE FUNCTION get_area_summary(p_area_id UUID)
RETURNS TABLE (
    area_id UUID,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.area_id,
        a.name,
        a.description,
        a.created_at,
        get_area_tags(a.area_id) as tags
    FROM areas a
    WHERE a.area_id = p_area_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all areas for a user
CREATE OR REPLACE FUNCTION get_user_areas(p_user_id UUID)
RETURNS TABLE (
    area_id UUID,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.area_id,
        a.name,
        a.description,
        a.created_at,
        get_area_tags(a.area_id) as tags
    FROM areas a
    WHERE a.user_id = p_user_id
    ORDER BY a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;