"use client";

import { FileText, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useGetUserNotes } from "@/hooks/use-notes-service";
import { useState } from "react";
import NotesItemDialog from "@/components/notes/notes-item-dialog";

interface NoteItemsProps {
  userId: string;
}

const NoteItems = ({ userId }: NoteItemsProps) => {
  const { data: notes } = useGetUserNotes(userId);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  return (
    <>
      <Collapsible asChild>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Notes">
            <a href="#">
              <FileText />
              <span>Notes</span>
            </a>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="data-[state=open]:rotate-90">
              <ChevronRight />
              <span className="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {notes?.map((note) => (
                <SidebarMenuSubItem key={note.note_id}>
                  <SidebarMenuSubButton
                    asChild
                    onClick={() => {
                      setSelectedNoteId(note.note_id);
                      setOpenNoteDialog(true);
                    }}
                  >
                    <a href="#">
                      <span className="truncate">{note.name}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
      {selectedNoteId && (
        <NotesItemDialog
          open={openNoteDialog}
          onOpenChange={setOpenNoteDialog}
          noteId={selectedNoteId}
        />
      )}
    </>
  );
};

export default NoteItems;
