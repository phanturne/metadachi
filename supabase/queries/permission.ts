import { createClient } from '@/utils/supabase/server';
import type { Database } from '../types';

export type Permission = Database['public']['Tables']['permission']['Row'];

export async function savePermission({
  id,
  resourceType,
  resourceId,
  userId,
  communityId,
  role,
}: {
  id: string;
  resourceType: string;
  resourceId: string;
  userId?: string;
  communityId?: string;
  role: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('permission').insert({
    id,
    resource_type: resourceType,
    resource_id: resourceId,
    user_id: userId,
    community_id: communityId,
    role,
  });

  if (error) {
    console.error('Failed to save permission in database', error);
    throw error;
  }

  return data;
}

export async function getPermissionsByUserId({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('permission')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get permissions by user id from database', error);
    throw error;
  }

  return data;
}

export async function getPermissionById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('permission')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to get permission by id from database', error);
    throw error;
  }

  return data;
}

export async function deletePermissionById({ id }: { id: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('permission').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete permission by id from database', error);
    throw error;
  }
}
