'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Book, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LibraryEditDialog } from './library-edit-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LibraryCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  createdAt: string;
}

export function LibraryCard({
  id,
  name,
  description,
  imageUrl,
  createdAt,
}: LibraryCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/libraries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete library');
      }

      toast.success('Library deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete library');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/20 hover:shadow-lg dark:hover:shadow-primary/10">
        {/* Card top action menu */}
        <div className="absolute right-3 top-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <MoreHorizontal className="h-4 w-4 text-white dark:text-gray-200" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Library
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Image section with overlay */}
        <div className="relative aspect-video w-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/60 to-muted">
              <Book className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <Link href={`/library/${id}`} className="absolute inset-0">
            <span className="sr-only">View {name}</span>
          </Link>
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col p-6">
          <Link
            href={`/library/${id}`}
            className="group/content flex flex-1 flex-col space-y-2.5"
          >
            <h2 className="line-clamp-1 text-lg font-medium tracking-tight group-hover/content:text-primary">
              {name}
            </h2>

            <p className="line-clamp-2 text-sm text-muted-foreground/80">
              {description || 'No description provided'}
            </p>
          </Link>

          {/* Footer section - removed border-t */}
          <div className="mt-auto pt-5 flex items-center justify-between mt-4">
            <time
              dateTime={createdAt}
              className="text-xs font-light text-muted-foreground"
            >
              {new Date(createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 font-normal hover:bg-primary/10 hover:text-primary"
            >
              <Link href={`/library/${id}`}>View library</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <LibraryEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        id={id}
        initialName={name}
        initialDescription={description}
        initialImageUrl={imageUrl}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the library "{name}" and all its
              contents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
