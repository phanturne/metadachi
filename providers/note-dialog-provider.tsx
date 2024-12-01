"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import NotesItemDialog from "@/components/notes/notes-item-dialog";

interface NoteDialogProvider {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const NoteDialogContext = createContext<NoteDialogProvider | undefined>(
  undefined,
);

export const NoteDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <NoteDialogContext.Provider value={{ open, setOpen }}>
      {children}
      <NotesItemDialog open={open} onOpenChange={setOpen} />
    </NoteDialogContext.Provider>
  );
};

export const useNoteDialog = () => {
  const context = useContext(NoteDialogContext);
  if (!context) {
    throw new Error(
      "useCommandMenuDialog must be used within a NoteDialogProvider",
    );
  }
  return context;
};
