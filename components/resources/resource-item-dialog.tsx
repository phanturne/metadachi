import { useEffect, useState } from "react";
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
import { motion } from "framer-motion";
import { TablesUpdate } from "@/supabase/types";
import { useSession } from "@/hooks/use-session";
import {
  useDeleteResource,
  useGetResource,
  useUpdateResource,
} from "@/hooks/use-resources-service";
import { toast } from "sonner";

export default function ResourceItemDialog({
  open,
  onOpenChange,
  resourceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId: string;
}) {
  const { session } = useSession();
  const updateResourceMutation = useUpdateResource();
  const deleteResourceMutation = useDeleteResource();
  const { data: resourceData, isLoading } = useGetResource(resourceId);

  const initialResourceState: TablesUpdate<"resources"> = {
    user_id: session?.user?.id ?? "",
    name: "",
    description: "",
    is_archived: false,
  };

  const [resource, setResource] =
    useState<TablesUpdate<"resources">>(initialResourceState);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (resourceData) {
      setResource(resourceData);
    }
  }, [resourceData]);

  const handleSave = async () => {
    try {
      if (!resource.name?.trim()) {
        toast.error("Resource name is required");
        return;
      }

      await updateResourceMutation.mutateAsync({
        resourceId,
        updates: resource,
      });
      toast.success("Resource updated successfully!");
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to update resource: " + error.message);
      } else {
        toast.error("Failed to update resource: An unknown error occurred");
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteResourceMutation.mutateAsync(resourceId);
      toast.success("Resource deleted successfully!");
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to delete resource: " + error.message);
      } else {
        toast.error("Failed to delete resource: An unknown error occurred");
      }
    }
  };

  const onClose = () => {
    onOpenChange(false);
    setResource(initialResourceState);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Resource Name</Label>
            <Input
              id="name"
              placeholder="Enter resource name"
              maxLength={100}
              value={resource.name}
              onChange={(e) =>
                setResource((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Write resource description here..."
              value={resource?.description ?? ""}
              onChange={(e) =>
                setResource((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-[50px] w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
        </motion.div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
            className="mt-3 sm:mt-0"
          >
            Delete
          </Button>
          <div className="flex flex-col-reverse sm:flex-row sm:space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="mt-3 sm:mt-0"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!resource.name?.trim()}>
              Update Resource
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
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
    </Dialog>
  );
}
