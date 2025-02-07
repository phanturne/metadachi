import { FileLibrary } from '@/components/files/file-library';
import { getFilesByUserId } from '@/supabase/queries/file';
import { getUser } from '@/supabase/queries/user';

export default async function LibraryPage() {
  const user = await getUser();

  if (!user.user) {
    return <div className="p-4">Please log in to view files</div>;
  }

  const initialFiles = await getFilesByUserId({ userId: user.user.id });

  return <FileLibrary initialFiles={initialFiles} userId={user.user.id} />;
}
