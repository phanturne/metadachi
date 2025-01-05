import { cookies } from 'next/headers';
import { getUserServer } from '@/utils/getUser';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET() {
  const cookieStore = await cookies();
  const { user: sessionUser } = await getUserServer();

  if (!sessionUser) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: sessionUser.id! });
  return Response.json(chats);
}
