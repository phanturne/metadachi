import { getLibrariesByUserId, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { CreateLibraryDialog } from '@/components/create-library-dialog';
import { Plus } from 'lucide-react';
import { LibraryCard } from '@/components/library-card';

export default async function LibraryPage() {
  const { user } = await getUser();

  if (!user) {
    redirect('/login');
  }

  const libraries = await getLibrariesByUserId({ userId: user.id });

  return (
    <div className="container max-w-screen-xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Libraries</h1>
        <CreateLibraryDialog />
      </div>

      {libraries.length === 0 ? (
        <div className="text-center py-16 bg-muted/40 rounded-lg border border-dashed">
          <h2 className="text-xl font-semibold mb-4">No libraries yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Libraries help you organize your documents and chat with them.
            Create your first library to get started.
          </p>
          <CreateLibraryDialog
            variant="default"
            size="default"
            className="inline-flex items-center justify-center gap-2 mx-auto"
          >
            <Plus />
            Create your first library
          </CreateLibraryDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraries.map((library) => (
            <LibraryCard
              key={library.id}
              id={library.id}
              name={library.name}
              description={library.description || ''}
              imageUrl={library.imagePath}
              createdAt={library.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}
