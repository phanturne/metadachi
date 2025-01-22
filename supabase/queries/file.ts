import { createClient } from '@/utils/supabase/server';
import type { Database } from '../types';

export type File = Database['public']['Tables']['file']['Row'];

export async function saveFile({
  id,
  name,
  description,
  filePath,
  userId,
  folderId,
  size,
  tokens,
  hash,
  type,
  metadata,
}: {
  id: string;
  name: string;
  description: string;
  filePath: string;
  userId: string;
  folderId?: string;
  size: number;
  tokens: number;
  hash: string;
  type: string;
  metadata: any;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('file').insert({
    id,
    name,
    description,
    file_path: filePath,
    user_id: userId,
    folder_id: folderId,
    size,
    tokens,
    hash,
    type,
    metadata,
  });

  if (error) {
    console.error('Failed to save file in database', error);
    throw error;
  }

  return data;
}

export async function getFilesByUserId({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('file')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get files by user id from database', error);
    throw error;
  }

  return data;
}

export async function getFileById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('file')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to get file by id from database', error);
    throw error;
  }

  return data;
}

export async function deleteFileById({ id }: { id: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('file').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete file by id from database', error);
    throw error;
  }
}
