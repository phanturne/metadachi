-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE source_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(source_id, chunk_index)
);

-- Create index for vector similarity search
CREATE INDEX source_embeddings_embedding_idx ON source_embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Add function to perform similarity search with context
CREATE OR REPLACE FUNCTION match_sources(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    context_size int DEFAULT 1
)
RETURNS TABLE (
    source_id UUID,
    chunk_index INTEGER,
    chunk_text TEXT,
    context_before TEXT[],
    context_after TEXT[],
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH matches AS (
        SELECT
            se.source_id,
            se.chunk_index,
            se.chunk_text,
            1 - (se.embedding <=> query_embedding) as similarity
        FROM source_embeddings se
        WHERE 1 - (se.embedding <=> query_embedding) > match_threshold
        ORDER BY se.embedding <=> query_embedding
        LIMIT match_count
    )
    SELECT
        m.source_id,
        m.chunk_index,
        m.chunk_text,
        ARRAY(
            SELECT chunk_text
            FROM source_embeddings
            WHERE source_id = m.source_id
            AND chunk_index < m.chunk_index
            ORDER BY chunk_index DESC
            LIMIT context_size
        ) as context_before,
        ARRAY(
            SELECT chunk_text
            FROM source_embeddings
            WHERE source_id = m.source_id
            AND chunk_index > m.chunk_index
            ORDER BY chunk_index ASC
            LIMIT context_size
        ) as context_after,
        m.similarity
    FROM matches m;
END;
$$;
