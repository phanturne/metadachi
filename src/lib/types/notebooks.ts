export type Notebook = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  visibility: "private" | "public";
  created_at: string;
  updated_at: string;
};

export type Source = {
  id: string;
  notebook_id: string;
  title: string;
  content: string | null;
  source_type: "text" | "file" | "url";
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  source_url: string | null;
  status: "processing" | "ready" | "error";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SourceSummary = {
  id: string;
  source_id: string;
  summary: string;
  key_points: string[];
  topics: string[];
  word_count: number | null;
  created_at: string;
  updated_at: string;
};

export type SourceChunk = {
  id: string;
  source_id: string;
  content: string;
  chunk_index: number;
  token_count: number | null;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
};
