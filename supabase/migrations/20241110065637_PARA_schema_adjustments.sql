-- Add is_archived property to notes table
ALTER TABLE notes ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Update tables to have user_id set by default
ALTER TABLE projects
ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE areas
ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE resources
ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE tasks
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Update the get_user_notes() function
CREATE OR REPLACE FUNCTION get_user_notes(
  p_user_id UUID,
  p_project_id UUID DEFAULT NULL,
  p_area_id UUID DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_note_type TEXT DEFAULT NULL,
  p_is_archived BOOLEAN DEFAULT FALSE
)
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
  tags JSONB
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
    get_note_tags(n.note_id) AS tags
  FROM notes n
  WHERE n.user_id = p_user_id
    AND (p_project_id IS NULL OR n.project_id = p_project_id)
    AND (p_area_id IS NULL OR n.area_id = p_area_id)
    AND (p_resource_id IS NULL OR n.resource_id = p_resource_id)
    AND (p_note_type IS NULL OR n.note_type = p_note_type)
    AND n.is_archived = p_is_archived
  ORDER BY n.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_project_summary function
DROP FUNCTION get_project_summary(UUID);
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
    p.*,
    get_project_tags(p.project_id) as tags,
    get_related_notes(p.project_id, 'project') as related_notes,
    p.user_id as owner_id,
    pr.avatar_url as owner_avatar_url
  FROM projects p
  JOIN profiles pr ON p.user_id = pr.user_id
  WHERE p.project_id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_area_summary function
DROP FUNCTION get_area_summary(UUID);

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
    a.*,
    get_area_tags(a.area_id) as tags,
    get_related_notes(a.area_id, 'area') as related_notes,
    a.user_id as owner_id,
    pr.avatar_url as owner_avatar_url
  FROM areas a
  JOIN profiles pr ON a.user_id = pr.user_id
  WHERE a.area_id = p_area_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_resource_summary function
DROP FUNCTION get_resource_summary(UUID);

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
    r.*,
    get_resource_tags(r.resource_id) as tags,
    get_related_notes(r.resource_id, 'resource') as related_notes,
    r.user_id as owner_id,
    pr.avatar_url as owner_avatar_url
  FROM resources r
  JOIN profiles pr ON r.user_id = pr.user_id
  WHERE r.resource_id = p_resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_note_summary function
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
    n.*,
    get_note_tags(n.note_id) as tags,
    get_related_notes(n.note_id, 'note') as related_notes,
    n.user_id as owner_id,
    pr.avatar_url as owner_avatar_url
  FROM notes n
  JOIN profiles pr ON n.user_id = pr.user_id
  WHERE n.note_id = p_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove the unused get_notes_with_related_notes() function
DROP FUNCTION IF EXISTS get_notes_with_related_notes(UUID);

-- Update get_related_notes function to support different entity types
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

