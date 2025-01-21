import { createClient } from '@/utils/supabase/server';
import type { Database } from '../types';

export type Embedding = Database['public']['Tables']['embedding']['Row'];

export async function saveEmbedding({
  id,
  userId,
  fileId,
  content,
  embeddings,
  tokens,
  hash,
  metadata,
}: {
  id: string;
  userId: string;
  fileId: string;
  content: string;
  embeddings: any;
  tokens: number;
  hash: string;
  metadata: any;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('embedding').insert({
    id,
    user_id: userId,
    file_id: fileId,
    content,
    embeddings,
    tokens,
    hash,
    metadata,
  });

  if (error) {
    console.error('Failed to save embedding in database', error);
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
