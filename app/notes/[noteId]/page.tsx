"use client";

import { useRouter } from "next/navigation";
import { useGetNote, useUpdateNote } from "@/hooks/use-notes-service";
import { Loader2, Check } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { NoteEditor } from "@/components/notes/editor";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NotePage({ params }: { params: { noteId: string } }) {
  const router = useRouter();
  const { noteId } = params;
  const { data: note, isLoading, error } = useGetNote(noteId);
  const updateNoteMutation = useUpdateNote();
  const [content, setContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!noteId) {
      router.push("/");
    } else if (note) {
      setContent(note.content as string);
    }
  }, [noteId, note, router]);

  const saveNote = async (content: string) => {
    try {
      setIsSaving(true);
      await updateNoteMutation.mutateAsync({
        noteId,
        updates: { content },
      });
      setLastSavedAt(new Date());
      setIsDirty(false);
    } catch (error) {
      toast.error("Failed to save note");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      await saveNote(content);
    }, 1000),
    [],
  );

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
    debouncedSave(newContent);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load note</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{note?.name || "Untitled Note"}</h1>
      <div className="mt-4">
        <NoteEditor content={content} onUpdate={handleContentChange} />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
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
      <div className="flex space-x-2 mt-4">
        <Button variant="outline" onClick={() => router.back()}>
          Close
        </Button>
      </div>
    </div>
  );
}