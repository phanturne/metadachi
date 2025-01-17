import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { getUser } from '@/supabase/queries/user';
import { Chat } from '@/components/chat/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/supabase/queries/chat';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/chat/data-stream-handler';
import type { VisibilityType } from '@/components/chat/visibility-selector';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const cookieStore = await cookies();
  const { user: sessionUser } = await getUser();

  if (chat.visibility === 'private') {
    if (!sessionUser) {
      return notFound();
    }

    if (sessionUser.id !== chat.user_id) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        selectedVisibilityType={chat.visibility as VisibilityType}
        isReadonly={sessionUser?.id !== chat.user_id}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
