import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function HomePage() {
  const id = uuidv4();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
