import { getUser } from '@/supabase/queries/user';
import { getFilesByUserId } from '@/supabase/queries/file';

export async function GET() {
  const { user: sessionUser } = await getUser();

  if (!sessionUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  const files = await getFilesByUserId({ userId: sessionUser.id });
  return Response.json(files);
}
