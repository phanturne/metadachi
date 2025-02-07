import { getProfileByUserId } from '@/supabase/queries/user';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json('Unauthorized!', { status: 401 });
    }

    const profile = await getProfileByUserId({ id: user.id });
    return Response.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return Response.json('Internal Server Error', { status: 500 });
  }
}
