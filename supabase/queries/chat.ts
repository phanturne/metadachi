import { createClient } from '@/utils/supabase/server';
import type { Database, TablesInsert } from '../types';
import type { AssistantContent, ToolContent, UserContent } from 'ai';

export type Chat = Database['public']['Tables']['chat']['Row'];
export type Message = Database['public']['Tables']['message']['Row'];
export type Document = Database['public']['Tables']['document']['Row'];
export type Vote = Database['public']['Tables']['vote']['Row'];
export type Suggestion = Database['public']['Tables']['suggestion']['Row'];
export type MessageContent = UserContent | ToolContent | AssistantContent;

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('chat').insert({
    id,
    user_id: userId,
    title,
  });

  if (error) {
    console.error('Failed to save chat in database', error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  const supabase = await createClient();
  const { error } = await supabase.from('chat').delete().eq('id', id);

  if (error) {
    console.error('Failed to delete chat by id from database', error);
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chat')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get chats by user from database', error);
    throw error;
  }

  return data;
}

export async function getChatById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chat')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code === 'PGRST116') {
    // No rows returned
    return null;
  } else if (error) {
    console.error('Failed to get chat by id from database', error);
    throw error;
  }

  return data;
}

export async function saveMessages({
  messages,
}: { messages: Array<TablesInsert<'message'>> }) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('message').insert(messages);

  if (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }

  return data;
}

export async function getMessagesByChatId({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('message')
    .select('*')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }

  return data;
}

export async function voteMessage({
  chatId,
  messageId,
  type,
  userId,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
  userId: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('vote').upsert({
    chat_id: chatId,
    message_id: messageId,
    is_upvoted: type === 'up',
    user_id: userId,
  });

  if (error) {
    console.error('Failed to upsert vote in database', error);
    throw error;
  }

  return data;
}

export async function getVotesByChatId({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vote')
    .select('*')
    .eq('chat_id', id);

  if (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }

  return data;
}

export async function getMessageById({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('message')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error('Failed to get message by id from database', error);
    throw error;
  }

  return data;
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('message')
    .delete()
    .eq('chat_id', chatId)
    .gte('created_at', timestamp);

  if (error) {
    console.error(
      'Failed to delete messages by chat id after timestamp from database',
      error,
    );
    throw error;
  }

  return data;
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('chat')
    .update({ visibility })
    .eq('id', chatId);

  if (error) {
    console.error('Failed to update chat visibility in database', error);
    throw error;
  }

  return data;
}
