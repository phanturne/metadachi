
-- Function to get project statistics
CREATE OR REPLACE FUNCTION get_project_statistics(p_project_id UUID)
RETURNS TABLE (
    total_tasks INT,
    completed_tasks INT,
    overdue_tasks INT,
    total_estimated_hours DECIMAL(10,2),
    total_actual_hours DECIMAL(10,2),
    completion_percentage DECIMAL(5,2),
    on_track BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE project_tree AS (
        SELECT project_id FROM projects WHERE project_id = p_project_id
        UNION ALL
        SELECT p.project_id FROM projects p
        JOIN project_tree pt ON p.parent_project_id = pt.project_id
    )
    SELECT
        COUNT(t.task_id)::INT as total_tasks,
        COUNT(t.task_id) FILTER (WHERE t.status = 'completed')::INT as completed_tasks,
        COUNT(t.task_id) FILTER (WHERE t.due_date < CURRENT_TIMESTAMP AND t.status != 'completed')::INT as overdue_tasks,
        COALESCE(SUM(t.estimated_hours), 0) as total_estimated_hours,
        COALESCE(SUM(t.actual_hours), 0) as total_actual_hours,
        CASE
            WHEN COUNT(t.task_id) > 0 THEN
                (COUNT(t.task_id) FILTER (WHERE t.status = 'completed')::DECIMAL / COUNT(t.task_id) * 100)
            ELSE 0
        END as completion_percentage,
        CASE
            WHEN COUNT(t.task_id) FILTER (WHERE t.due_date < CURRENT_TIMESTAMP AND t.status != 'completed') = 0 THEN TRUE
            ELSE FALSE
        END as on_track
    FROM project_tree pt
    LEFT JOIN tasks t ON t.project_id = pt.project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive project and all subprojects
CREATE OR REPLACE FUNCTION archive_project_cascade(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
    WITH RECURSIVE project_tree AS (
        SELECT project_id FROM projects WHERE project_id = p_project_id
        UNION ALL
        SELECT p.project_id FROM projects p
        JOIN project_tree pt ON p.parent_project_id = pt.project_id
    )
    UPDATE projects SET is_archived = TRUE
    WHERE project_id IN (SELECT project_id FROM project_tree);

    -- Archive associated tasks
    UPDATE tasks SET is_archived = TRUE
    WHERE project_id IN (
        WITH RECURSIVE project_tree AS (
            SELECT project_id FROM projects WHERE project_id = p_project_id
            UNION ALL
            SELECT p.project_id FROM projects p
            JOIN project_tree pt ON p.parent_project_id = pt.project_id
        )
        SELECT project_id FROM project_tree
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project timeline
CREATE OR REPLACE FUNCTION get_project_timeline(p_project_id UUID)
RETURNS TABLE (
    item_type VARCHAR(20),
    item_id UUID,
    title VARCHAR(255),
    status VARCHAR(20),
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    completion_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE project_tree AS (
        SELECT project_id FROM projects WHERE project_id = p_project_id
        UNION ALL
        SELECT p.project_id FROM projects p
        JOIN project_tree pt ON p.parent_project_id = pt.project_id
    )
    SELECT
        'project'::VARCHAR(20) as item_type,
        p.project_id as item_id,
        p.name as title,
        p.status,
        p.created_at as start_date,
        p.due_date,
        COALESCE(
            (SELECT COUNT(*)::DECIMAL * 100 / NULLIF(COUNT(*), 0)
             FROM tasks t
             WHERE t.project_id = p.project_id
             AND t.status = 'completed'),
            0
        ) as completion_percentage
    FROM projects p
    WHERE p.project_id IN (SELECT project_id FROM project_tree)
    UNION ALL
    SELECT
        'task'::VARCHAR(20) as item_type,
        t.task_id as item_id,
        t.title,
        t.status,
        t.created_at as start_date,
        t.due_date,
        CASE
            WHEN t.status = 'completed' THEN 100
            ELSE 0
        END as completion_percentage
    FROM tasks t
    WHERE t.project_id IN (SELECT project_id FROM project_tree)
    ORDER BY start_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for taggables
ALTER TABLE taggables ENABLE ROW LEVEL SECURITY;

-- RLS Policy for taggables
CREATE POLICY taggables_policy ON taggables
    FOR ALL USING (
        CASE taggable_type
            WHEN 'project' THEN
                auth.uid() IN (SELECT user_id FROM projects WHERE project_id = taggable_id)
            WHEN 'note' THEN
                auth.uid() IN (SELECT user_id FROM notes WHERE note_id = taggable_id)
            WHEN 'resource' THEN
                auth.uid() IN (SELECT user_id FROM resources WHERE resource_id = taggable_id)
            WHEN 'area' THEN
                auth.uid() IN (SELECT user_id FROM areas WHERE area_id = taggable_id)
            ELSE false
        END
    );