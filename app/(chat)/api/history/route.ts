import { getUser } from '@/supabase/queries/user';
import { getChatsByUserId } from '@/supabase/queries/chat';

export async function GET() {
  const { user: sessionUser } = await getUser();

  if (!sessionUser) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const chats = await getChatsByUserId({ id: sessionUser.id });
  return Response.json(chats);
}
