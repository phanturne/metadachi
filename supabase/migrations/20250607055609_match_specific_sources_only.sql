-- Add function to perform similarity search with context
CREATE OR REPLACE FUNCTION match_sources(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    context_size int DEFAULT 1,
    source_ids UUID[] DEFAULT NULL
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
    WITH ranked_matches AS (
        SELECT
            se.source_id,
            se.chunk_index,
            se.chunk_text,
            1 - (se.embedding <=> query_embedding) as similarity,
            ROW_NUMBER() OVER (PARTITION BY se.source_id ORDER BY se.embedding <=> query_embedding) as source_rank
        FROM source_embeddings se
        WHERE 1 - (se.embedding <=> query_embedding) > match_threshold
        AND (source_ids IS NULL OR se.source_id = ANY(source_ids))
    ),
    top_matches AS (
        SELECT *
        FROM ranked_matches
        WHERE source_rank = 1
        ORDER BY similarity DESC
        LIMIT match_count
    )
    SELECT
        m.source_id,
        m.chunk_index,
        m.chunk_text,
        ARRAY(
            SELECT se.chunk_text
            FROM source_embeddings se
            WHERE se.source_id = m.source_id
            AND se.chunk_index < m.chunk_index
            ORDER BY se.chunk_index DESC
            LIMIT context_size
        ) as context_before,
        ARRAY(
            SELECT se.chunk_text
            FROM source_embeddings se
            WHERE se.source_id = m.source_id
            AND se.chunk_index > m.chunk_index
            ORDER BY se.chunk_index ASC
            LIMIT context_size
        ) as context_after,
        m.similarity
    FROM top_matches m;
END;
$$;
