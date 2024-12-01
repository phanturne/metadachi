import {
  FolderOpenDot,
  Inbox,
  ListChecks,
  Plus,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const InboxComponent = () => (
  <div className="flex h-full flex-col">
    <h2 className="mb-4 flex items-center text-sm text-gray-400">
      <Inbox className="mr-2 h-4 w-4" />
      Inbox
    </h2>
    <div className="flex-grow overflow-y-auto rounded-xl bg-card p-6 shadow-md">
      <div className="space-y-4">
        <div className="flex items-center space-x-4 text-gray-400">
          <div className="flex items-center gap-2">
            <StickyNote className="ml-2 h-4 w-4" />
            <span>Notes</span>
          </div>
          <div className="flex items-center gap-2">
            <ListChecks className="ml-2 h-4 w-4" />
            <span>Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderOpenDot className="ml-2 h-4 w-4" />
            <span>Projects</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StickyNote className="h-4 w-4" />
            <span>Second Brain PARA-Thiago Forte</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-gray-600 px-2 py-1 text-xs">Inbox</span>
            <span className="rounded bg-orange-600 px-2 py-1 text-xs">
              Video
            </span>
            <span className="text-xs text-gray-400">Productivity</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StickyNote className="h-4 w-4" />
            <span>How to Invest for Beginners</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-gray-600 px-2 py-1 text-xs">Inbox</span>
            <span className="rounded bg-orange-600 px-2 py-1 text-xs">
              Video
            </span>
            <span className="text-xs text-gray-400">Investment</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-gray-400">
          <Plus className="mr-2 h-4 w-4" />
          New resource
        </Button>
      </div>
    </div>
  </div>
);
