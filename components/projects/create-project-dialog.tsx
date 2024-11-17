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
import { TablesInsert } from "@/supabase/types";
import { useSession } from "@/hooks/use-session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useCreateProject } from "@/hooks/use-projects-service";

const STATUS_OPTIONS = [
  "active",
  "completed",
  "incubating",
  "archived",
  "on hold",
  "dropped",
];

const PRIORITY_OPTIONS = [
  { value: 0, label: "No Priority" },
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
];

export default function CreateProjectDialog({
  open,
  onOpenChange,
  parentProjectId = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentProjectId?: string | null;
}) {
  const { session } = useSession();
  const createProjectMutation = useCreateProject();

  const initialProjectState: TablesInsert<"projects"> = {
    user_id: session?.user?.id ?? "",
    parent_project_id: parentProjectId,
    name: "",
    description: "",
    status: "active",
    is_archived: false,
    priority: 0,
    due_date: null,
  };

  const [project, setProject] =
    useState<TablesInsert<"projects">>(initialProjectState);

  const handleSave = async () => {
    try {
      await createProjectMutation.mutateAsync({
        ...project,
        user_id: session?.user?.id ?? "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to save project:", error);
    }
  };

  const onClose = () => {
    onOpenChange(false);
    setProject(initialProjectState);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="Enter project name"
              value={project.name}
              onChange={(e) =>
                setProject((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={project.status}
                onValueChange={(value) =>
                  setProject((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={project.priority?.toString()}
                onValueChange={(value) =>
                  setProject((prev) => ({ ...prev, priority: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem
                      key={priority.value}
                      value={priority.value.toString()}
                    >
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {project.due_date ? (
                    format(new Date(project.due_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    project.due_date ? new Date(project.due_date) : undefined
                  }
                  onSelect={(date) =>
                    setProject((prev) => ({
                      ...prev,
                      due_date: date?.toISOString(),
                    }))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Write project description here..."
              value={project?.description ?? ""}
              onChange={(e) =>
                setProject((prev) => ({ ...prev, description: e.target.value }))
              }
              className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
        </motion.div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
