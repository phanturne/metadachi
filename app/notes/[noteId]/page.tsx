"use client";

import { useRouter } from "next/navigation";
import { useGetNote } from "@/hooks/use-notes-service";
import { Loader2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { NoteEditor } from "@/components/notes/editor";
import { Button } from "@/components/ui/button";
import { useSaveNote } from "@/hooks/use-save-note";
import { UpdateNoteParams } from "@/lib/database/notes-service";

export default function NotePage({ params }: { params: { noteId: string } }) {
  const router = useRouter();
  const { noteId } = params;
  const { data: note, isLoading, error } = useGetNote(noteId);
  const [noteState, setNoteState] = useState<UpdateNoteParams>({
    note_id: noteId,
    name: "",
    content: {},
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const { debouncedSaveNote } = useSaveNote({
    setIsSaving,
    setLastSavedAt,
    setIsDirty,
  });

  useEffect(() => {
    if (!noteId) {
      router.push("/");
    } else if (note) {
      setNoteState({
        note_id: noteId,
        name: note.name,
        content: note.content,
      });
    }
  }, [noteId, note, router]);

  const handleContentChange = (newContent: string) => {
    const updatedNote = { ...noteState, content: newContent };
    setNoteState(updatedNote);
    setIsDirty(true);
    debouncedSaveNote(updatedNote);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load note</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        {noteState.name || "Untitled Note"}
      </h1>
      <div className="mt-4">
        <NoteEditor
          content={noteState.content as string}
          onUpdate={handleContentChange}
        />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : isDirty ? (
          <span>Unsaved changes</span>
        ) : lastSavedAt ? (
          <>
            <Check className="h-4 w-4" />
            <span>Saved {lastSavedAt.toLocaleTimeString()}</span>
          </>
        ) : null}
      </div>
      <div className="mt-4 flex space-x-2">
        <Button variant="outline" onClick={() => router.back()}>
          Close
        </Button>
      </div>
    </div>
  );
}
