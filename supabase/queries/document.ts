import { createClient } from '@/utils/supabase/server';
import type { Database, TablesInsert } from '../types';

export type Document = Database['public']['Tables']['document']['Row'];

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
  chatId,
}: {
  id: string;
  title: string;
  kind: string;
  content: string;
  userId: string;
  chatId: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('document').insert({
    id,
    title,
    kind,
    content,
    user_id: userId,
    chat_id: chatId,
  });

  if (error) {
    console.error('Failed to save document in database', error);
    throw error;
  }

  return data;
}

export async function getDocumentsByChatId({ chatId }: { chatId: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('document')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get documents by chat id from database', error);
    throw error;
  }

  return data;
}

export async function getDocumentsById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('document')
    .select('*')
    .eq('id', id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get document by id from database', error);
    throw error;
  }

  return data;
}

export async function getDocumentById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('document')
    .select('*')
    .eq('id', id)
    .order('created_at', { ascending: false })
    .single();

  if (error) {
    console.error('Failed to get document by id from database', error);
    throw error;
  }

  return data;
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: string;
}) {
  const supabase = await createClient();
  const { error: suggestionError } = await supabase
    .from('suggestion')
    .delete()
    .eq('document_id', id)
    .gt('document_created_at', timestamp);

  if (suggestionError) {
    console.error(
      'Failed to delete suggestions by document id after timestamp from database',
      suggestionError,
    );
    throw suggestionError;
  }

  const { data, error } = await supabase
    .from('document')
    .delete()
    .eq('id', id)
    .gt('created_at', timestamp);

  if (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
      error,
    );
    throw error;
  }

  return data;
}
export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<TablesInsert<'suggestion'>>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('suggestion').insert(suggestions);

  if (error) {
    console.error('Failed to save suggestions in database', error);
    throw error;
  }

  return data;
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suggestion')
    .select('*')
    .eq('document_id', documentId);

  if (error) {
    console.error(
      'Failed to get suggestions by document id from database',
      error,
    );
    throw error;
  }

  return data;
}
