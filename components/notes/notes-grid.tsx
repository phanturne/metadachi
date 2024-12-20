"use client";

import { FileText, Plus, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import NotesItem from "@/components/notes/notes-item";
import { useGetUserNotes } from "@/hooks/use-notes-service";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import NotesItemDialog from "./notes-item-dialog";
import { useAuth } from "@/hooks/use-auth";

export function NotesGrid() {
  const [open, setOpen] = React.useState(false);
  const { userId, isLoading: isLoadingSession } = useAuth();

  const { data: userNotes, isLoading, error } = useGetUserNotes(userId || "");

  if (isLoadingSession || isLoading) {
    return (
      <Card className="flex h-[50vh] items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Loading notes...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-[50vh] items-center justify-center bg-destructive/5">
        <CardContent className="p-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-xl text-destructive">
            Error loading notes
          </CardTitle>
          <p className="mt-2 text-destructive-foreground">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <h2 className="mb-4 flex items-center text-sm text-gray-400">
          <FileText className="mr-2 h-4 w-4" />
          Notes
        </h2>
        <div className="-m-1 grid max-h-40 flex-grow grid-cols-1 gap-2 overflow-y-auto md:grid-cols-3 lg:grid-cols-4">
          {userNotes?.map((note) => (
            <NotesItem key={note.note_id} note={note} />
          ))}
          <Button
            variant="ghost"
            className="m-1 flex h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-600 transition-all duration-200 hover:scale-[1.02]"
            onClick={() => setOpen(true)}
          >
            <Plus className="mb-2 h-6 w-6 text-gray-400" />
            <span className="text-gray-400">New note</span>
          </Button>
        </div>
      </div>
      <NotesItemDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
