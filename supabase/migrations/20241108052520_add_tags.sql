-- Tags table
CREATE TABLE tags (
    tag_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, name),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Polymorphic taggable junction table
CREATE TABLE taggables (
    tag_id UUID,
    taggable_id UUID,
    taggable_type VARCHAR(50),
    context TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (tag_id, taggable_id, taggable_type),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,

    -- Ensure valid taggable types
    CONSTRAINT valid_taggable_type CHECK (
        taggable_type IN ('project', 'note', 'resource', 'area')
    )
);

-- Indexes for the polymorphic association
CREATE INDEX idx_taggables_id_type ON taggables(taggable_id, taggable_type);
CREATE INDEX idx_taggables_tag_id ON taggables(tag_id);
CREATE INDEX idx_taggables_type ON taggables(taggable_type);

-- Function to get tags for any taggable item
CREATE OR REPLACE FUNCTION get_item_tags(
    p_taggable_id UUID,
    p_taggable_type VARCHAR(50)
) RETURNS TABLE (
    tag_id UUID,
    tag_name VARCHAR(50),
    context TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tg.tag_id,
        t.name,
        tg.context
    FROM taggables tg
    JOIN tags t ON tg.tag_id = t.tag_id
    WHERE tg.taggable_id = p_taggable_id
    AND tg.taggable_type = p_taggable_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to tag any item
CREATE OR REPLACE FUNCTION tag_item(
    p_taggable_id UUID,
    p_taggable_type VARCHAR(50),
    p_tag_id UUID,
    p_context TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO taggables (
        taggable_id,
        taggable_type,
        tag_id,
        context
    )
    VALUES (
        p_taggable_id,
        p_taggable_type,
        p_tag_id,
        p_context
    )
    ON CONFLICT (tag_id, taggable_id, taggable_type)
    DO UPDATE SET
        context = p_context,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for taggables
CREATE TRIGGER update_taggables_modtime
    BEFORE UPDATE ON taggables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();