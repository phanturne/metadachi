"use client";

import { ProjectsBoard } from "@/components/projects/projects-board";
import { AreasGrid } from "@/components/areas/areas-grid";
import { ResourcesGrid } from "@/components/resources/resources-grid";
import { UpcomingEvents } from "@/components/tasks/upcoming-events";
import { UpcomingTasks } from "@/components/tasks/upcoming-tasks";
import { NotesGrid } from "@/components/notes/notes-grid";
import { QuickActions } from "@/components/quick-actions";
import { RecentlyVisited } from "@/components/dashboard/recently-visited";
import { InboxComponent } from "@/components/dashboard/inbox-component";

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
        <NotesGrid />
      </div>
      <QuickActions />
    </>
  );
}
