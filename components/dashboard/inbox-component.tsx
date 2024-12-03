"use client";

import { Inbox, Plus, StickyNote, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useNotesByStatus } from "@/hooks/use-notes-service";
import NotesItemDialog from "@/components/notes/notes-item-dialog";

export const InboxComponent = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/sign-in");
      } else {
        setUserId(session.user.id);
      }
      setIsLoadingSession(false);
    };
    loadSession();
  }, [supabase, router]);

  const {
    data: recentNotes,
    isLoading,
    error,
  } = useNotesByStatus(userId, "inbox");

  if (isLoadingSession || isLoading) {
    return (
      <div className="flex h-full flex-col">
        <h2 className="mb-4 flex items-center text-sm text-muted-foreground">
          <Inbox className="mr-2 h-4 w-4" />
          Inbox
        </h2>
        <div className="flex h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">Loading notes...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col">
        <h2 className="mb-4 flex items-center text-sm text-muted-foreground">
          <Inbox className="mr-2 h-4 w-4" />
          Inbox
        </h2>
        <div className="flex h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm">Failed to load notes</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-4 flex items-center text-sm text-muted-foreground">
        <Inbox className="mr-2 h-4 w-4" />
        Inbox
      </h2>
      <div className="relative flex max-h-96 flex-grow flex-col overflow-y-auto rounded-xl border bg-card p-4 shadow-sm">
        {recentNotes?.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center pb-4 text-muted-foreground">
            <Inbox className="mb-4 h-12 w-12" />
            <span className="text-lg font-medium">Your inbox is empty</span>
            <span className="mt-2 text-sm">Start by creating a new note</span>
          </div>
        ) : (
          recentNotes?.map((note) => (
            <div
              key={note.note_id}
              className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setSelectedNoteId(note.note_id);
                setDialogOpen(true);
              }}
            >
              <div className="flex items-center gap-3">
                <StickyNote className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                <span className="font-medium">{note.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  Inbox
                </span>
                {note.note_type && (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {note.note_type}
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        <Button
          onClick={() => {
            setSelectedNoteId(null);
            setDialogOpen(true);
          }}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <NotesItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        noteId={selectedNoteId ?? undefined}
        defaultStatus="inbox"
      />
    </div>
  );
};
