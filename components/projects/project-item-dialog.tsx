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
  useCreateProject,
  useUpdateProject,
  useGetProjectSummary,
  useDeleteProject,
} from "@/hooks/use-projects-service";
import { UpdateProjectParams } from "@/lib/database/projects-service";
import { toast } from "sonner";
import { Note } from "@/lib/database/notes-service";
import RelatedNotes from "../resources/related-notes";
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

interface ProjectItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  defaultStatus?: string;
}

export default function ProjectItemDialog({
  open,
  onOpenChange,
  projectId,
  defaultStatus = "active",
}: ProjectItemDialogProps) {
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const { data: projectSummary } = useGetProjectSummary(projectId ?? "");
  const isEditing = !!projectId;

  // Get the first item from the summary array
  const existingProject = projectSummary?.[0];

  // Form state
  const [project, setProject] = useState<UpdateProjectParams>({
    project_id: projectId ?? "",
    name: "",
    description: "",
    status: defaultStatus,
    priority: 0,
    due_date: undefined,
    tags: [],
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

  // Load existing project data when dialog is opened
  useEffect(() => {
    if (open) {
      if (existingProject) {
        setProject({
          project_id: existingProject.project_id,
          name: existingProject.name,
          description: existingProject.description ?? "",
          status: existingProject.status,
          priority: existingProject.priority ?? 0,
          due_date: existingProject.due_date ?? undefined,
          tags: existingProject.tags ?? [],
        });
      } else {
        setProject((prev) => ({
          ...prev,
          status: defaultStatus,
        }));
      }
    }
  }, [open, existingProject, defaultStatus]);

  // Auto-save implementation
  const saveProject = async (data: UpdateProjectParams) => {
    try {
      setIsSaving(true);
      if (data.project_id) {
        await updateProjectMutation.mutateAsync(data);
      } else {
        const newProjectId = await createProjectMutation.mutateAsync(data);
        // Update local state with the new ID
        setProject((prev) => ({
          ...prev,
          project_id: newProjectId,
        }));
      }
      setLastSavedAt(new Date());
      setIsDirty(false);
    } catch (error) {
      toast.error("Failed to save project");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (data: UpdateProjectParams) => {
      await saveProject(data);
    }, 1000),
    [],
  );

  // Handle form changes with smarter save triggering
  const handleChange =
    (field: keyof UpdateProjectParams) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const newProject = { ...project, [field]: newValue };

      // Always update local state immediately
      setProject(newProject);

      // Only mark as dirty if value actually changed
      if (newValue !== project[field]) {
        setIsDirty(true);

        // Cancel any pending saves
        debouncedSave.cancel();

        // Schedule new save
        debouncedSave(newProject);
      }
    };

  // Handle select changes
  const handleSelectChange = (
    field: keyof UpdateProjectParams,
    value: string | number,
  ) => {
    const newProject = { ...project, [field]: value };

    // Always update local state immediately
    setProject(newProject);

    // Only mark as dirty if value actually changed
    if (value !== project[field]) {
      setIsDirty(true);

      // Cancel any pending saves
      debouncedSave.cancel();

      // Schedule new save
      debouncedSave(newProject);
    }
  };

  // Handle close
  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedChanges(true);
    } else {
      onOpenChange(false);
      setProject({
        project_id: projectId ?? "",
        name: "",
        description: "",
        status: defaultStatus,
        priority: 0,
        due_date: undefined,
        tags: [],
      });
      setIsDirty(false);
      setIsSaving(false);
      setLastSavedAt(null);
      setConfirmDelete(false);
      setShowUnsavedChanges(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(projectId!);
      setConfirmDelete(false);
      onOpenChange(false);
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Create"} Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={project.name}
              onChange={handleChange("name")}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={project.description}
              onChange={handleChange("description")}
              className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2"
              placeholder="Enter a description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={project.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "active",
                    "completed",
                    "incubating",
                    "archived",
                    "on hold",
                    "dropped",
                  ].map((status) => (
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
                  handleSelectChange("priority", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: 0, label: "No Priority" },
                    { value: 1, label: "Low" },
                    { value: 2, label: "Medium" },
                    { value: 3, label: "High" },
                  ].map((priority) => (
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
                    handleSelectChange("due_date", date?.toISOString() || "")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Add related notes section */}
          {existingProject?.related_notes && (
            <RelatedNotes
              relatedNotes={existingProject.related_notes as Note[]}
            />
          )}
        </div>
        <DialogFooter className="flex items-center !justify-between">
          <div>
            {project.project_id && (
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this project?</p>
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
