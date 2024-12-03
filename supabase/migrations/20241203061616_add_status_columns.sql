-- Add status column to notes, areas, resources tables
ALTER TABLE notes ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE areas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Create index for faster status querying
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_areas_status ON areas(status);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);

-- Drop existing functions
DROP FUNCTION insert_area(VARCHAR(100), TEXT, JSONB);
DROP FUNCTION update_area(UUID, VARCHAR(100), TEXT, JSONB);
DROP FUNCTION insert_resource(VARCHAR(100), TEXT, JSONB);
DROP FUNCTION update_resource(UUID, VARCHAR(100), TEXT, JSONB);
DROP FUNCTION insert_note(VARCHAR(100), JSONB, TEXT, UUID, UUID, UUID, UUID, JSONB);
DROP FUNCTION update_note(UUID, VARCHAR(100), JSONB, TEXT, UUID, UUID, UUID, UUID, JSONB);

-- Create updated functions with status parameter

-- Function to insert an area and its tags
CREATE OR REPLACE FUNCTION insert_area (
    p_name VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb,
    p_status TEXT DEFAULT 'active' -- Add status parameter
) RETURNS UUID AS $$
DECLARE
    v_area_id UUID;
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Insert the area
    INSERT INTO areas (name, description, status) -- Include status in insert
    VALUES (p_name, p_description, p_status)
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
    p_tags JSONB DEFAULT '[]'::jsonb,
    p_status TEXT DEFAULT NULL -- Add status parameter
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
        status = COALESCE(p_status, status), -- Include status in update
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

-- Function to insert a resource and its tags
CREATE OR REPLACE FUNCTION insert_resource (
    p_name VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb,
    p_status TEXT DEFAULT 'active' -- Add status parameter
) RETURNS UUID AS $$
DECLARE
    v_resource_id UUID;
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Insert the resource
    INSERT INTO resources (name, description, status) -- Include status in insert
    VALUES (p_name, p_description, p_status)
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
    p_tags JSONB DEFAULT '[]'::jsonb,
    p_status TEXT DEFAULT NULL -- Add status parameter
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
        status = COALESCE(p_status, status), -- Include status in update
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

-- Function to insert a note and its tags
CREATE OR REPLACE FUNCTION insert_note (
    p_name VARCHAR(100),
    p_content JSONB,
    p_note_type TEXT DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_area_id UUID DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_task_id UUID DEFAULT NULL,
    p_tags JSONB DEFAULT '[]'::jsonb,
    p_status TEXT DEFAULT 'active' -- Add status parameter
) RETURNS UUID AS $$
DECLARE
    v_note_id UUID;
    v_tag_id UUID;
    v_tag_name TEXT;
    v_context TEXT;
BEGIN
    -- Insert the note
    INSERT INTO notes (name, content, note_type, project_id, area_id, resource_id, task_id, status) -- Include status in insert
    VALUES (p_name, p_content, p_note_type, p_project_id, p_area_id, p_resource_id, p_task_id, p_status)
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
    p_tags JSONB DEFAULT '[]'::jsonb,
    p_status TEXT DEFAULT NULL -- Add status parameter
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
        status = COALESCE(p_status, status), -- Include status in update
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

-- Area Summary  
DROP FUNCTION IF EXISTS get_area_summary(UUID);
CREATE OR REPLACE FUNCTION get_area_summary(p_area_id UUID)
RETURNS TABLE (
  area_id UUID,
  name VARCHAR(100),
  description TEXT,
  status TEXT, -- Add status column
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
    a.status, -- Include status in select
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
  status TEXT, -- Add status column
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
    r.status, -- Include status in select
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
  content JSONB,
  status TEXT, -- Add status column
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
    n.status, -- Include status in select
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