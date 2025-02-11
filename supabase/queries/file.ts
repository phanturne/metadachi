// Adapted from https://github.com/mckaywrigley/chatbot-ui/blob/main/db/files.ts

'use server';

import { createClient } from '@/utils/supabase/server';
import type { Database } from '../types';

export type FileRow = Database['public']['Tables']['file']['Row'];
export type FileInsert = Database['public']['Tables']['file']['Insert'];
export interface FileChunk {
  content: string;
  tokens: number;
  hash: string;
}

export async function saveFile(fileData: FileInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('file')
    .insert(fileData)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to save file in database', error);
    return { data: null, error };
  }

  return { data, error };
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

export async function updateFile({
  id,
  file,
}: { id: string; file: FileInsert }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('file')
    .update(file)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to update file in database', error);
    throw error;
  }

  return data;
}
