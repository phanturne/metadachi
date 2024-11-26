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
  useCreateResource,
  useUpdateResource,
  useGetResource,
  useDeleteResource,
} from "@/hooks/use-resources-service";
import { UpdateResourceParams } from "@/lib/database/resources-service";
import { toast } from "sonner";

interface ResourceItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId?: string;
}

export default function ResourceItemDialog({
  open,
  onOpenChange,
  resourceId,
}: ResourceItemDialogProps) {
  const createResourceMutation = useCreateResource();
  const updateResourceMutation = useUpdateResource();
  const deleteResourceMutation = useDeleteResource();
  const { data: existingResource, isLoading: isLoadingResource } =
    useGetResource(resourceId ?? "");
  const isEditing = !!resourceId;

  // Form state
  const [resource, setResource] = useState<UpdateResourceParams>({
    resource_id: resourceId ?? "",
    name: "",
    description: "",
    tags: [],
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

  // Load existing resource data
  useEffect(() => {
    if (existingResource) {
      setResource({
        resource_id: existingResource.resource_id,
        name: existingResource.name,
        description: existingResource.description ?? "",
      });
    }
  }, [existingResource]);

  // Auto-save implementation
  const saveResource = async (data: UpdateResourceParams) => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await updateResourceMutation.mutateAsync(data);
      } else {
        await createResourceMutation.mutateAsync(data);
      }
      setLastSavedAt(new Date());
      setIsDirty(false);
      toast.success(isEditing ? "Resource updated" : "Resource created");
    } catch (error) {
      toast.error("Failed to save resource");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedSave = useCallback(
    debounce(async (data: UpdateResourceParams) => {
      await saveResource(data);
    }, 1000),
    [],
  );

  // Handle form changes
  const handleChange =
    (field: keyof UpdateResourceParams) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newResource = { ...resource, [field]: e.target.value };
      setResource(newResource);
      setIsDirty(true);
      debouncedSave(newResource);
    };

  // Handle close
  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedChanges(true);
    } else {
      onOpenChange(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteResourceMutation.mutateAsync(resourceId!);
      setConfirmDelete(false);
      onOpenChange(false);
      toast.success("Resource deleted");
    } catch (error) {
      toast.error("Failed to delete resource");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Create"} Resource</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={resource.name}
              onChange={handleChange("name")}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={resource.description}
              onChange={handleChange("description")}
              className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Enter a description..."
            />
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between">
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
            {isEditing && (
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this resource?</p>
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

      {/* Unsaved Changes Dialog */}
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
