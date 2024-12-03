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
        className="m-1 transform cursor-pointer bg-nested-card-background transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
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
