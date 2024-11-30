"use client";

import {
  Clock,
  FolderOpenDot,
  Inbox,
  ListChecks,
  Plus,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteDialog } from "@/providers/note-dialog-provider";
import { ProjectsBoard } from "@/components/projects/projects-board";
import { AreasGrid } from "@/components/areas/areas-grid";
import { ResourcesGrid } from "@/components/resources/resources-grid";
import { UpcomingEvents } from "@/components/tasks/upcoming-events";
import { UpcomingTasks } from "@/components/tasks/upcoming-tasks";

const RecentlyVisited = () => (
  <div className="flex h-full flex-col">
    <h2 className="mb-2 flex items-center text-sm text-gray-400">
      <Clock className="mr-2 h-4 w-4" />
      Recently visited
    </h2>
    <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {[
        "Home",
        "Resources",
        "Second Brain (1)",
        "New Note",
        "Notes",
        "Inbox",
      ].map((item, index) => (
        <div
          key={index}
          className="transform rounded-lg bg-card p-4 shadow-md transition-transform hover:scale-105"
        >
          <h3 className="mb-2 text-sm font-normal">{item}</h3>
          <p className="text-xs text-gray-400">
            K · {["1w", "3w", "3w", "1m", "1m", "3w"][index]} ago
          </p>
        </div>
      ))}
    </div>
  </div>
);

const InboxComponent = () => (
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

const Notes = () => (
  <div className="flex h-full flex-col">
    <h2 className="mb-4 flex items-center text-sm text-gray-400">
      <StickyNote className="mr-2 h-4 w-4" />
      Notes
    </h2>
    <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[
        { name: "Meeting Notes", date: "2024-05-22" },
        { name: "Project Ideas", date: "2024-05-21" },
        { name: "Daily Journal", date: "2024-05-20" },
        { name: "Research Notes", date: "2024-05-19" },
      ].map((note, index) => (
        <div
          key={index}
          className="transform rounded-lg bg-card p-4 shadow-md transition-transform hover:scale-105"
        >
          <div className="mb-2 flex items-center justify-between">
            <span>{note.name}</span>
            <StickyNote className="h-4 w-4" />
          </div>
          <div className="text-xs text-gray-400">{note.date}</div>
        </div>
      ))}
      <Button
        variant="ghost"
        className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 transition-transform hover:scale-105"
      >
        <Plus className="mb-2 h-6 w-6 text-gray-400 transition-transform hover:scale-110" />
        <span className="text-gray-400">New note</span>
      </Button>
    </div>
  </div>
);

const QuickActions = () => {
  const { setOpen } = useNoteDialog();

  return (
    <div className="fixed bottom-4 right-4 flex space-x-2">
      <Button
        size="icon"
        variant="outline"
        className="rounded-full border-gray-600 bg-card shadow-md"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <>
      <div className="m-auto flex h-full max-w-[90%] flex-1 flex-col gap-8 pb-20 pt-0 sm:max-w-[90%] sm:px-4 md:max-w-[90%] md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
        <h1 className="text-center text-3xl font-bold">
          Good evening, Kevin Ding
        </h1>

        <RecentlyVisited />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UpcomingEvents />
          <UpcomingTasks />
        </div>
        <InboxComponent />
        <ProjectsBoard />
        <AreasGrid />
        <ResourcesGrid />
        <Notes />
      </div>
      <QuickActions />
    </>
  );
}
