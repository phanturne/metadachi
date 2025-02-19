import { FileLibrary } from '@/components/files/file-library';
import { getFilesByUserId } from '@/supabase/queries/file';
import { getUser } from '@/supabase/queries/user';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'File Library',
  description: 'Manage your uploaded files',
};

export default async function LibraryPage() {
  const user = await getUser();

  if (!user.user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            Please log in to view your file library.
          </p>
        </div>
      </div>
    );
  }

  const initialFiles = await getFilesByUserId({ userId: user.user.id });

  return <FileLibrary initialFiles={initialFiles} userId={user.user.id} />;
}
