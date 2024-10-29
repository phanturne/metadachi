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
  Menu,
  MoreHorizontal,
  Plane,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNoteDialog } from "@/providers/note-dialog-provider";

const RecentlyVisited = () => (
  <div>
    <h2 className="mb-2 flex items-center text-sm text-gray-400">
      <Clock className="mr-2 h-4 w-4" />
      Recently visited
    </h2>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {[
        "Home",
        "Resources",
        "Second Brain (1)",
        "New Note",
        "Notes",
        "Inbox",
      ].map((item, index) => (
        <div key={index} className="rounded-lg bg-[#2E2E2E] p-4">
          <h3 className="mb-2 text-sm font-normal">{item}</h3>
          <p className="text-xs text-gray-400">
            K · {["1w", "3w", "3w", "1m", "1m", "3w"][index]} ago
          </p>
        </div>
      ))}
    </div>
  </div>
);

const UpcomingEvents = () => (
  <div>
    <div className="mb-2 flex items-center justify-between">
      <h2 className="flex items-center text-sm text-gray-400">
        <Calendar className="mr-2 h-4 w-4" />
        Upcoming events
      </h2>
      <Button variant="ghost" size="sm" className="text-gray-400">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <CalendarComponent />
      <UpcomingTasks />
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
    <div className="flex rounded-xl bg-[#2E2E2E] p-6">
      <div className="w-2/5 border-r border-gray-600 pr-4">
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-white">May 2024</h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center text-xs text-gray-400">
              {day}
            </div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
            <Button
              key={date}
              variant="ghost"
              className={`h-7 w-full p-0 text-sm ${
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
      <div className="w-3/5 pl-4">
        <h4 className="mb-4 text-lg font-semibold text-white">
          Events for May {selectedDate}
        </h4>
        <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
          {events
            .filter((event) => event.date === selectedDate)
            .map((event) => (
              <div key={event.id} className="rounded-lg bg-gray-800 p-3">
                <h5 className="mb-2 text-sm font-medium text-white">
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
            <p className="text-sm text-gray-400">No events for this date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const UpcomingTasks = () => (
  <div className="rounded-xl bg-[#2E2E2E] p-6">
    <h3 className="mb-4 text-lg font-semibold">Upcoming Tasks</h3>
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
);

const InboxComponent = () => (
  <div>
    <h2 className="mb-4 flex items-center text-sm text-gray-400">
      <Inbox className="mr-2 h-4 w-4" />
      Inbox
    </h2>
    <div className="rounded-xl bg-[#2E2E2E] p-6">
      <div className="space-y-4">
        {/*<div className="flex items-center space-x-2">*/}
        {/*  <Inbox className="h-5 w-5" />*/}
        {/*  <span>Inbox</span>*/}
        {/*</div>*/}
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            <span>Resources</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="ml-2 h-4 w-4" />
            <span>Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <Folder className="ml-2 h-4 w-4" />
            <span>Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <Menu className="ml-2 h-4 w-4" />
            <span>Notes</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="h-4 w-4" />
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
            <Bookmark className="h-4 w-4" />
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
  <div>
    <h2 className="mb-4 flex items-center text-sm text-gray-400">
      <LandPlot className="mr-2 h-4 w-4" />
      Areas
    </h2>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
          className="flex flex-col items-center justify-center rounded-xl bg-[#2E2E2E] p-4"
        >
          <area.icon className="mb-2 h-8 w-8" />
          <span>{area.name}</span>
        </div>
      ))}
      <Button
        variant="ghost"
        className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600"
      >
        <Plus className="mb-2 h-6 w-6" />
        <span>New area</span>
      </Button>
    </div>
  </div>
);

const Projects = () => (
  <div>
    <h2 className="mb-4 flex items-center text-sm text-gray-400">
      <FolderOpenDot className="mr-2 h-4 w-4" />
      Projects
    </h2>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[
        {
          status: "Inbox",
          color: "bg-gray-600",
          projects: [
            {
              name: "Learn Japanese",
              area: "Language Learning",
              progress: 0,
            },
          ],
        },
        {
          status: "Planned",
          color: "bg-blue-600",
          projects: [{ name: "Learn Python", area: "Personal", progress: 0 }],
        },
        {
          status: "In progress",
          color: "bg-yellow-600",
          projects: [
            {
              name: "Trip to Japan",
              area: "Travel",
              progress: 100,
            },
            {
              name: "Get AI/ML Job",
              area: "Investing",
              progress: 25,
            },
          ],
        },
      ].map((column, index) => (
        <div key={index} className="rounded-xl bg-[#2E2E2E] p-6">
          <div className="mb-4 flex items-center space-x-2">
            <span className={`h-2 w-2 rounded-full ${column.color}`}></span>
            <span>{column.status}</span>
            <span className="text-gray-400">{column.projects.length}</span>
          </div>
          <div className="space-y-4">
            {column.projects.map((project, projectIndex) => (
              <div key={projectIndex} className="rounded-lg bg-[#3A3A3A] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span>{project.name}</span>
                  <Folder className="h-4 w-4" />
                </div>
                <div className="mb-2 text-sm text-gray-400">{project.area}</div>
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

const QuickActions = () => {
  const { setOpen } = useNoteDialog();

  return (
    <div className="fixed bottom-4 right-4 flex space-x-2">
      <Button
        size="icon"
        variant="outline"
        className="rounded-full border-gray-600 bg-[#2E2E2E]"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function TaskPage() {
  return (
    <>
      <div className="m-auto flex flex-1 flex-col gap-8 pb-20 pt-0">
        <h1 className="text-center text-3xl font-bold">
          Good evening, Kevin Ding
        </h1>

        <RecentlyVisited />
        <UpcomingEvents />
        <InboxComponent />
        <Projects />
        <Areas />
      </div>
      <QuickActions />
    </>
  );
}
