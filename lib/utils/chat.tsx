import { getChatById, getMessagesByChatId, getUser } from '@/lib/db/queries';
import type { Attachment, UIMessage } from 'ai';
import type { DBMessage } from '@/lib/db/schema';

// Convert database messages to UI messages
export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<UIMessage> {
  return messages.map((message) => ({
    id: message.id,
    parts: message.parts as UIMessage['parts'],
    role: message.role as UIMessage['role'],
    content: '',
    createdAt: new Date(message.createdAt),
    experimental_attachments:
      (message.attachments as unknown as Array<Attachment>) ?? [],
  }));
}

// Load chat and handle permissions
export async function loadChat(chatId: string) {
  const { user } = await getUser();
  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return { chat: null, messages: [], isReadonly: true, hasAccess: false };
  }

  // Check permissions
  let isReadonly = false;
  let hasAccess = true;

  // Private chats need permissions check
  if (chat.visibility === 'private') {
    if (!user || user.is_anonymous) {
      hasAccess = false;
    } else if (user.id !== chat.userId) {
      hasAccess = false;
    }
  }

  // User can read but not modify if not the owner
  isReadonly = !user || user.id !== chat.userId;

  // Load messages if access is allowed
  const messagesFromDb = hasAccess
    ? await getMessagesByChatId({ id: chatId })
    : [];
  const messages = convertToUIMessages(messagesFromDb);

  return { chat, messages, isReadonly, hasAccess };
}
