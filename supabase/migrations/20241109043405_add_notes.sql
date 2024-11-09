-- Notes table
CREATE TABLE notes (
    -- Identity and Relationships
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    project_id UUID,
    area_id UUID,
    resource_id UUID,
    task_id UUID,

    -- Core Metadata
    name VARCHAR(100) NOT NULL,
    content JSONB NOT NULL, -- Store Tiptap JSON content
    note_type TEXT,

    -- Temporal Information
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL,
    FOREIGN KEY (area_id) REFERENCES areas(area_id) ON DELETE SET NULL,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE SET NULL
);

-- Related Notes table
CREATE TABLE related_notes (
    note_id UUID,
    related_note_id UUID,
    relationship_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (note_id, related_note_id),
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (related_note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    CHECK (note_id != related_note_id)
);

-- Indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_task_id ON notes(task_id);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY notes_policy ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY related_notes_policy ON related_notes
FOR ALL USING (
    auth.uid() = (SELECT user_id FROM notes WHERE note_id = related_notes.note_id)
);

-- Trigger to update 'updated_at' column
CREATE TRIGGER update_notes_modtime
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_related_notes_modtime
    BEFORE UPDATE ON related_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Utility function to get tags for a note
CREATE OR REPLACE FUNCTION get_note_tags(p_note_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'tag_id', t.tag_id,
                    'name', t.name,
                    'context', nt.context
                )
            ),
            '[]'::jsonb
        )
        FROM note_tags nt
        JOIN tags t ON t.tag_id = nt.tag_id
        WHERE nt.note_id = p_note_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get related notes
CREATE OR REPLACE FUNCTION get_related_notes(p_note_id UUID)
RETURNS TABLE (
    related_note_id UUID,
    content JSONB,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.note_id,
        n.content,
        rn.created_at,
        get_note_tags(n.note_id) as tags
    FROM related_notes rn
    JOIN notes n ON rn.related_note_id = n.note_id
    WHERE rn.note_id = p_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notes with related notes
CREATE OR REPLACE FUNCTION get_notes_with_related_notes(p_note_id UUID)
RETURNS TABLE (
    note_id UUID,
    name VARCHAR(100),
    content JSONB,
    note_type TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    tags JSONB,
    related_notes JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.note_id,
        n.name,
        n.content,
        n.note_type,
        n.created_at,
        n.updated_at,
        get_note_tags(n.note_id) AS tags,
        get_related_notes(n.note_id) AS related_notes
    FROM notes n
    WHERE n.note_id = p_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely move or remove a note's associations
CREATE OR REPLACE FUNCTION move_note(
    p_note_id UUID,
    p_new_project_id UUID,
    p_new_area_id UUID,
    p_new_resource_id UUID,
    p_new_task_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notes
    SET
        project_id = p_new_project_id,
        area_id = p_new_area_id,
        resource_id = p_new_resource_id,
        task_id = p_new_task_id
    WHERE note_id = p_note_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_notes(
    p_user_id UUID,
    p_project_id UUID DEFAULT NULL,
    p_area_id UUID DEFAULT NULL,
    p_task_id UUID DEFAULT NULL,
    p_note_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    note_id UUID,
    name VARCHAR(100),
    content JSONB,
    note_type TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.note_id,
        n.name,
        n.content,
        n.note_type,
        n.created_at,
        n.updated_at,
        get_note_tags(n.note_id) AS tags
    FROM notes n
    WHERE n.user_id = p_user_id
      AND (p_project_id IS NULL OR n.project_id = p_project_id)
      AND (p_area_id IS NULL OR n.area_id = p_area_id)
      AND (p_task_id IS NULL OR n.task_id = p_task_id)
      AND (p_note_type IS NULL OR n.note_type = p_note_type)
    ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_notes_for_project(
    p_project_id UUID,
    p_area_id UUID DEFAULT NULL,
    p_task_id UUID DEFAULT NULL,
    p_note_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    note_id UUID,
    name VARCHAR(100),
    content JSONB,
    note_type TEXT,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.note_id,
        n.name,
        n.content,
        n.note_type,
        n.created_at,
        get_note_tags(n.note_id) AS tags
    FROM notes n
    WHERE n.project_id = p_project_id
      AND (p_area_id IS NULL OR n.area_id = p_area_id)
      AND (p_task_id IS NULL OR n.task_id = p_task_id)
      AND (p_note_type IS NULL OR n.note_type = p_note_type)
    ORDER BY n.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_notes_for_task(p_task_id UUID)
RETURNS TABLE (
    note_id UUID,
    name VARCHAR(100),
    content JSONB,
    note_type TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.note_id,
        n.name,
        n.content,
        n.note_type,
        n.created_at,
        n.updated_at,
        get_note_tags(n.note_id) AS tags
    FROM notes n
    WHERE n.task_id = p_task_id
    ORDER BY n.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_recent_notes(
    p_user_id UUID DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    note_id UUID,
    name VARCHAR(100),
    content JSONB,
    note_type TEXT,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.note_id,
        n.name,
        n.content,
        n.note_type,
        n.created_at,
        get_note_tags(n.note_id) AS tags
    FROM notes n
    WHERE (p_user_id IS NULL OR n.user_id = p_user_id)
      AND (p_project_id IS NULL OR n.project_id = p_project_id)
    ORDER BY n.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
