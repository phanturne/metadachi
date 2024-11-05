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
import { useSearchDialog } from "@/providers/search-dialog-provider";

const categories = [
  { label: "All", value: "all", icon: BarChart2 },
  { label: "Notes", value: "notes", icon: FileText },
  { label: "AI Chats", value: "ai-chats", icon: MessageSquare },
  { label: "Projects", value: "projects", icon: FolderGit2 },
  { label: "Areas", value: "areas", icon: Map },
  { label: "Resources", value: "resources", icon: Book },
  { label: "Archive", value: "archive", icon: Archive },
];

const items = [
  // Notes
  {
    name: "Meeting Notes - Q4 Planning",
    category: "notes",
    date: "2024-10-15",
  },
  { name: "Product Research Summary", category: "notes", date: "2024-10-14" },
  { name: "Daily Standup Notes", category: "notes", date: "2024-10-13" },

  // AI Chats
  { name: "Code Review Assistant", category: "ai-chats", isNew: true },
  { name: "Writing Helper Chat", category: "ai-chats" },
  { name: "Data Analysis Bot", category: "ai-chats" },

  // Projects
  { name: "Website Redesign", category: "projects", status: "In Progress" },
  { name: "Mobile App Development", category: "projects", status: "Planning" },
  { name: "Marketing Campaign", category: "projects", status: "Completed" },

  // Areas
  { name: "Personal Development", category: "areas" },
  { name: "Health & Fitness", category: "areas" },
  { name: "Career Growth", category: "areas" },

  // Resources
  { name: "Design System Guide", category: "resources", type: "Document" },
  { name: "API Documentation", category: "resources", type: "Technical" },
  { name: "Brand Guidelines", category: "resources", type: "Style Guide" },

  // Archive
  {
    name: "Old Project Notes",
    category: "archive",
    archivedDate: "2024-09-01",
  },
  {
    name: "2023 Planning Docs",
    category: "archive",
    archivedDate: "2024-01-15",
  },
  { name: "Legacy Code Docs", category: "archive", archivedDate: "2023-12-20" },
];

export default function SearchDialog() {
  const { open, setOpen } = useSearchDialog();
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortDirection, setSortDirection] = React.useState("asc");

  const clearSearchQuery = () => {
    setSearchQuery("");
  };

  const handleClose = () => {
    setOpen(false);
    clearSearchQuery();
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
    <CommandDialog
      open={open}
      onOpenChange={handleClose}
      className="max-h-[600px] max-w-[800px]"
      hideCloseButton={true}
    >
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
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
            }
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortDirection === "asc" ? "Sort A-Z" : "Sort Z-A"}
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.value}
              variant={
                selectedCategory === category.value ? "default" : "secondary"
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
                      key={item.name}
                      className="group rounded-lg border border-border/50 bg-card px-4 py-3 text-left shadow-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md"
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
    </CommandDialog>
  );
}
