-- Table for Tasks
CREATE TABLE tasks (
    -- Identity and Relationships
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    project_id UUID,
    parent_task_id UUID,

    -- Core Metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),

    -- Task Info
    due_date TIMESTAMPTZ,
    estimated_hours DECIMAL(10, 2) CHECK (estimated_hours >= 0),
    actual_hours DECIMAL(10, 2) CHECK (actual_hours >= 0),
    completed_at TIMESTAMPTZ,
    task_type VARCHAR(50),

    -- Temporal Information
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE SET NULL
);

-- Related Dependencies Table for Task Dependencies
CREATE TABLE task_dependencies (
    dependent_task_id UUID,
    dependency_task_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (dependent_task_id, dependency_task_id),
    FOREIGN KEY (dependent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (dependency_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    CHECK (dependent_task_id != dependency_task_id)
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Row Level Security for Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_policy ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY task_dependencies_policy ON task_dependencies FOR ALL USING (auth.uid() = (SELECT user_id FROM tasks WHERE task_id = dependent_task_id));

-- Trigger to update timestamps on modification
CREATE TRIGGER update_tasks_modtime
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_dependencies_modtime
    BEFORE UPDATE ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get the task hierarchy (recursive subtasks)
CREATE OR REPLACE FUNCTION get_task_hierarchy(p_task_id UUID)
RETURNS TABLE (
    task_id UUID,
    title VARCHAR(255),
    level INT,
    path TEXT[]
) AS $$
WITH RECURSIVE task_tree AS (
    -- Base case
    SELECT
        t.task_id,
        t.title,
        0 as level,
        ARRAY[t.title::TEXT] as path
    FROM tasks t
    WHERE t.task_id = p_task_id

    UNION ALL

    -- Recursive case
    SELECT
        t.task_id,
        t.title,
        tt.level + 1,
        tt.path || t.title::TEXT
    FROM tasks t
    JOIN task_tree tt ON t.parent_task_id = tt.task_id
)
SELECT * FROM task_tree
ORDER BY path;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to retrieve task dependencies
CREATE OR REPLACE FUNCTION get_task_dependencies(p_task_id UUID)
RETURNS TABLE (
    task_id UUID,
    title VARCHAR(255),
    status VARCHAR(20),
    dependency_type VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.task_id,
        t.title,
        t.status,
        'blocks' as dependency_type
    FROM tasks t
    JOIN task_dependencies td ON t.task_id = td.dependency_task_id
    WHERE td.dependent_task_id = p_task_id
    UNION ALL
    SELECT
        t.task_id,
        t.title,
        t.status,
        'blocked by' as dependency_type
    FROM tasks t
    JOIN task_dependencies td ON t.task_id = td.dependent_task_id
    WHERE td.dependency_task_id = p_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if task can be completed (all dependencies are completed)
CREATE OR REPLACE FUNCTION can_complete_task(p_task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1
        FROM task_dependencies td
        JOIN tasks t ON td.dependency_task_id = t.task_id
        WHERE td.dependent_task_id = p_task_id
        AND t.status != 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recursive Function to archive task and all subtasks
CREATE OR REPLACE FUNCTION archive_task_cascade(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
    WITH RECURSIVE task_tree AS (
        SELECT task_id FROM tasks WHERE task_id = p_task_id
        UNION ALL
        SELECT t.task_id FROM tasks t
        JOIN task_tree tt ON t.parent_task_id = tt.task_id
    )
    UPDATE tasks SET is_archived = TRUE
    WHERE task_id IN (SELECT task_id FROM task_tree);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get hierarchical task and dependencies in a single call
CREATE OR REPLACE FUNCTION get_task_hierarchy_with_dependencies(p_task_id UUID)
RETURNS TABLE (
    task_id UUID,
    title VARCHAR(255),
    level INT,
    dependency_task_id UUID,
    dependency_title VARCHAR(255),
    dependency_type VARCHAR(20)
) AS $$
WITH RECURSIVE task_tree AS (
    -- Base task
    SELECT
        t.task_id,
        t.title,
        0 as level,
        NULL::UUID as dependency_task_id,
        NULL::VARCHAR as dependency_title,
        NULL::VARCHAR as dependency_type
    FROM tasks t
    WHERE t.task_id = p_task_id

    UNION ALL

    -- Recursive tasks
    SELECT
        t.task_id,
        t.title,
        tt.level + 1,
        td.dependency_task_id,
        dep.title as dependency_title,
        CASE WHEN td.dependent_task_id = t.task_id THEN 'blocked by' ELSE 'blocks' END as dependency_type
    FROM tasks t
    JOIN task_tree tt ON t.parent_task_id = tt.task_id
    LEFT JOIN task_dependencies td ON td.dependent_task_id = t.task_id OR td.dependency_task_id = t.task_id
    LEFT JOIN tasks dep ON dep.task_id = td.dependency_task_id
)
SELECT * FROM task_tree ORDER BY level;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_tasks(p_user_id UUID, p_status VARCHAR(20) DEFAULT NULL, p_is_archived BOOLEAN DEFAULT FALSE)
RETURNS TABLE (
    task_id UUID,
    title VARCHAR(255),
    status VARCHAR(20),
    due_date TIMESTAMPTZ,
    priority VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        task_id,
        title,
        status,
        due_date,
        priority
    FROM tasks
    WHERE user_id = p_user_id
      AND (p_status IS NULL OR status = p_status)
      AND is_archived = p_is_archived
    ORDER BY priority DESC, due_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_tasks_for_project(p_project_id UUID, p_include_subtasks BOOLEAN DEFAULT TRUE, p_status VARCHAR(20) DEFAULT NULL)
RETURNS TABLE (
    task_id UUID,
    title VARCHAR(255),
    status VARCHAR(20),
    due_date TIMESTAMPTZ,
    priority VARCHAR(20),
    parent_task_id UUID
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE project_tasks AS (
        SELECT task_id, title, status, due_date, priority, parent_task_id
        FROM tasks
        WHERE project_id = p_project_id
          AND (p_status IS NULL OR status = p_status)
          AND is_archived = FALSE

        UNION ALL

        SELECT t.task_id, t.title, t.status, t.due_date, t.priority, t.parent_task_id
        FROM tasks t
        JOIN project_tasks pt ON t.parent_task_id = pt.task_id
        WHERE p_include_subtasks = TRUE
    )
    SELECT * FROM project_tasks ORDER BY due_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_overdue_tasks(p_user_id UUID DEFAULT NULL, p_project_id UUID DEFAULT NULL)
RETURNS TABLE (
    task_id UUID,
    title VARCHAR(255),
    status VARCHAR(20),
    due_date TIMESTAMPTZ,
    project_id UUID,
    user_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        task_id,
        title,
        status,
        due_date,
        project_id,
        user_id
    FROM tasks
    WHERE due_date < CURRENT_TIMESTAMP
      AND status != 'completed'
      AND is_archived = FALSE
      AND (p_user_id IS NULL OR user_id = p_user_id)
      AND (p_project_id IS NULL OR project_id = p_project_id)
    ORDER BY due_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_completed_tasks_in_project(p_project_id UUID)
RETURNS TABLE (
    task_id UUID,
    title VARCHAR(255),
    completed_at TIMESTAMPTZ,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        task_id,
        title,
        completed_at,
        estimated_hours,
        actual_hours
    FROM tasks
    WHERE project_id = p_project_id
      AND status = 'completed'
      AND is_archived = FALSE
    ORDER BY completed_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_task_summary_for_user(p_user_id UUID)
RETURNS TABLE (
    total_tasks INT,
    completed_tasks INT,
    overdue_tasks INT,
    pending_tasks INT,
    total_estimated_hours DECIMAL(10,2),
    total_actual_hours DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(task_id) AS total_tasks,
        COUNT(task_id) FILTER (WHERE status = 'completed') AS completed_tasks,
        COUNT(task_id) FILTER (WHERE due_date < CURRENT_TIMESTAMP AND status != 'completed') AS overdue_tasks,
        COUNT(task_id) FILTER (WHERE status = 'pending') AS pending_tasks,
        COALESCE(SUM(estimated_hours), 0) AS total_estimated_hours,
        COALESCE(SUM(actual_hours), 0) AS total_actual_hours
    FROM tasks
    WHERE user_id = p_user_id AND is_archived = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;