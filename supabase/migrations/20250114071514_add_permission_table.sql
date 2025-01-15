-- Create permission table
CREATE TABLE permission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(50) NOT NULL, -- 'file' or 'folder'
    resource_id UUID NOT NULL, -- id of the file or folder
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL if shared with a community
    community_id UUID REFERENCES community(id) ON DELETE CASCADE, -- NULL if shared with a user
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' -- 'viewer' or 'editor'
);

-- Indices for permission table
CREATE INDEX idx_permission_user_id ON permission(user_id);
CREATE INDEX idx_permission_community_id ON permission(community_id);
CREATE INDEX idx_permission_resource ON permission(resource_type, resource_id);

-- Enable RLS
ALTER TABLE permission ENABLE ROW LEVEL SECURITY;

-- Policies for permission table
CREATE POLICY select_permission_policy ON permission
FOR SELECT
USING (
    (user_id = auth.uid()) OR
    EXISTS (
        SELECT 1
        FROM user_community AS ug
        WHERE ug.community_id = permission.community_id
        AND ug.user_id = auth.uid()
    )
);

CREATE POLICY insert_permission_policy ON permission
FOR INSERT
WITH CHECK (
    (resource_type = 'file' AND EXISTS (
        SELECT 1 FROM file WHERE file.id = permission.resource_id AND user_id = auth.uid()
    ))
    OR (resource_type = 'folder' AND EXISTS (
        SELECT 1 FROM folder WHERE folder.id = permission.resource_id AND user_id = auth.uid()
    ))
);

CREATE POLICY update_permission_policy ON permission
FOR UPDATE
USING (
    (resource_type = 'file' AND EXISTS (
        SELECT 1 FROM file WHERE file.id = permission.resource_id AND user_id = auth.uid()
    ))
    OR (resource_type = 'folder' AND EXISTS (
        SELECT 1 FROM folder WHERE folder.id = permission.resource_id AND user_id = auth.uid()
    ))
);

CREATE POLICY delete_permission_policy ON permission
FOR DELETE
USING (
    (resource_type = 'file' AND EXISTS (
        SELECT 1 FROM file WHERE file.id = permission.resource_id AND user_id = auth.uid()
    ))
    OR (resource_type = 'folder' AND EXISTS (
        SELECT 1 FROM folder WHERE folder.id = permission.resource_id AND user_id = auth.uid()
    ))
);

CREATE OR REPLACE FUNCTION has_permission(resource_type TEXT, resource_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM permission
        WHERE resource_type = resource_type
        AND resource_id = resource_id
        AND (user_id = user_id OR community_id IN (
            SELECT community_id FROM user_community WHERE user_id = user_id
        ))
    );
END;
$$ LANGUAGE plpgsql;

-- Replace the file and folders select policies
DROP POLICY IF EXISTS select_folder_policy ON folder;
CREATE POLICY select_folder_policy ON folder
FOR SELECT
USING (
    sharing = 'public' OR
    (sharing = 'private' AND user_id = auth.uid()) OR
    (sharing = 'custom' AND (
        user_id = auth.uid() OR
        has_permission('folder', folder.id, auth.uid())
    ))
);

DROP POLICY IF EXISTS select_file_policy ON file;
CREATE POLICY select_file_policy ON file
FOR SELECT
USING (
    sharing = 'public' OR
    (sharing = 'private' AND user_id = auth.uid()) OR
    (sharing = 'custom' AND (
        user_id = auth.uid() OR
        has_permission('file', file.id, auth.uid())
    ))
);

DROP POLICY IF EXISTS select_embedding_policy ON embedding;
CREATE POLICY select_embedding_policy ON embedding
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM file
        WHERE file.id = embedding.file_id
        AND (
            file.sharing = 'public' OR
            (file.sharing = 'private' AND file.user_id = auth.uid()) OR
            (file.sharing = 'custom' AND (
                file.user_id = auth.uid() OR
                has_permission('file', file.id, auth.uid())
            ))
        )
    )
);