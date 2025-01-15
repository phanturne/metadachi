-- Create file table
CREATE TABLE file (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folder(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sharing VARCHAR(50) NOT NULL DEFAULT 'private',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    size INT,
    tokens INT,
    hash VARCHAR(64),
    type VARCHAR(50),
    metadata JSONB
);

-- Indices for file table
CREATE INDEX idx_file_user_id ON file(user_id);
CREATE INDEX idx_file_folder_id ON file(folder_id);
CREATE INDEX idx_file_hash ON file(hash);

-- Enable RLS
ALTER TABLE file ENABLE ROW LEVEL SECURITY;

-- Policies for file table
CREATE POLICY select_file_policy ON file
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY insert_file_policy ON file
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY update_file_policy ON file
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY delete_file_policy ON file
FOR DELETE
USING (user_id = auth.uid());