-- Function to find or create a tag (case insensitive)
CREATE OR REPLACE FUNCTION find_or_create_tag (
    p_tag_name VARCHAR(50),
    p_description TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_tag_id UUID;
    v_normalized_name VARCHAR(50);
BEGIN
    -- Normalize the tag name (lowercase)
    v_normalized_name := LOWER(TRIM(p_tag_name));

    -- Check if tag already exists (case insensitive)
    SELECT tag_id
    INTO v_tag_id
    FROM tags
    WHERE user_id = auth.uid()
    AND LOWER(name) = v_normalized_name;

    -- If tag doesn't exist, create it
    IF v_tag_id IS NULL THEN
        INSERT INTO tags (user_id, name, description)
        VALUES (auth.uid(), p_tag_name, p_description)
        RETURNING tag_id INTO v_tag_id;
    END IF;

    RETURN v_tag_id;
END;
$$
 LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search tags (case insensitive)
CREATE
OR REPLACE FUNCTION search_user_tags (p_user_id UUID, p_search_term VARCHAR(50)) RETURNS TABLE (
    tag_id UUID,
    name VARCHAR(50),
    description TEXT,
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.tag_id,
        t.name,
        t.description,
        COUNT(tg.tag_id) as usage_count
    FROM tags t
    LEFT JOIN taggables tg ON t.tag_id = tg.tag_id
    WHERE t.user_id = p_user_id
    AND (
        p_search_term IS NULL
        OR LOWER(t.name) LIKE LOWER('%' || p_search_term || '%')
    )
    GROUP BY t.tag_id, t.name, t.description
    ORDER BY usage_count DESC, name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to insert a project and its tags
CREATE OR REPLACE FUNCTION insert_project (
    p_name VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT 'incubating',
    p_priority INTEGER DEFAULT 0,
    p_due_date TIMESTAMPTZ DEFAULT NULL,
    p_parent_project_id UUID DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_project_id UUID;
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Insert the project
    INSERT INTO projects (name, description, status, priority, due_date, parent_project_id)
    VALUES (p_name, p_description, p_status, p_priority, p_due_date, p_parent_project_id)
    RETURNING project_id INTO v_project_id;

    -- Handle tags
    IF p_tags IS NOT NULL AND jsonb_array_length(p_tags) > 0 THEN
        FOR v_tag_name, v_context IN
            SELECT
                t->>'name',
                t->>'context'
            FROM jsonb_array_elements(p_tags) AS t
        LOOP
            -- Find or create tag
            v_tag_id := find_or_create_tag(v_tag_name);

            -- Insert into taggables
            INSERT INTO taggables (tag_id, taggable_id, taggable_type, context)
            VALUES (v_tag_id, v_project_id, 'project', v_context)
            ON CONFLICT (tag_id, taggable_id, taggable_type)
            DO UPDATE SET context = EXCLUDED.context;
        END LOOP;
    END IF;

    RETURN v_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a project and its tags
CREATE OR REPLACE FUNCTION update_project(
    p_project_id UUID,
    p_name VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_status VARCHAR(20) DEFAULT 'incubating',
    p_priority INTEGER DEFAULT 0,
    p_due_date TIMESTAMPTZ DEFAULT NULL,
    p_parent_project_id UUID DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb
) RETURNS BOOLEAN AS $$
DECLARE
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Update project details
    UPDATE projects
    SET name = p_name,
        description = COALESCE(p_description, description),
        status = COALESCE(p_status, status),
        priority = COALESCE(p_priority, priority),
        due_date = COALESCE(p_due_date, due_date),
        parent_project_id = COALESCE(p_parent_project_id, parent_project_id),
        updated_at = NOW()
    WHERE project_id = p_project_id;

    -- Delete existing tags
    DELETE FROM taggables
    WHERE taggable_id = p_project_id
    AND taggable_type = 'project';

    -- Insert new tags
    IF p_tags IS NOT NULL AND jsonb_array_length(p_tags) > 0 THEN
        FOR v_tag_name, v_context IN
            SELECT
                t->>'name',
                t->>'context'
            FROM jsonb_array_elements(p_tags) AS t
        LOOP
            -- Find or create tag
            v_tag_id := find_or_create_tag(v_tag_name);

            -- Insert into taggables
            INSERT INTO taggables (tag_id, taggable_id, taggable_type, context)
            VALUES (v_tag_id, p_project_id, 'project', v_context);
        END LOOP;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a project and its tags
CREATE OR REPLACE FUNCTION delete_project(p_project_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  -- Delete associated tags
  DELETE FROM taggables WHERE taggable_id = p_project_id AND taggable_type = 'project';

  -- Delete the project
  DELETE FROM projects WHERE project_id = p_project_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to insert an area and its tags
CREATE OR REPLACE FUNCTION insert_area (
    p_name VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_area_id UUID;
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Insert the area
    INSERT INTO areas (name, description)
    VALUES (p_name, p_description)
    RETURNING area_id INTO v_area_id;

    -- Handle tags
    IF p_tags IS NOT NULL AND jsonb_array_length(p_tags) > 0 THEN
        FOR v_tag_name, v_context IN
            SELECT
                t->>'name',
                t->>'context'
            FROM jsonb_array_elements(p_tags) AS t
        LOOP
            -- Find or create tag
            v_tag_id := find_or_create_tag(v_tag_name);

            -- Insert into taggables
            INSERT INTO taggables (tag_id, taggable_id, taggable_type, context)
            VALUES (v_tag_id, v_area_id, 'area', v_context)
            ON CONFLICT (tag_id, taggable_id, taggable_type)
            DO UPDATE SET context = EXCLUDED.context;
        END LOOP;
    END IF;

    RETURN v_area_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update an area and its tags
CREATE OR REPLACE FUNCTION update_area(
    p_area_id UUID,
    p_name VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb
) RETURNS BOOLEAN AS $$
DECLARE
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Update area details
    UPDATE areas
    SET name = p_name,
        description = COALESCE(p_description, description),
        updated_at = NOW()
    WHERE area_id = p_area_id;

    -- Delete existing tags
    DELETE FROM taggables
    WHERE taggable_id = p_area_id
    AND taggable_type = 'area';

    -- Insert new tags
    IF p_tags IS NOT NULL AND jsonb_array_length(p_tags) > 0 THEN
        FOR v_tag_name, v_context IN
            SELECT
                t->>'name',
                t->>'context'
            FROM jsonb_array_elements(p_tags) AS t
        LOOP
            -- Find or create tag
            v_tag_id := find_or_create_tag(v_tag_name);

            -- Insert into taggables
            INSERT INTO taggables (tag_id, taggable_id, taggable_type, context)
            VALUES (v_tag_id, p_area_id, 'area', v_context);
        END LOOP;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete an area and its tags
CREATE OR REPLACE FUNCTION delete_area(p_area_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  -- Delete associated tags
  DELETE FROM taggables WHERE taggable_id = p_area_id AND taggable_type = 'area';

  -- Delete the area
  DELETE FROM areas WHERE area_id = p_area_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to insert a resource and its tags
CREATE OR REPLACE FUNCTION insert_resource (
    p_name VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_resource_id UUID;
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Insert the resource
    INSERT INTO resources (name, description)
    VALUES (p_name, p_description)
    RETURNING resource_id INTO v_resource_id;

    -- Handle tags
    IF p_tags IS NOT NULL AND jsonb_array_length(p_tags) > 0 THEN
        FOR v_tag_name, v_context IN
            SELECT
                t->>'name',
                t->>'context'
            FROM jsonb_array_elements(p_tags) AS t
        LOOP
            -- Find or create tag
            v_tag_id := find_or_create_tag(v_tag_name);

            -- Insert into taggables
            INSERT INTO taggables (tag_id, taggable_id, taggable_type, context)
            VALUES (v_tag_id, v_resource_id, 'resource', v_context)
            ON CONFLICT (tag_id, taggable_id, taggable_type)
            DO UPDATE SET context = EXCLUDED.context;
        END LOOP;
    END IF;

    RETURN v_resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a resource and its tags
CREATE OR REPLACE FUNCTION update_resource(
    p_resource_id UUID,
    p_name VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb
) RETURNS BOOLEAN AS $$
DECLARE
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Update resource details
    UPDATE resources
    SET name = p_name,
        description = COALESCE(p_description, description),
        updated_at = NOW()
    WHERE resource_id = p_resource_id;

    -- Delete existing tags
    DELETE FROM taggables
    WHERE taggable_id = p_resource_id
    AND taggable_type = 'resource';

    -- Insert new tags
    IF p_tags IS NOT NULL AND jsonb_array_length(p_tags) > 0 THEN
        FOR v_tag_name, v_context IN
            SELECT
                t->>'name',
                t->>'context'
            FROM jsonb_array_elements(p_tags) AS t
        LOOP
            -- Find or create tag
            v_tag_id := find_or_create_tag(v_tag_name);

            -- Insert into taggables
            INSERT INTO taggables (tag_id, taggable_id, taggable_type, context)
            VALUES (v_tag_id, p_resource_id, 'resource', v_context);
        END LOOP;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a resource and its tags
CREATE OR REPLACE FUNCTION delete_resource(p_resource_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  -- Delete associated tags
  DELETE FROM taggables WHERE taggable_id = p_resource_id AND taggable_type = 'resource';

  -- Delete the resource
  DELETE FROM resources WHERE resource_id = p_resource_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to insert a note and its tags
CREATE OR REPLACE FUNCTION insert_note (
    p_name VARCHAR(100),
    p_content JSONB,
    p_note_type TEXT DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_area_id UUID DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_task_id UUID DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_note_id UUID;
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Insert the note
    INSERT INTO notes (name, content, note_type, project_id, area_id, resource_id, task_id)
    VALUES (p_name, p_content, p_note_type, p_project_id, p_area_id, p_resource_id, p_task_id)
    RETURNING note_id INTO v_note_id;

    -- Handle tags
    IF p_tags IS NOT NULL AND jsonb_array_length(p_tags) > 0 THEN
        FOR v_tag_name, v_context IN
            SELECT
                t->>'name',
                t->>'context'
            FROM jsonb_array_elements(p_tags) AS t
        LOOP
            -- Find or create tag
            v_tag_id := find_or_create_tag(v_tag_name);

            -- Insert into taggables
            INSERT INTO taggables (tag_id, taggable_id, taggable_type, context)
            VALUES (v_tag_id, v_note_id, 'note', v_context)
            ON CONFLICT (tag_id, taggable_id, taggable_type)
            DO UPDATE SET context = EXCLUDED.context;
        END LOOP;
    END IF;

    RETURN v_note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a note and its tags
CREATE OR REPLACE FUNCTION update_note(
    p_note_id UUID,
    p_name VARCHAR(100),
    p_content JSONB,
    p_note_type TEXT DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_area_id UUID DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_task_id UUID DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb
) RETURNS BOOLEAN AS $$
DECLARE
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Update note details
    UPDATE notes
    SET name = p_name,
        content = p_content,
        note_type = COALESCE(p_note_type, note_type),
        project_id = COALESCE(p_project_id, project_id),
        area_id = COALESCE(p_area_id, area_id),
        resource_id = COALESCE(p_resource_id, resource_id),
        task_id = COALESCE(p_task_id, task_id),
        updated_at = NOW()
    WHERE note_id = p_note_id;

    -- Delete existing tags
    DELETE FROM taggables
    WHERE taggable_id = p_note_id
    AND taggable_type = 'note';

    -- Insert new tags
    IF p_tags IS NOT NULL AND jsonb_array_length(p_tags) > 0 THEN
        FOR v_tag_name, v_context IN
            SELECT
                t->>'name',
                t->>'context'
            FROM jsonb_array_elements(p_tags) AS t
        LOOP
            -- Find or create tag
            v_tag_id := find_or_create_tag(v_tag_name);

            -- Insert into taggables
            INSERT INTO taggables (tag_id, taggable_id, taggable_type, context)
            VALUES (v_tag_id, p_note_id, 'note', v_context);
        END LOOP;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a note and its tags
CREATE OR REPLACE FUNCTION delete_note(p_note_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  -- Delete associated tags
  DELETE FROM taggables WHERE taggable_id = p_note_id AND taggable_type = 'note';

  -- Delete related notes
  DELETE FROM related_notes WHERE note_id = p_note_id OR related_note_id = p_note_id;

  -- Delete the note
  DELETE FROM notes WHERE note_id = p_note_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;