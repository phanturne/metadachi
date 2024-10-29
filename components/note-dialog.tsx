import { useState } from "react";
import { Bold, Hash, Italic, Link, List, ListOrdered } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useNoteDialog } from "@/providers/note-dialog-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NoteData {
  title: string;
  content: string;
  tags: string[];
  project: string;
  area: string;
  isArchived: boolean;
  dueDate?: Date;
}

const projects = ["Work", "Personal", "Side Hustle"];
const areas = ["Health", "Finance", "Career", "Relationships"];

export default function NoteDialog() {
  const { open, setOpen } = useNoteDialog();

  const [note, setNote] = useState<NoteData>({
    title: "",
    content: "",
    tags: [],
    project: "",
    area: "",
    isArchived: false,
  });
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      setNote((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNote((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = () => {
    onClose();
  };

  const onClose = () => setOpen(false);

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
            <Label
              htmlFor="title"
              className="text-sm font-medium text-zinc-400"
            >
              Title
            </Label>
            <Input
              id="title"
              placeholder="Note Title"
              value={note.title}
              onChange={(e) =>
                setNote((prev) => ({ ...prev, title: e.target.value }))
              }
              className="border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-zinc-400">
              Tags
            </Label>
            <div className="mb-2 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-zinc-700 text-zinc-200"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-zinc-400 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center">
              <Hash className="mr-2 h-4 w-4 text-zinc-500" />
              <Input
                id="tags"
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="project"
                className="text-sm font-medium text-zinc-400"
              >
                Project
              </Label>
              <Select
                value={note.project}
                onValueChange={(value) =>
                  setNote((prev) => ({ ...prev, project: value }))
                }
              >
                <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-800">
                  {projects.map((project) => (
                    <SelectItem
                      key={project}
                      value={project}
                      className="text-white"
                    >
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="area"
                className="text-sm font-medium text-zinc-400"
              >
                Area
              </Label>
              <Select
                value={note.area}
                onValueChange={(value) =>
                  setNote((prev) => ({ ...prev, area: value }))
                }
              >
                <SelectTrigger className="border-zinc-700 bg-zinc-800 text-white">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-800">
                  {areas.map((area) => (
                    <SelectItem key={area} value={area} className="text-white">
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="content"
                className="text-sm font-medium text-zinc-400"
              >
                Content
              </Label>
              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bold</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Italic</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bullet List</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Numbered List</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Insert Link</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Textarea
              id="content"
              placeholder="Write your note here..."
              value={note.content}
              onChange={(e) =>
                setNote((prev) => ({ ...prev, content: e.target.value }))
              }
              className="min-h-[200px] border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="archive"
              checked={note.isArchived}
              onCheckedChange={(checked) =>
                setNote((prev) => ({ ...prev, isArchived: checked }))
              }
            />
            <Label
              htmlFor="archive"
              className="text-sm font-medium text-zinc-400"
            >
              Archive
            </Label>
          </div>
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
