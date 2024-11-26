import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useCreateArea } from "@/hooks/use-areas-service";
import { InsertAreaParams } from "@/lib/database/areas-service";
import { toast } from "sonner";

export default function CreateAreaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createAreaMutation = useCreateArea();

  const initialAreaState: InsertAreaParams = {
    name: "",
    description: "",
    tags: [],
  };

  const [area, setArea] = useState<InsertAreaParams>(initialAreaState);

  const handleSave = async () => {
    try {
      await createAreaMutation.mutateAsync(area);
      toast.success("Area created successfully!");
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to create area: " + error.message);
      } else {
        toast.error("Failed to create area");
      }
    }
  };

  const onClose = () => {
    onOpenChange(false);
    setArea(initialAreaState);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Area</DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Area Name</Label>
              <Input
                id="name"
                placeholder="Enter area name"
                value={area.name}
                onChange={(e) =>
                  setArea((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Write area description here..."
                value={area?.description ?? ""}
                onChange={(e) =>
                  setArea((prev) => ({ ...prev, description: e.target.value }))
                }
                className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </motion.div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Create Area</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
