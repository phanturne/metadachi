import 'server-only';
import { createClient } from '@/utils/supabase/server';
import type { ArtifactKind } from '@/components/artifact';
import type { DBMessage, Suggestion } from './schema';

/*
Be careful when protecting pages. The server gets the user session from the cookies, which can be spoofed by anyone.
Always use supabase.auth.getUser() to protect pages and user data.
Never trust supabase.auth.getSession() inside server code such as middleware. It isn't guaranteed to revalidate the Auth token.
It's safe to trust getUser() because it sends a request to the Supabase Auth server every time to revalidate the Auth token."
*/
export async function getUser() {
  const supabase = await createClient();

  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    return {
      user: fetchedUser,
      error: null,
    };
  } catch (e) {
    return {
      user: null,
      error: e as Error,
    };
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('Chat').insert({
      id,
      userId,
      title,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save chat in database', error);
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    const supabase = await createClient();

    const { error: chatError } = await supabase
      .from('Chat')
      .delete()
      .eq('id', id);

    if (chatError) throw chatError;
  } catch (error) {
    console.error('Failed to delete chat by id from database', error);
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Chat')
      .select()
      .eq('userId', id)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get chats by user from database', error);
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Chat')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      // If it's the "no rows returned" error, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Failed to get chat by id from database', error);
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('Message').insert(messages);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Message')
      .select()
      .eq('chatId', id)
      .order('createdAt', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('Vote').upsert(
      {
        chatId,
        messageId,
        isUpvoted: type === 'up',
      },
      {
        onConflict: 'chatId,messageId',
        ignoreDuplicates: false,
      },
    );

    if (error) throw error;
  } catch (error) {
    console.error('Failed to vote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Vote')
      .select()
      .eq('chatId', id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('Document').insert({
      id,
      title,
      kind,
      content,
      userId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save document in database', error);
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Document')
      .select()
      .eq('id', id)
      .order('createdAt', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get document by id from database', error);
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Document')
      .select()
      .eq('id', id)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get document by id from database', error);
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    const supabase = await createClient();

    // Delete related suggestions first
    const { error: suggestionError } = await supabase
      .from('Suggestion')
      .delete()
      .eq('documentId', id)
      .gt('documentCreatedAt', timestamp.toISOString());

    if (suggestionError) throw suggestionError;

    // Then delete documents
    const { error: documentError } = await supabase
      .from('Document')
      .delete()
      .eq('id', id)
      .gt('createdAt', timestamp.toISOString());

    if (documentError) throw documentError;
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
      error,
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('Suggestion').insert(suggestions);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save suggestions in database', error);
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Suggestion')
      .select()
      .eq('documentId', documentId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
      error,
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Message')
      .select()
      .eq('id', id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get message by id from database', error);
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const supabase = await createClient();

    // Get messages to delete
    const { data: messagesToDelete, error: selectError } = await supabase
      .from('Message')
      .select('id')
      .eq('chatId', chatId)
      .gte('createdAt', timestamp.toISOString());

    if (selectError) throw selectError;

    if (messagesToDelete && messagesToDelete.length > 0) {
      const messageIds = messagesToDelete.map((msg) => msg.id);

      // Delete related votes
      const { error: voteError } = await supabase
        .from('Vote')
        .delete()
        .eq('chatId', chatId)
        .in('messageId', messageIds);

      if (voteError) throw voteError;

      // Delete messages
      const { error: messageError } = await supabase
        .from('Message')
        .delete()
        .eq('chatId', chatId)
        .in('id', messageIds);

      if (messageError) throw messageError;
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
      error,
    );
    throw error;
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('Chat')
      .update({ visibility })
      .eq('id', chatId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update chat visibility in database', error);
    throw error;
  }
}
