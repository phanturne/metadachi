"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface SearchDialogProvider {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SearchDialogContext = createContext<SearchDialogProvider | undefined>(
  undefined,
);

export const SearchDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <SearchDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </SearchDialogContext.Provider>
  );
};

export const useSearchDialog = () => {
  const context = useContext(SearchDialogContext);
  if (!context) {
    throw new Error(
      "useCommandMenuDialog must be used within a CommandMenuDialogProvider",
    );
  }
  return context;
};
