import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDeleteNote, useGetNoteSummary } from "@/hooks/use-notes-service";
import { toast } from "sonner";
import { NoteEditor } from "./editor";
import { UpdateNoteParams, NoteStatus } from "@/lib/database/notes-service";
import { useSaveNote } from "@/hooks/use-save-note";
import { JSONContent } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotesItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId?: string;
  defaultStatus?: NoteStatus;
}

export default function NotesItemDialog({
  open,
  onOpenChange,
  noteId,
  defaultStatus = "active",
}: NotesItemDialogProps) {
  const deleteNoteMutation = useDeleteNote();
  const { data: noteData } = useGetNoteSummary(noteId ?? "");
  const isEditing = !!noteId;

  const existingNote = noteData?.[0];

  const initialNoteState: UpdateNoteParams = {
    note_id: noteId ?? "",
    name: "",
    content: {},
    status: defaultStatus,
  };

  const [note, setNote] = useState<UpdateNoteParams>(initialNoteState);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

  const { debouncedSaveNote } = useSaveNote({
    setIsSaving,
    setLastSavedAt,
    setIsDirty,
  });

  useEffect(() => {
    if (open) {
      if (existingNote) {
        setNote({
          note_id: existingNote.note_id,
          name: existingNote.name,
          content: existingNote.content,
          status: existingNote.status as NoteStatus,
        });
      }
    }
  }, [open, existingNote]);

  const saveNote = async (data: UpdateNoteParams) => {
    try {
      setIsSaving(true);
      await debouncedSaveNote(data);
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
    debounce(async (data: UpdateNoteParams) => {
      await saveNote(data);
    }, 1000),
    [],
  );

  const handleChange =
    (field: keyof UpdateNoteParams) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const newValue = e.target.value;
      const newNote = { ...note, [field]: newValue };

      setNote(newNote);

      if (newValue !== note[field]) {
        setIsDirty(true);
        debouncedSave.cancel();
        debouncedSave(newNote);
      }
    };

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const newNote = { ...note, name: newValue };

    setNote(newNote);

    if (newValue !== note.name) {
      setIsDirty(true);
      debouncedSave.cancel();
      debouncedSave(newNote);
    }
  };

  const handleContentChange = (newContent: string | JSONContent) => {
    const newNote = { ...note, content: newContent };
    setNote(newNote);
    setIsDirty(true);
    debouncedSave.cancel();
    debouncedSave(newNote);
  };

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedChanges(true);
    } else {
      onOpenChange(false);
      setNote(initialNoteState);
      setIsDirty(false);
      setIsSaving(false);
      setLastSavedAt(null);
      setConfirmDelete(false);
      setShowUnsavedChanges(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNoteMutation.mutateAsync(noteId!);
      setConfirmDelete(false);
      onOpenChange(false);
      toast.success("Note deleted");
    } catch (error) {
      toast.error("Failed to delete note");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Create"} Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">Title</Label>
            <Input
              id="name"
              value={note.name}
              onChange={handleNoteChange}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={note.status}
              onValueChange={(value) =>
                handleChange("status")({
                  target: { value } as unknown as HTMLSelectElement,
                } as React.ChangeEvent<HTMLSelectElement>)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Inbox</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <NoteEditor
              content={note.content as string}
              onUpdate={handleContentChange}
            />
          </div>
        </div>
        <DialogFooter className="flex items-center !justify-between">
          <div>
            {note.note_id && (
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this note?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnsavedChanges} onOpenChange={setShowUnsavedChanges}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
          </DialogHeader>
          <p>You have unsaved changes. Do you want to discard them?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnsavedChanges(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowUnsavedChanges(false);
                setIsDirty(false);
                onOpenChange(false);
              }}
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
