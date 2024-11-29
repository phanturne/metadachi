"use client";

import { Note } from "@/lib/database/notes-service";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface RelatedNotesProps {
  relatedNotes: Note[];
}

export default function RelatedNotes({ relatedNotes }: RelatedNotesProps) {
  const router = useRouter();

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  return (
    <div className="space-y-2">
      <Label>Related Notes</Label>
      <div className="rounded-md border border-input bg-background p-4">
        {relatedNotes.length > 0 ? (
          <ul className="list-inside list-disc space-y-2">
            {relatedNotes.map((note) => (
              <li
                key={note.note_id}
                className="cursor-pointer text-sm"
                onClick={() => handleNoteClick(note.note_id)}
              >
                {note.name || "Untitled Note"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No related notes</p>
        )}
      </div>
    </div>
  );
}
