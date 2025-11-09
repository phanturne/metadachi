-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "vector";

-- Notebooks/Projects
CREATE TABLE notebooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'private' NOT NULL CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sources
CREATE TABLE sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  source_type TEXT DEFAULT 'text' NOT NULL CHECK (source_type IN ('text', 'file', 'url')),
  file_path TEXT,
  file_type TEXT,
  file_size BIGINT CHECK (file_size > 0),
  source_url TEXT,
  status TEXT DEFAULT 'processing' NOT NULL CHECK (status IN ('processing', 'ready', 'error')),
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Data integrity: ensure required fields are set based on source_type
  CONSTRAINT check_source_type_file_path CHECK (
    (source_type = 'file' AND file_path IS NOT NULL) OR
    (source_type != 'file')
  ),
  CONSTRAINT check_source_type_url CHECK (
    (source_type = 'url' AND source_url IS NOT NULL) OR
    (source_type != 'url')
  )
);

-- Source chunks for embeddings
CREATE TABLE source_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  token_count INTEGER CHECK (token_count > 0),
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Source summaries for quick overview
CREATE TABLE source_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}' NOT NULL,
  topics TEXT[] DEFAULT '{}' NOT NULL,
  word_count INTEGER CHECK (word_count > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX idx_notebooks_visibility ON notebooks(visibility);
CREATE INDEX idx_sources_notebook_id ON sources(notebook_id);
CREATE INDEX idx_sources_status ON sources(status);
CREATE INDEX idx_sources_notebook_status ON sources(notebook_id, status);
CREATE INDEX idx_source_chunks_source_id ON source_chunks(source_id);
CREATE INDEX idx_source_summaries_source_id ON source_summaries(source_id);

-- Row Level Security (RLS)
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Notebooks
CREATE POLICY "Users can view own notebooks" ON notebooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public notebooks" ON notebooks FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can insert own notebooks" ON notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update notebooks" ON notebooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete notebooks" ON notebooks FOR DELETE USING (auth.uid() = user_id);

-- Sources
CREATE POLICY "Users can view sources in accessible notebooks" ON sources FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM notebooks 
    WHERE notebooks.id = sources.notebook_id 
    AND (notebooks.user_id = auth.uid() OR notebooks.visibility = 'public')
  )
);
CREATE POLICY "Owners can manage sources" ON sources FOR ALL USING (
  EXISTS (
    SELECT 1 FROM notebooks 
    WHERE notebooks.id = sources.notebook_id AND notebooks.user_id = auth.uid()
  )
);

-- Source chunks inherit source permissions
CREATE POLICY "Users can view chunks in accessible sources" ON source_chunks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sources 
    JOIN notebooks ON notebooks.id = sources.notebook_id
    WHERE sources.id = source_chunks.source_id 
    AND (notebooks.user_id = auth.uid() OR notebooks.visibility = 'public')
  )
);
CREATE POLICY "Owners can manage chunks" ON source_chunks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM sources 
    JOIN notebooks ON notebooks.id = sources.notebook_id
    WHERE sources.id = source_chunks.source_id AND notebooks.user_id = auth.uid()
  )
);

-- Source summaries inherit source permissions
CREATE POLICY "Users can view summaries in accessible sources" ON source_summaries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sources 
    JOIN notebooks ON notebooks.id = sources.notebook_id
    WHERE sources.id = source_summaries.source_id 
    AND (notebooks.user_id = auth.uid() OR notebooks.visibility = 'public')
  )
);
CREATE POLICY "Owners can manage summaries" ON source_summaries FOR ALL USING (
  EXISTS (
    SELECT 1 FROM sources 
    JOIN notebooks ON notebooks.id = sources.notebook_id
    WHERE sources.id = source_summaries.source_id AND notebooks.user_id = auth.uid()
  )
);

-- Function to get user permission for notebook
CREATE OR REPLACE FUNCTION get_user_notebook_permission(
  notebook_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT CASE
    WHEN n.user_id = user_id_param THEN 'owner'
    WHEN n.visibility = 'public' THEN 'read'
    ELSE 'none'
  END
  FROM notebooks n
  WHERE n.id = notebook_id_param;
$$;

-- Functions for vector similarity search
CREATE OR REPLACE FUNCTION search_sources(
  query_embedding VECTOR(1536),
  notebook_id_param UUID,
  match_threshold FLOAT DEFAULT 0.8,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  source_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT 
    sc.id,
    sc.source_id,
    sc.content,
    1 - (sc.embedding <=> query_embedding) AS similarity
  FROM source_chunks sc
  JOIN sources s ON s.id = sc.source_id
  WHERE s.notebook_id = notebook_id_param
    AND sc.embedding IS NOT NULL
    AND 1 - (sc.embedding <=> query_embedding) > match_threshold
  ORDER BY sc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notebooks_updated_at BEFORE UPDATE ON notebooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_source_summaries_updated_at BEFORE UPDATE ON source_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket creation and policies
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('sources', 'sources', false)
ON CONFLICT (id) DO NOTHING;

-- Sources bucket policies
-- File path structure: {uploader_id}/{notebook_id}/{source_id}/filename.ext
-- Using split_part() for reliable path parsing: split_part(name, '/', n) extracts the nth segment

-- Policy: Users can view files in accessible notebooks
CREATE POLICY "Users can view accessible files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'sources' AND
  EXISTS (
    SELECT 1 FROM notebooks n
    WHERE n.id::text = split_part(name, '/', 2)
    AND (n.visibility = 'public' OR n.user_id = auth.uid())
  )
);

-- Policy: Owners can manage files in their notebooks (INSERT, UPDATE, DELETE)
-- Note: FOR ALL with USING clause covers all operations including INSERT
CREATE POLICY "Owners can manage files" ON storage.objects
FOR ALL USING (
  bucket_id = 'sources' AND
  auth.uid()::text = split_part(name, '/', 1) AND
  EXISTS (
    SELECT 1 FROM notebooks n
    WHERE n.id::text = split_part(name, '/', 2)
    AND n.user_id = auth.uid()
  )
);