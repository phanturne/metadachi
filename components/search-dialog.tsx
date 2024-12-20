"use client";

import * as React from "react";
import {
  Archive,
  ArrowUpDown,
  BarChart2,
  Book,
  FileText,
  FolderGit2,
  Map,
  MessageSquare,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetUserProjects } from "@/hooks/use-projects-service";
import { useGetUserAreas } from "@/hooks/use-areas-service";
import { useGetUserResources } from "@/hooks/use-resources-service";
import { useGetUserNotes } from "@/hooks/use-notes-service";
import { useAuth } from "@/hooks/use-auth";
import dynamic from "next/dynamic";

const NotesItemDialog = dynamic(
  () => import("@/components/notes/notes-item-dialog"),
);
const AreasItemDialog = dynamic(
  () => import("@/components/areas/areas-item-dialog"),
);
const ProjectItemDialog = dynamic(
  () => import("@/components/projects/project-item-dialog"),
);
const ResourceItemDialog = dynamic(
  () => import("@/components/resources/resource-item-dialog"),
);

const categories = [
  { label: "All", value: "all", icon: BarChart2 },
  { label: "Notes", value: "notes", icon: FileText },
  { label: "AI Chats", value: "ai-chats", icon: MessageSquare },
  { label: "Projects", value: "projects", icon: FolderGit2 },
  { label: "Areas", value: "areas", icon: Map },
  { label: "Resources", value: "resources", icon: Book },
  { label: "Archive", value: "archive", icon: Archive },
];

interface Item {
  id: string;
  name: string;
  category: string;
  status?: string;
  date?: string;
  type?: string;
  archivedDate?: string;
  isNew?: boolean;
}

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function SearchDialog({ open, setOpen }: SearchDialogProps) {
  const { userId, isLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortDirection, setSortDirection] = React.useState("asc");
  const [items, setItems] = React.useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);

  const { data: projects } = useGetUserProjects(userId);
  const { data: areas } = useGetUserAreas(userId);
  const { data: resources } = useGetUserResources(userId);
  const { data: notes } = useGetUserNotes(userId);

  React.useEffect(() => {
    if (projects && areas && resources && notes) {
      const formattedItems: Item[] = [
        ...projects.map((project) => ({
          id: project.project_id,
          name: project.name,
          category: "projects",
          status: project.status,
        })),
        ...areas.map((area) => ({
          id: area.area_id,
          name: area.name,
          category: "areas",
        })),
        ...resources.map((resource) => ({
          id: resource.resource_id,
          name: resource.name,
          category: "resources",
        })),
        ...notes.map((note) => ({
          id: note.note_id,
          name: note.name,
          category: "notes",
          date: note.created_at,
        })),
      ];

      setItems(formattedItems);
    }
  }, [projects, areas, resources, notes]);

  const clearSearchQuery = () => {
    setSearchQuery("");
  };

  const handleClose = () => {
    setOpen(false);
    clearSearchQuery();
  };

  const handleItemClick = (item: Item) => {
    console.log("item clicked:", item);
    setSelectedItem(item);
  };

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortDirection === "asc") {
        return a.name.localeCompare(b.name);
      }
      return b.name.localeCompare(a.name);
    });

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={handleClose}
        className="max-h-[600px] max-w-[800px]"
        hideCloseButton={true}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <span>Loading...</span>
          </div>
        ) : (
          <>
            <CommandInput
              placeholder="Search anything..."
              className="h-14 text-base placeholder:text-muted-foreground/70"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <div className="border-b border-border/80 px-3 py-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer text-sm transition-all hover:scale-105"
                  onClick={() =>
                    setSortDirection((prev) =>
                      prev === "asc" ? "desc" : "asc",
                    )
                  }
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {sortDirection === "asc" ? "Sort A-Z" : "Sort Z-A"}
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.value}
                    variant={
                      selectedCategory === category.value
                        ? "default"
                        : "secondary"
                    }
                    className={cn(
                      "cursor-pointer text-sm transition-all hover:scale-105",
                      selectedCategory === category.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80",
                    )}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    <category.icon className="mr-1 h-3 w-3" />
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex h-[450px]">
              <div className="flex-1">
                <ScrollArea className="h-full p-4">
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup className="h-full">
                      <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            className="group cursor-pointer rounded-lg border border-border/50 bg-card px-4 py-3 text-left shadow-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md"
                            onSelect={() => handleItemClick(item)}
                          >
                            <div className="flex w-full flex-col space-y-2">
                              <div className="flex items-start justify-between">
                                <span className="text-sm font-medium leading-none">
                                  {item.name}
                                </span>
                                {item.isNew && (
                                  <span className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
                                    New
                                  </span>
                                )}
                              </div>
                              {(item.status ||
                                item.date ||
                                item.type ||
                                item.archivedDate) && (
                                <div className="text-xs text-muted-foreground">
                                  {item.status && (
                                    <div className="flex items-center gap-1">
                                      <span
                                        className={cn(
                                          "h-1.5 w-1.5 rounded-full",
                                          item.status === "Completed"
                                            ? "bg-green-500"
                                            : item.status === "In Progress"
                                              ? "bg-blue-500"
                                              : "bg-yellow-500",
                                        )}
                                      />
                                      {item.status}
                                    </div>
                                  )}
                                  {item.date && <div>Created {item.date}</div>}
                                  {item.type && <div>Type: {item.type}</div>}
                                  {item.archivedDate && (
                                    <div>Archived {item.archivedDate}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </div>
                    </CommandGroup>
                  </CommandList>
                </ScrollArea>
              </div>
            </div>
          </>
        )}
      </CommandDialog>

      {selectedItem && selectedItem.category === "notes" && (
        <NotesItemDialog
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
          noteId={selectedItem.id}
        />
      )}
      {selectedItem && selectedItem.category === "areas" && (
        <AreasItemDialog
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
          areaId={selectedItem.id}
        />
      )}
      {selectedItem && selectedItem.category === "projects" && (
        <ProjectItemDialog
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
          projectId={selectedItem.id}
        />
      )}
      {selectedItem && selectedItem.category === "resources" && (
        <ResourceItemDialog
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) setSelectedItem(null);
          }}
          resourceId={selectedItem.id}
        />
      )}
    </>
  );
}
