-- Resources table (topic-based collections of useful information)
CREATE TABLE resources (
    -- Identity and Relationships
    resource_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create indexes for common query patterns
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_archived ON resources(is_archived);

-- Enable Row Level Security (RLS)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY resources_policy ON resources FOR ALL USING (auth.uid() = user_id);

-- Resources table trigger for updating the updated_at timestamp
CREATE TRIGGER update_resources_modtime
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get resource tags
CREATE OR REPLACE FUNCTION get_resource_tags(p_resource_id UUID)
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
        WHERE tg.taggable_id = p_resource_id
        AND tg.taggable_type = 'resource'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get resource summary
CREATE OR REPLACE FUNCTION get_resource_summary(p_resource_id UUID)
RETURNS TABLE (
    resource_id UUID,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.resource_id,
        r.name,
        r.description,
        r.created_at,
        get_resource_tags(r.resource_id) as tags
    FROM resources r
    WHERE r.resource_id = p_resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all resources for a user
CREATE OR REPLACE FUNCTION get_user_resources(p_user_id UUID)
RETURNS TABLE (
    resource_id UUID,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.resource_id,
        r.name,
        r.description,
        r.created_at,
        get_resource_tags(r.resource_id) as tags
    FROM resources r
    WHERE r.user_id = p_user_id
    AND NOT r.is_archived
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;