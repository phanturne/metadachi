-- Function to get projects by status for a user
CREATE OR REPLACE FUNCTION get_user_projects(
    p_user_id UUID,
    p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
    project_id UUID,
    name VARCHAR(100),
    description TEXT,
    status VARCHAR(20),
    complete_tasks INTEGER,
    total_tasks INTEGER,
    created_at TIMESTAMPTZ,
    tags JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.project_id,
        p.name,
        p.description,
        p.status,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id AND t.status = 'completed')::INT AS complete_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.project_id)::INT AS total_tasks,
        p.created_at,
        get_project_tags(p.project_id) as tags
    FROM projects p
    WHERE p.user_id = p_user_id
    AND (p_status IS NULL OR p.status = p_status)
    AND NOT p.is_archived
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;