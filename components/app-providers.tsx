"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { SearchDialogProvider } from "@/providers/search-dialog-provider";
import { NoteDialogProvider } from "@/providers/note-dialog-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SearchDialogProvider>
          <NoteDialogProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </NoteDialogProvider>
        </SearchDialogProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
