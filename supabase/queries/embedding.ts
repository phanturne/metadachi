import { createClient } from '@/utils/supabase/server';
import type { Database } from '../types';

export type Embedding = Database['public']['Tables']['embedding']['Row'];
export type EmbeddingInsert = Database['public']['Tables']['embedding']['Insert'];

export async function upsertEmbeddings({
  embeddings,
}: {
  embeddings: EmbeddingInsert[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('embedding').upsert(embeddings);

  if (error) {
    console.error('Failed to upsert embeddings in database', error);
    throw error;
  }

  return data;
}

export async function getEmbeddingsByUserId({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('embedding')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get embeddings by user id from database', error);
    throw error;
  }

  return data;
}

export async function getEmbeddingById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('embedding')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to get embedding by id from database', error);
    throw error;
  }

  return data;
}

export async function deleteEmbeddingById({ id }: { id: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('embedding').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete embedding by id from database', error);
    throw error;
  }
}

export async function matchEmbeddings({
  queryEmbedding,
  matchCount,
  fileIds,
  folderIds,
}: {
  queryEmbedding: any;
  matchCount?: number;
  fileIds?: string[];
  folderIds?: string[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('match_file_items', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    file_ids: fileIds,
    folder_ids: folderIds,
  });

  if (error) {
    console.error('Failed to match embeddings in database', error);
    throw error;
  }

  return data;
}
