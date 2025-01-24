import { createClient } from '@/utils/supabase/server';
import type { Database } from '../types';

export type Folder = Database['public']['Tables']['folder']['Row'];
export type FolderInsert = Database['public']['Tables']['folder']['Insert'];

export async function saveFolder(folderData: FolderInsert) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('folder')
    .insert(folderData)
    .select('*')
    .single();

  if (error) {
    console.error('Failed to save folder in database', error);
    return { data: null, error };
  }

  return { data, error };
}

export async function getFoldersByUserId({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('folder')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get folders by user id from database', error);
    throw error;
  }

  return data;
}

export async function getFolderById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('folder')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to get folder by id from database', error);
    throw error;
  }

  return data;
}

export async function deleteFolderById({ id }: { id: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('folder').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete folder by id from database', error);
    throw error;
  }
}
