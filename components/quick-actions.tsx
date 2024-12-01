"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import NotesItemDialog from "./notes/notes-item-dialog";
import { useState } from "react";

export const QuickActions = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 flex space-x-2">
      <Button
        size="icon"
        variant="outline"
        className="rounded-full border-gray-600 bg-card shadow-md"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <NotesItemDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};
