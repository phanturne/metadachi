"use client";

import React from "react";
import {
  Bookmark,
  Briefcase,
  Calendar,
  CalendarIcon,
  Clock,
  DollarSign,
  Folder,
  FolderOpenDot,
  Heart,
  Inbox,
  LandPlot,
  Languages,
  ListChecks,
  MoreHorizontal,
  Plane,
  Plus,
  StickyNote,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNoteDialog } from "@/providers/note-dialog-provider";

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

const events = [
  { id: 1, title: "Team Meeting", time: "09:00 AM", date: 22 },
  { id: 2, title: "Project Deadline", time: "11:30 AM", date: 22 },
  { id: 7, title: "Product Demo", time: "10:00 AM", date: 23 },
  { id: 8, title: "Strategy Meeting", time: "02:00 PM", date: 24 },
  { id: 9, title: "Client Call", time: "11:00 AM", date: 25 },
  { id: 10, title: "Team Lunch", time: "12:30 PM", date: 26 },
];

const CalendarComponent = () => {
  const [selectedDate, setSelectedDate] = React.useState(22);

  return (
    <div className="flex h-full rounded-xl bg-card p-4 shadow-md">
      <div className="w-2/5 border-r border-gray-600 pr-3">
        <div className="mb-3 text-center">
          <h3 className="text-base font-semibold text-black dark:text-white">
            May 2024
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="mb-1 text-center text-[10px] text-gray-400"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
            <Button
              key={date}
              variant="ghost"
              className={`h-6 w-full p-0 text-xs ${
                date === selectedDate
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setSelectedDate(date)}
            >
              {date}
            </Button>
          ))}
        </div>
      </div>
      <div className="w-3/5 pl-3">
        <h4 className="mb-3 text-base font-semibold text-black dark:text-white">
          Events for May {selectedDate}
        </h4>
        <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
          {events
            .filter((event) => event.date === selectedDate)
            .map((event) => (
              <div
                key={event.id}
                className="rounded-lg bg-gray-200 p-2.5 shadow-md dark:bg-gray-800"
              >
                <h5 className="mb-1.5 text-xs font-medium text-black dark:text-white">
                  {event.title}
                </h5>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    May {event.date}, 2024
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {event.time}
                  </span>
                </div>
              </div>
            ))}
          {events.filter((event) => event.date === selectedDate).length ===
            0 && (
            <p className="text-xs text-gray-400">No events for this date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const UpcomingEvents = () => (
  <div className="flex h-full flex-col">
    <div className="mb-2 flex items-center justify-between">
      <h2 className="flex items-center text-sm text-gray-400">
        <Calendar className="mr-2 h-4 w-4" />
        Upcoming events
      </h2>
      <Button variant="ghost" size="sm" className="text-gray-400">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
    <div className="flex-grow">
      <CalendarComponent />
    </div>
  </div>
);

const UpcomingTasks = () => (
  <div className="flex h-full flex-col">
    <div className="mb-2 flex items-center justify-between">
      <h2 className="flex items-center text-sm text-gray-400">
        <ListChecks className="mr-2 h-4 w-4" />
        Upcoming tasks
      </h2>
      <Button variant="ghost" size="sm" className="text-gray-400">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
    <div className="flex-grow overflow-y-auto rounded-xl bg-card p-6 shadow-md">
      <ul className="space-y-3">
        {[
          { title: "Team Meeting", date: "Today, 2:00 PM" },
          { title: "Project Deadline", date: "Tomorrow, 5:00 PM" },
          { title: "Client Presentation", date: "May 25, 10:00 AM" },
          { title: "Weekly Review", date: "May 26, 9:00 AM" },
          { title: "Product Launch", date: "May 30, 3:00 PM" },
        ].map((task, index) => (
          <li key={index} className="flex items-center justify-between">
            <span>{task.title}</span>
            <span className="text-sm text-gray-400">{task.date}</span>
          </li>
        ))}
      </ul>
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

const Areas = () => (
  <div className="flex h-full flex-col">
    <h2 className="mb-4 flex items-center text-sm text-gray-400">
      <LandPlot className="mr-2 h-4 w-4" />
      Areas
    </h2>
    <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[
        { name: "Personal", icon: User },
        { name: "Health & Fitness", icon: Heart },
        { name: "Side Hustle", icon: Briefcase },
        { name: "Travel", icon: Plane },
        { name: "Language Learning", icon: Languages },
        { name: "Investing", icon: DollarSign },
      ].map((area, index) => (
        <div
          key={index}
          className="group relative flex transform flex-col items-center justify-center rounded-xl bg-card p-4 shadow-md transition-transform hover:scale-105"
        >
          <area.icon className="mb-2 h-8 w-8 text-black transition-transform group-hover:scale-110 dark:text-white" />
          <span className="text-black dark:text-white">{area.name}</span>
          <div className="absolute inset-0 rounded-xl bg-card opacity-0 transition-opacity group-hover:opacity-30"></div>
        </div>
      ))}
      <Button
        variant="ghost"
        className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 transition-transform hover:scale-105"
      >
        <Plus className="mb-2 h-6 w-6 text-gray-400 transition-transform hover:scale-110" />
        <span className="text-gray-400">New area</span>
      </Button>
    </div>
  </div>
);

const Projects = () => (
  <div className="flex h-full flex-col">
    <h2 className="mb-4 flex items-center text-sm text-gray-400">
      <FolderOpenDot className="mr-2 h-4 w-4" />
      Projects
    </h2>
    <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3">
      {[
        {
          status: "Inbox",
          color: "bg-gray-600",
          projects: [
            {
              name: "Learn Japanese",
              progress: 0,
            },
          ],
        },
        {
          status: "Planned",
          color: "bg-blue-600",
          projects: [{ name: "Learn Python", progress: 0 }],
        },
        {
          status: "In progress",
          color: "bg-yellow-600",
          projects: [
            {
              name: "Trip to Japan",
              progress: 100,
            },
            {
              name: "Get AI/ML Job",
              progress: 25,
            },
          ],
        },
      ].map((column, index) => (
        <div key={index} className="rounded-xl bg-card p-6 shadow-md">
          <div className="mb-4 flex items-center space-x-2">
            <span className={`h-2 w-2 rounded-full ${column.color}`}></span>
            <span>{column.status}</span>
            <span className="text-gray-400">{column.projects.length}</span>
          </div>
          <div className="space-y-4">
            {column.projects.map((project, projectIndex) => (
              <div
                key={projectIndex}
                className="transform rounded-lg bg-nested-card-background p-4 shadow-md transition-transform hover:scale-105"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span>{project.name}</span>
                  <Folder className="h-4 w-4" />
                </div>
                <Progress value={project.progress} className="h-1" />
              </div>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              New project
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Resources = () => (
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
      >
        <Plus className="mb-2 h-6 w-6 text-gray-400 transition-transform hover:scale-110" />
        <span className="text-gray-400">New resource</span>
      </Button>
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
        <Projects />
        <Areas />
        <Resources />
        <Notes />
      </div>
      <QuickActions />
    </>
  );
}
