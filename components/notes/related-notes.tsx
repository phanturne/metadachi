
import { Note } from "@/lib/database/notes-service";
import { useRouter } from "next/router";
import { Label } from "@/components/ui/label";

interface RelatedNotesProps {
  notes: Note[];
}

export default function RelatedNotes({ notes }: RelatedNotesProps) {
  const router = useRouter();

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  return (
    <div className="space-y-2">
      <Label>Related Notes</Label>
      <div className="rounded-md border border-input bg-background p-4">
        {notes.length > 0 ? (
          <ul className="list-inside list-disc space-y-2">
            {notes.map((note) => (
              <li
                key={note.note_id}
                className="text-sm cursor-pointer"
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