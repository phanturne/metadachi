-- Core table for Projects (representing active, time-bound initiatives)
CREATE TABLE projects (
    -- Identity and Relationships
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    parent_project_id UUID,

    -- Core Metadata
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,

    -- Organization and Classification
    is_archived BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,

    -- Temporal Information
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_project_id) REFERENCES projects(project_id) ON DELETE CASCADE,

    -- Status constraint for Second Brain methodology
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'incubating', 'archived', 'on hold', 'dropped'))
);

-- Table for managing project relationships and references
CREATE TABLE project_connections (
    project_id UUID,
    connected_project_id UUID,
    connection_type VARCHAR(50) NOT NULL,
    context TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (project_id, connected_project_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (connected_project_id) REFERENCES projects(project_id) ON DELETE CASCADE,

    -- Prevent self-references
    CHECK (project_id != connected_project_id),

    -- Define valid connection types for Second Brain methodology
    CONSTRAINT valid_connection_type CHECK (
        connection_type IN ('reference', 'continuation', 'inspiration', 'prerequisite', 'related', 'dependency', 'alternative',  'complementary')
    )
);

-- Create indexes for common query patterns
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_parent_id ON projects(parent_project_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_archived ON projects(is_archived);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY projects_policy ON projects
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY project_connections_policy ON project_connections
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM projects
            WHERE project_id = project_connections.project_id
            OR project_id = project_connections.connected_project_id
        )
    );

-- Projects table trigger
CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Project connections trigger
CREATE TRIGGER update_project_connections_modtime
    BEFORE UPDATE ON project_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Utility function to get tags for a project
CREATE OR REPLACE FUNCTION get_project_tags(p_project_id UUID)
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
        WHERE tg.taggable_id = p_project_id
        AND tg.taggable_type = 'project'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility function to get connected projects
CREATE OR REPLACE FUNCTION get_connected_projects(p_project_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT jsonb_agg(
            jsonb_build_object(
                'project_id', cp.project_id,
                'name', cp.name,
                'connection_type', pc.connection_type,
                'context', pc.context
            )
        )
        FROM project_connections pc
        JOIN projects cp ON pc.connected_project_id = cp.project_id
        WHERE pc.project_id = p_project_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility function to get project hierarchy path (ancestors)
CREATE OR REPLACE FUNCTION get_project_hierarchy_path(p_project_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        WITH RECURSIVE ancestors AS (
            SELECT
                p.project_id,
                p.name,
                p.parent_project_id,
                1 as level
            FROM projects p
            WHERE p.project_id = p_project_id

            UNION ALL

            SELECT
                p.project_id,
                p.name,
                p.parent_project_id,
                a.level + 1
            FROM projects p
            JOIN ancestors a ON p.project_id = a.parent_project_id
        )
        SELECT jsonb_agg(
            jsonb_build_object(
                'project_id', project_id,
                'name', name,
                'level', level
            ) ORDER BY level DESC
        ) FROM ancestors
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_project_hierarchy(p_project_id UUID)
RETURNS TABLE (
    project_id UUID,
    name VARCHAR(100),
    status VARCHAR(20),
    level INT,
    path VARCHAR[],
    has_children BOOLEAN,
    tags JSONB
) AS $$
WITH RECURSIVE project_tree AS (
    SELECT
        p.project_id,
        p.name,
        p.status,
        0 as level,
        ARRAY[p.name]::VARCHAR[] as path,
        EXISTS(SELECT 1 FROM projects WHERE parent_project_id = p.project_id) as has_children
    FROM projects p
    WHERE p.project_id = p_project_id

    UNION ALL

    SELECT
        p.project_id,
        p.name,
        p.status,
        pt.level + 1,
        pt.path || p.name,
        EXISTS(SELECT 1 FROM projects WHERE parent_project_id = p.project_id) as has_children
    FROM projects p
    JOIN project_tree pt ON p.parent_project_id = pt.project_id
)
SELECT
    pt.*,
    get_project_tags(pt.project_id) as tags
FROM project_tree pt
ORDER BY path;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_project_connections(p_project_id UUID)
RETURNS TABLE (
    connected_project_id UUID,
    name VARCHAR(100),
    connection_type VARCHAR(50),
    context TEXT,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.project_id,
        p.name,
        pc.connection_type,
        pc.context,
        pc.created_at,
        get_project_tags(p.project_id) as tags
    FROM project_connections pc
    JOIN projects p ON pc.connected_project_id = p.project_id
    WHERE pc.project_id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_project_summary(p_project_id UUID)
RETURNS TABLE (
    project_id UUID,
    name VARCHAR(100),
    description TEXT,
    status VARCHAR(20),
    priority INTEGER,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    tags JSONB,
    connections JSONB,
    parent_path JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.project_id,
        p.name,
        p.description,
        p.status,
        p.priority,
        p.due_date,
        p.created_at,
        get_project_tags(p.project_id) as tags,
        get_connected_projects(p.project_id) as connections,
        get_project_hierarchy_path(p.project_id) as parent_path
    FROM projects p
    WHERE p.project_id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely move a project (prevents circular references)
CREATE OR REPLACE FUNCTION move_project(p_project_id UUID, p_new_parent_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check for circular reference
    IF p_new_parent_id IS NOT NULL AND EXISTS (
        WITH RECURSIVE project_tree AS (
            SELECT project_id, parent_project_id FROM projects WHERE project_id = p_new_parent_id
            UNION ALL
            SELECT p.project_id, p.parent_project_id FROM projects p
            JOIN project_tree pt ON p.project_id = pt.parent_project_id
        )
        SELECT 1 FROM project_tree WHERE project_id = p_project_id
    ) THEN
        RETURN FALSE;
    END IF;

    -- Move the project
    UPDATE projects SET parent_project_id = p_new_parent_id WHERE project_id = p_project_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;