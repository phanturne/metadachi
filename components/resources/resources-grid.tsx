import { Bookmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import CreateResourceDialog from "@/components/resources/create-resource-dialog";

export function ResourcesGrid() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex h-full flex-col">
        <h2 className="mb-4 flex items-center text-sm text-gray-400">
          <Bookmark className="mr-2 h-4 w-4" />
          Resources
        </h2>
        <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[
            { name: "Second Brain PARA", category: "Productivity" },
            {
              name: "How to Invest for Beginners",
              category: "Investment",
            },
            { name: "Project Management Tips", category: "Work" },
            { name: "Healthy Living Guide", category: "Health" },
          ].map((resource, index) => (
            <div
              key={index}
              className="transform rounded-lg bg-card p-4 shadow-md transition-transform hover:scale-105"
            >
              <div className="mb-2 flex items-center justify-between">
                <span>{resource.name}</span>
                <Bookmark className="h-4 w-4" />
              </div>
              <div className="text-xs text-gray-400">{resource.category}</div>
            </div>
          ))}
          <Button
            variant="ghost"
            className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 transition-transform hover:scale-105"
            onClick={() => setOpen(true)}
          >
            <Plus className="mb-2 h-6 w-6 text-gray-400 transition-transform hover:scale-110" />
            <span className="text-gray-400">New resource</span>
          </Button>
        </div>
      </div>
      <CreateResourceDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
