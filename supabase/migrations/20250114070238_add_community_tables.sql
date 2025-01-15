-- Create community table
CREATE TABLE community (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_community table to link users to communities
CREATE TABLE user_community (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES community(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, community_id)
);

-- Indices for community table
CREATE INDEX idx_community_created_by ON community(created_by);

-- Enable RLS
ALTER TABLE community ENABLE ROW LEVEL SECURITY;

-- Policies for community table
CREATE POLICY select_community_policy ON community
FOR SELECT
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM user_community
        WHERE user_community.community_id = community.id
        AND user_community.user_id = auth.uid()
    )
);

CREATE POLICY insert_community_policy ON community
FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY update_community_policy ON community
FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY delete_community_policy ON community
FOR DELETE
USING (created_by = auth.uid());

-- Indices for user_community table
CREATE INDEX idx_user_community_user_id ON user_community(user_id);
CREATE INDEX idx_user_community_community_id ON user_community(community_id);

-- Enable RLS
ALTER TABLE user_community ENABLE ROW LEVEL SECURITY;

-- Policies for user_community table
CREATE POLICY select_user_community_policy ON user_community
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM user_community AS ug
        WHERE ug.community_id = user_community.community_id
        AND ug.user_id = auth.uid()
    )
);

CREATE POLICY insert_user_community_policy ON user_community
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM community
        WHERE community.id = user_community.community_id
        AND community.created_by = auth.uid()
    )
);

CREATE POLICY update_user_community_policy ON user_community
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM community
        WHERE community.id = user_community.community_id
        AND community.created_by = auth.uid()
    )
);

CREATE POLICY delete_user_community_policy ON user_community
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM community
        WHERE community.id = user_community.community_id
        AND community.created_by = auth.uid()
    )
);