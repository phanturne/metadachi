-- Create folder table
CREATE TABLE folder (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sharing VARCHAR(50) NOT NULL DEFAULT 'private',
    parent_id UUID REFERENCES folder(id),
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Indices for folder table
CREATE INDEX idx_folder_user_id ON folder(user_id);
CREATE INDEX idx_folder_parent_id ON folder(parent_id);

-- Enable RLS
ALTER TABLE folder ENABLE ROW LEVEL SECURITY;

-- Policies for folder table
CREATE POLICY select_folder_policy ON folder
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY insert_folder_policy ON folder
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY update_folder_policy ON folder
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY delete_folder_policy ON folder
FOR DELETE
USING (user_id = auth.uid());