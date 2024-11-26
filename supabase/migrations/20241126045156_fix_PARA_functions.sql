-- Update note tags function to use taggables table
DROP FUNCTION IF EXISTS get_note_tags(UUID);
CREATE OR REPLACE FUNCTION get_note_tags(p_note_id UUID)
RETURNS TABLE (
  tag_id UUID,
  name VARCHAR(50),
  context TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.tag_id,
    t.name,
    tg.context
  FROM taggables tg
  JOIN tags t ON t.tag_id = tg.tag_id
  WHERE tg.taggable_id = p_note_id
  AND tg.taggable_type = 'note';
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
        'tags', t.tags
      )
    )
    FROM notes n
    JOIN LATERAL (
      SELECT jsonb_agg(
        jsonb_build_object(
          'tag_id', tg.tag_id,
          'name', tg.name,
          'context', tg.context
        )
      ) AS tags
      FROM get_note_tags(n.note_id) tg
    ) t ON TRUE
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

-- Project Summary
DROP FUNCTION IF EXISTS get_project_summary(UUID);
CREATE OR REPLACE FUNCTION get_project_summary(p_project_id UUID)
RETURNS TABLE (
  project_id UUID,
  name VARCHAR(100),
  description TEXT,
  status VARCHAR(20),
  priority INTEGER,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_archived BOOLEAN,
  tags JSONB,
  related_notes JSONB,
  owner_id UUID,
  owner_avatar_url TEXT
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
    p.updated_at,
    p.is_archived,
    get_project_tags(p.project_id) as tags,
    get_related_notes(p.project_id, 'project') as related_notes,
    p.user_id as owner_id,
    pr.avatar_url as owner_avatar_url
  FROM projects p
  JOIN profiles pr ON p.user_id = pr.user_id
  WHERE p.project_id = p_project_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Area Summary  
DROP FUNCTION IF EXISTS get_area_summary(UUID);
CREATE OR REPLACE FUNCTION get_area_summary(p_area_id UUID)
RETURNS TABLE (
  area_id UUID,
  name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_archived BOOLEAN,
  tags JSONB,
  related_notes JSONB,
  owner_id UUID,
  owner_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.area_id,
    a.name,
    a.description,
    a.created_at,
    a.updated_at,
    a.is_archived,
    get_area_tags(a.area_id) as tags,
    get_related_notes(a.area_id, 'area') as related_notes,
    a.user_id as owner_id,
    pr.avatar_url as owner_avatar_url
  FROM areas a
  JOIN profiles pr ON a.user_id = pr.user_id
  WHERE a.area_id = p_area_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resource Summary
DROP FUNCTION IF EXISTS get_resource_summary(UUID);
CREATE OR REPLACE FUNCTION get_resource_summary(p_resource_id UUID)
RETURNS TABLE (
  resource_id UUID,
  name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_archived BOOLEAN,
  tags JSONB,
  related_notes JSONB,
  owner_id UUID,
  owner_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.resource_id,
    r.name,
    r.description,
    r.created_at,
    r.updated_at,
    r.is_archived,
    get_resource_tags(r.resource_id) as tags,
    get_related_notes(r.resource_id, 'resource') as related_notes,
    r.user_id as owner_id,
    pr.avatar_url as owner_avatar_url
  FROM resources r
  JOIN profiles pr ON r.user_id = pr.user_id
  WHERE r.resource_id = p_resource_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note Summary
DROP FUNCTION IF EXISTS get_note_summary(UUID);
CREATE OR REPLACE FUNCTION get_note_summary(p_note_id UUID)
RETURNS TABLE (
  note_id UUID,
  name VARCHAR(100),
  note_type TEXT,
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