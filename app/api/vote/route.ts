import { cookies } from 'next/headers';
import { getUser } from '@/supabase/queries/user';
import { getVotesByChatId, voteMessage } from '@/supabase/queries/chat';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const cookieStore = await cookies();
  const { user: sessionUser } = await getUser();

  if (!sessionUser || !sessionUser.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const votes = await getVotesByChatId({ id: chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  const { user: sessionUser } = await getUser();

  if (!sessionUser || !sessionUser.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  await voteMessage({
    chatId,
    messageId,
    type: type,
    userId: sessionUser.id,
  });

  return new Response('Message voted', { status: 200 });
}
