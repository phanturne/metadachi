import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { v4 as uuidv4 } from 'uuid';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { Sources } from '@/components/sources';
import { LibraryHeader } from '@/components/library-header';
import { loadChat } from '@/lib/utils/chat';
import type { UIMessage } from 'ai';

interface PageProps {
  params: { id: string };
  searchParams: Promise<{ chatId?: string }>;
}

export default async function Page({ searchParams, params }: PageProps) {
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  const resolvedSearchParams = await searchParams;

  let id = uuidv4();
  let initialMessages: Array<UIMessage> = [];
  let isReadonly = false;

  // If chatId is provided, load existing chat data
  if (resolvedSearchParams.chatId) {
    const {
      chat,
      messages,
      isReadonly: readonly,
    } = await loadChat(resolvedSearchParams.chatId);
    if (chat) {
      id = chat.id;
      initialMessages = messages;
      isReadonly = readonly;
    }
  }

  const chatComponent = (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={initialMessages}
        selectedChatModel={
          modelIdFromCookie ? modelIdFromCookie.value : DEFAULT_CHAT_MODEL
        }
        selectedVisibilityType="private"
        isReadonly={isReadonly}
        type="embedded"
      />
      <DataStreamHandler id={id} />
    </>
  );

  return (
    <div className="flex flex-col h-dvh">
      <LibraryHeader />
      <div className="flex flex-1">
        <div className="flex-1 border-r border-border bg-muted/40">
          <Sources />
        </div>
        <div className="flex-1">{chatComponent}</div>
      </div>
    </div>
  );
}
