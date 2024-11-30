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
import {
  useCreateArea,
  useUpdateArea,
  useGetAreaSummary,
  useDeleteArea,
} from "@/hooks/use-areas-service";
import { UpdateAreaParams } from "@/lib/database/areas-service";
import { toast } from "sonner";
import { Note } from "@/lib/database/notes-service";
import RelatedNotes from "../resources/related-notes";

interface AreasItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaId?: string;
}

export default function AreasItemDialog({
  open,
  onOpenChange,
  areaId,
}: AreasItemDialogProps) {
  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();
  const deleteAreaMutation = useDeleteArea();
  const { data: areaSummary } = useGetAreaSummary(areaId ?? "");
  const isEditing = !!areaId;

  const existingArea = areaSummary?.[0];

  const [area, setArea] = useState<UpdateAreaParams>({
    area_id: areaId ?? "",
    name: "",
    description: "",
    tags: [],
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

  useEffect(() => {
    if (open) {
      if (existingArea) {
        setArea({
          area_id: existingArea.area_id,
          name: existingArea.name,
          description: existingArea.description ?? "",
          tags: existingArea.tags ?? [],
        });
      }
    }
  }, [open, existingArea]);

  const saveArea = async (data: UpdateAreaParams) => {
    try {
      setIsSaving(true);
      if (data.area_id) {
        await updateAreaMutation.mutateAsync(data);
      } else {
        const newAreaId = await createAreaMutation.mutateAsync(data);
        setArea((prev) => ({
          ...prev,
          area_id: newAreaId,
        }));
      }
      setLastSavedAt(new Date());
      setIsDirty(false);
    } catch (error) {
      toast.error("Failed to save area");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (data: UpdateAreaParams) => {
      await saveArea(data);
    }, 1000),
    [],
  );

  const handleChange =
    (field: keyof UpdateAreaParams) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const newArea = { ...area, [field]: newValue };

      setArea(newArea);

      if (newValue !== area[field]) {
        setIsDirty(true);
        debouncedSave.cancel();
        debouncedSave(newArea);
      }
    };

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedChanges(true);
    } else {
      onOpenChange(false);
      setArea({
        area_id: areaId ?? "",
        name: "",
        description: "",
        tags: [],
      });
      setIsDirty(false);
      setIsSaving(false);
      setLastSavedAt(null);
      setConfirmDelete(false);
      setShowUnsavedChanges(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAreaMutation.mutateAsync(areaId!);
      setConfirmDelete(false);
      onOpenChange(false);
      toast.success("Area deleted");
    } catch (error) {
      toast.error("Failed to delete area");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Create"} Area</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={area.name}
              onChange={handleChange("name")}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={area.description}
              onChange={handleChange("description")}
              className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Enter a description..."
            />
          </div>
          {existingArea?.related_notes && (
            <RelatedNotes relatedNotes={existingArea.related_notes as Note[]} />
          )}
        </div>
        <DialogFooter className="flex items-center !justify-between">
          <div>
            {area.area_id && (
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
          <p>Are you sure you want to delete this area?</p>
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
