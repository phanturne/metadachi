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

-- Update get_note_summary function
DROP FUNCTION IF EXISTS get_note_summary(UUID);
CREATE OR REPLACE FUNCTION get_note_summary(p_note_id UUID)
RETURNS TABLE (
  note_id UUID,
  name VARCHAR(100),
  note_type TEXT,
  content JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  project_id UUID,
  area_id UUID,
  resource_id UUID,
  task_id UUID,
  is_archived BOOLEAN,
  tags JSONB,
  related_notes JSONB,
  owner_id UUID,
  owner_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.note_id,
    n.name,
    n.note_type,
    n.content,
    n.created_at,
    n.updated_at,
    n.project_id,
    n.area_id,
    n.resource_id,
    n.task_id,
    n.is_archived,
    get_note_tags(n.note_id) as tags,
    get_related_notes(n.note_id, 'note') as related_notes,
    n.user_id as owner_id,
    pr.avatar_url as owner_avatar_url
  FROM notes n
  JOIN profiles pr ON n.user_id = pr.user_id
  WHERE n.note_id = p_note_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove the original get_user_notes function (there is another with a different signature)
DROP FUNCTION IF EXISTS get_user_notes(UUID, UUID, UUID, UUID, TEXT);

-- Fix utility function to get tags for a note
DROP FUNCTION get_note_tags(uuid);
CREATE OR REPLACE FUNCTION get_note_tags(p_note_id UUID)
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
        WHERE tg.taggable_id = p_note_id
        AND tg.taggable_type = 'note'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_related_notes function to support different entity types
DROP FUNCTION IF EXISTS get_related_notes(UUID, TEXT);
CREATE OR REPLACE FUNCTION get_related_notes(p_entity_id UUID, p_entity_type TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'note_id', n.note_id,
        'name', n.name,
        'note_type', n.note_type,
        'created_at', n.created_at,
        'updated_at', n.updated_at,
        'tags', get_note_tags(n.note_id)
      )
    )
    FROM notes n
    WHERE
      CASE
        WHEN p_entity_type = 'note' THEN n.note_id IN (SELECT related_note_id FROM related_notes WHERE note_id = p_entity_id)
        WHEN p_entity_type = 'project' THEN n.project_id = p_entity_id
        WHEN p_entity_type = 'area' THEN n.area_id = p_entity_id
        WHEN p_entity_type = 'resource' THEN n.resource_id = p_entity_id
      END),
    '[]'::jsonb
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update notes table to have a default value for user_id
ALTER TABLE notes
ALTER COLUMN user_id SET DEFAULT auth.uid();