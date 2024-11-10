import { useState } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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
import { useNoteDialog } from "@/providers/note-dialog-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { NotesService } from "@/lib/database/notes-service";
import { createClient } from "@/utils/supabase/client";
import { TablesInsert } from "@/supabase/types";
import { useSession } from "@/hooks/use-session"; // Import the NotesService

// const projects = ["Work", "Personal", "Side Hustle"];
// const areas = ["Health", "Finance", "Career", "Relationships"];

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "bg-secondary" : ""}
            >
              <span className="font-bold">B</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "bg-secondary" : ""}
            >
              <span className="italic">I</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "bg-secondary" : ""}
            >
              <span className="line-through">S</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Strikethrough</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="mx-1 h-6 w-px bg-border" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={
                editor.isActive("heading", { level: 1 }) ? "bg-secondary" : ""
              }
            >
              H1
            </Button>
          </TooltipTrigger>
          <TooltipContent>Heading 1</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={
                editor.isActive("heading", { level: 2 }) ? "bg-secondary" : ""
              }
            >
              H2
            </Button>
          </TooltipTrigger>
          <TooltipContent>Heading 2</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className={
                editor.isActive("heading", { level: 3 }) ? "bg-secondary" : ""
              }
            >
              H3
            </Button>
          </TooltipTrigger>
          <TooltipContent>Heading 3</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="mx-1 h-6 w-px bg-border" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "bg-secondary" : ""}
            >
              •
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bullet List</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "bg-secondary" : ""}
            >
              1.
            </Button>
          </TooltipTrigger>
          <TooltipContent>Numbered List</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default function CreateNoteDialog() {
  const { open, setOpen } = useNoteDialog();
  const supabase = createClient();
  const { session } = useSession();
  const notesService = new NotesService(supabase);

  // TODO: handle user.id is null

  const initialNoteState: TablesInsert<"notes"> = {
    area_id: null,
    content: {},
    name: "",
    project_id: null,
    resource_id: null,
    task_id: null,
    user_id: "",
  };

  const [note, setNote] = useState<TablesInsert<"notes">>(initialNoteState);
  // const [tagInput, setTagInput] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write your note here...",
      }),
    ],
    onUpdate: ({ editor }) => {
      setNote((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px]",
      },
    },
  });

  // const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter" && tagInput.trim() !== "") {
  //     setNote((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
  //     setTagInput("");
  //   }
  // };
  //
  // const handleRemoveTag = (tagToRemove: string) => {
  //   setNote((prev) => ({
  //     ...prev,
  //     tags: prev.tags.filter((tag) => tag !== tagToRemove),
  //   }));
  // };

  const handleSave = async () => {
    try {
      await notesService.insertNote({
        ...note,
        content: editor?.getJSON() ?? {},
        user_id: session?.user?.id ?? "",
      });
      onClose();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const onClose = () => {
    setOpen(false);
    setNote(initialNoteState);
    // setTagInput("");
    editor?.commands.clearContent();
  };

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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Note Title"
              value={note.name}
              onChange={(e) =>
                setNote((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          {/*<div className="space-y-2">*/}
          {/*  <Label htmlFor="tags">Tags</Label>*/}
          {/*  <div className="mb-2 flex flex-wrap gap-2">*/}
          {/*    {note.tags.map((tag) => (*/}
          {/*      <Badge key={tag} variant="secondary">*/}
          {/*        {tag}*/}
          {/*        <button*/}
          {/*          onClick={() => handleRemoveTag(tag)}*/}
          {/*          className="ml-1 hover:text-destructive"*/}
          {/*        >*/}
          {/*          ×*/}
          {/*        </button>*/}
          {/*      </Badge>*/}
          {/*    ))}*/}
          {/*  </div>*/}
          {/*  <div className="flex items-center">*/}
          {/*    <Hash className="mr-2 h-4 w-4" />*/}
          {/*    <Input*/}
          {/*      id="tags"*/}
          {/*      placeholder="Add tags..."*/}
          {/*      value={tagInput}*/}
          {/*      onChange={(e) => setTagInput(e.target.value)}*/}
          {/*      onKeyDown={handleAddTag}*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*</div>*/}
          {/*<div className="grid grid-cols-2 gap-4">*/}
          {/*  <div className="space-y-2">*/}
          {/*    <Label htmlFor="project">Project</Label>*/}
          {/*    <Select*/}
          {/*      value={note.project}*/}
          {/*      onValueChange={(value) =>*/}
          {/*        setNote((prev) => ({ ...prev, project: value }))*/}
          {/*      }*/}
          {/*    >*/}
          {/*      <SelectTrigger>*/}
          {/*        <SelectValue placeholder="Select project" />*/}
          {/*      </SelectTrigger>*/}
          {/*      <SelectContent>*/}
          {/*        {projects.map((project) => (*/}
          {/*          <SelectItem key={project} value={project}>*/}
          {/*            {project}*/}
          {/*          </SelectItem>*/}
          {/*        ))}*/}
          {/*      </SelectContent>*/}
          {/*    </Select>*/}
          {/*  </div>*/}
          {/*  <div className="space-y-2">*/}
          {/*    <Label htmlFor="area">Area</Label>*/}
          {/*    <Select*/}
          {/*      value={note.area}*/}
          {/*      onValueChange={(value) =>*/}
          {/*        setNote((prev) => ({ ...prev, area: value }))*/}
          {/*      }*/}
          {/*    >*/}
          {/*      <SelectTrigger>*/}
          {/*        <SelectValue placeholder="Select area" />*/}
          {/*      </SelectTrigger>*/}
          {/*      <SelectContent>*/}
          {/*        {areas.map((area) => (*/}
          {/*          <SelectItem key={area} value={area}>*/}
          {/*            {area}*/}
          {/*          </SelectItem>*/}
          {/*        ))}*/}
          {/*      </SelectContent>*/}
          {/*    </Select>*/}
          {/*  </div>*/}
          {/*</div>*/}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <MenuBar editor={editor} />
            </div>
            <EditorContent
              editor={editor}
              className="relative min-h-[200px] rounded-md border border-input bg-background px-3 py-2"
            />
          </div>
          {/*<div className="flex items-center space-x-2">*/}
          {/*  <Switch*/}
          {/*    id="archive"*/}
          {/*    checked={note.is_archived}*/}
          {/*    onCheckedChange={(checked) =>*/}
          {/*      setNote((prev) => ({ ...prev, isArchived: checked }))*/}
          {/*    }*/}
          {/*  />*/}
          {/*  <Label htmlFor="archive">Archive</Label>*/}
          {/*</div>*/}
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
