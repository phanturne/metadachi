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
import { motion } from "framer-motion";
import { useCreateResource } from "@/hooks/use-resources-service";
import { InsertResourceParams } from "@/lib/database/resources-service";
import { toast } from "sonner";

export default function CreateResourceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createResourceMutation = useCreateResource();

  const initialResourceState: InsertResourceParams = {
    name: "",
    description: "",
    tags: [],
  };

  const [resource, setResource] =
    useState<InsertResourceParams>(initialResourceState);

  const handleSave = async () => {
    try {
      if (!resource.name.trim()) {
        toast.error("Resource name is required");
        return;
      }

      await createResourceMutation.mutateAsync(resource);
      toast.success("Resource created successfully!");
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to save resource: " + error.message);
      } else {
        toast.error("Failed to save resource: An unknown error occurred");
      }
    }
  };

  const onClose = () => {
    onOpenChange(false);
    setResource(initialResourceState);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Resource</DialogTitle>
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
              className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
        </motion.div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Create Resource</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
