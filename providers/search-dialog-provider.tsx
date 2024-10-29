"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import SearchDialog from "@/components/search-dialog";

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
      <SearchDialog />
    </SearchDialogContext.Provider>
  );
};

export const useSearchDialog = () => {
  const context = useContext(SearchDialogContext);
  if (!context) {
    throw new Error(
      "useCommandMenuDialog must be used within a SearchDialogProvider",
    );
  }
  return context;
};
