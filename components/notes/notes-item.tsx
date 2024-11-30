import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import NotesItemDialog from "./notes-item-dialog";
import { Note } from "@/lib/database/notes-service";

interface NotesItemProps {
  note: Partial<Note>;
}

export default function NotesItem({ note }: NotesItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="transform cursor-pointer bg-nested-card-background transition-transform hover:scale-105"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span>{note.name}</span>
            <FileText className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
      <NotesItemDialog open={open} onOpenChange={setOpen} noteId={note.note_id} />
    </>
  );
}
