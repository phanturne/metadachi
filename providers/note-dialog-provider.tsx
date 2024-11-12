"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import CreateNoteDialog from "@/components/notes/create-note-dialog";

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
      <CreateNoteDialog />
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
