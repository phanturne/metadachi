import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNoteDialog } from "@/providers/note-dialog-provider";
import { motion } from "framer-motion";
import { TablesInsert } from "@/supabase/types";
import { useSession } from "@/hooks/use-session";
import { useCreateNote } from "@/hooks/use-notes-service";
import { NoteEditor } from "./editor";

export default function CreateNoteDialog() {
  const { open, setOpen } = useNoteDialog();
  const { session } = useSession();
  const createNoteMutation = useCreateNote();

  const initialNoteState: TablesInsert<"notes"> = {
    area_id: null,
    content: {},
    name: "",
    project_id: null,
    resource_id: null,
    task_id: null,
    user_id: "",
  };

  const [note, setNote] = useState<TablesInsert<"notes">>(initialNoteState);

  const handleSave = async () => {
    try {
      await createNoteMutation.mutateAsync({
        ...note,
        content: note.content,
        user_id: session?.user?.id ?? "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const onClose = () => {
    setOpen(false);
    setNote(initialNoteState);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Note Title"
              value={note.name}
              onChange={(e) =>
                setNote((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <NoteEditor
            content={note.content as string}
            onUpdate={(content) => setNote((prev) => ({ ...prev, content }))}
          />
        </motion.div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Note</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
