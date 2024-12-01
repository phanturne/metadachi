import { toast } from "sonner";
import { UpdateNoteParams } from "@/lib/database/notes-service";
import { useCallback } from "react";
import { useCreateNote, useUpdateNote } from "@/hooks/use-notes-service";
import debounce from "lodash/debounce";

interface UseSaveNoteParams {
  setIsSaving: (isSaving: boolean) => void;
  setLastSavedAt: (date: Date | null) => void;
  setIsDirty: (isDirty: boolean) => void;
}

export const useSaveNote = ({
  setIsSaving,
  setLastSavedAt,
  setIsDirty,
}: UseSaveNoteParams) => {
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();

  const saveNote = async (data: UpdateNoteParams) => {
    try {
      setIsSaving(true);
      if (data.note_id) {
        await updateNoteMutation.mutateAsync(data);
      } else {
        const newNoteId = await createNoteMutation.mutateAsync(data);
        data.note_id = newNoteId;
      }
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
  const debouncedSaveNote = useCallback(
    debounce(async (data: UpdateNoteParams) => {
      await saveNote(data);
    }, 1000),
    [saveNote],
  );

  return { saveNote, debouncedSaveNote };
};
