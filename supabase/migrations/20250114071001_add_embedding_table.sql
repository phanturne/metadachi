-- Create embedding table
CREATE TABLE embedding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_id UUID REFERENCES file(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    embeddings JSONB,
    tokens INT,
    hash VARCHAR(64),
    metadata JSONB
);

-- Indices for embedding table
CREATE INDEX idx_embedding_user_id ON embedding(user_id);
CREATE INDEX idx_embedding_file_id ON embedding(file_id);
CREATE INDEX idx_embedding_hash ON embedding(hash);

-- Enable RLS
ALTER TABLE embedding ENABLE ROW LEVEL SECURITY;

-- Policies for embedding table
CREATE POLICY select_embedding_policy ON embedding
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY insert_embedding_policy ON embedding
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY update_embedding_policy ON embedding
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY delete_embedding_policy ON embedding
FOR DELETE
USING (user_id = auth.uid());