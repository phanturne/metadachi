import { getProfileByUserId, getUser } from '@/supabase/queries/user';

export async function GET() {
  try {
    const { user: sessionUser } = await getUser();

    if (!sessionUser) {
      return Response.json('Unauthorized!', { status: 401 });
    }

    const profile = await getProfileByUserId({ id: sessionUser.id });
    return Response.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return Response.json('Internal Server Error', { status: 500 });
  }
}
