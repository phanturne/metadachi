import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { loadChat } from '@/lib/utils/chat';
import type { VisibilityType } from '@/components/visibility-selector';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const { chat, messages, isReadonly, hasAccess } = await loadChat(id);

  if (!chat || !hasAccess) {
    notFound();
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  const selectedChatModel = chatModelFromCookie
    ? chatModelFromCookie.value
    : DEFAULT_CHAT_MODEL;

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={messages}
        selectedChatModel={selectedChatModel}
        selectedVisibilityType={chat.visibility as VisibilityType}
        isReadonly={isReadonly}
        type="standalone"
      />
      <DataStreamHandler id={id} />
    </>
  );
}
