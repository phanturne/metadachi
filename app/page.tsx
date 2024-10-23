"use client";

import React from "react";
import {
  Bookmark,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Folder,
  Heart,
  HelpCircle,
  Inbox,
  Languages,
  Menu,
  MoreHorizontal,
  Plane,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Component() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pb-20 pt-0">
        <h1 className="mb-8 text-3xl font-bold">Good evening, Kevin Ding</h1>

        {/* Recently visited */}
        <div className="mb-8">
          <h2 className="mb-4 flex items-center text-sm text-gray-400">
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

        {/* Upcoming events */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center text-sm text-gray-400">
              <Calendar className="mr-2 h-4 w-4" />
              Upcoming events
            </h2>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Calendar */}
            <div className="rounded-xl bg-[#2E2E2E] p-6">
              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold">May 2024</h3>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div key={day} className="text-center text-xs text-gray-400">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                  <Button
                    key={date}
                    variant="ghost"
                    className={`h-8 w-full p-0 ${date === 22 ? "bg-blue-600 text-white" : ""}`}
                  >
                    {date}
                  </Button>
                ))}
              </div>
            </div>
            {/* Upcoming Tasks */}
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
          </div>
        </div>

        {/* Second Brain Components */}
        <div className="space-y-8">
          {/* Inbox */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Inbox</h2>
            <div className="rounded-xl bg-[#2E2E2E] p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Inbox className="h-5 w-5" />
                  <span>Inbox</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Bookmark className="h-4 w-4" />
                  <span>Resources</span>
                  <Clock className="ml-2 h-4 w-4" />
                  <span>Tasks</span>
                  <Folder className="ml-2 h-4 w-4" />
                  <span>Projects</span>
                  <Menu className="ml-2 h-4 w-4" />
                  <span>Notes</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bookmark className="h-4 w-4" />
                    <span>Second Brain PARA-Thiago Forte</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-gray-600 px-2 py-1 text-xs">
                      Inbox
                    </span>
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
                    <span className="rounded bg-gray-600 px-2 py-1 text-xs">
                      Inbox
                    </span>
                    <span className="rounded bg-orange-600 px-2 py-1 text-xs">
                      Video
                    </span>
                    <span className="text-xs text-gray-400">Investment</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New page
                </Button>
              </div>
            </div>
          </div>

          {/* Areas */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Areas</h2>
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
                  className="flex flex-col items-center justify-center rounded-xl bg-[#2E2E2E] p-6"
                >
                  <area.icon className="mb-4 h-12 w-12" />
                  <span>{area.name}</span>
                </div>
              ))}
              <Button
                variant="ghost"
                className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600"
              >
                <Plus className="mb-2 h-8 w-8" />
                <span>New page</span>
              </Button>
            </div>
          </div>

          {/* Projects */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Projects</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  status: "Inbox",
                  color: "bg-gray-600",
                  projects: [
                    {
                      name: "Learn Spanish",
                      area: "Language Learning",
                      progress: 0,
                    },
                  ],
                },
                {
                  status: "Planned",
                  color: "bg-blue-600",
                  projects: [
                    { name: "Learn Python", area: "Personal", progress: 0 },
                  ],
                },
                {
                  status: "In progress",
                  color: "bg-yellow-600",
                  projects: [
                    {
                      name: "Trip to Singapore",
                      area: "Travel",
                      progress: 100,
                    },
                    {
                      name: "Stock Portfolio Diversification",
                      area: "Investing",
                      progress: 25,
                    },
                  ],
                },
              ].map((column, index) => (
                <div key={index} className="rounded-xl bg-[#2E2E2E] p-6">
                  <div className="mb-4 flex items-center space-x-2">
                    <span
                      className={`h-2 w-2 rounded-full ${column.color}`}
                    ></span>
                    <span>{column.status}</span>
                    <span className="text-gray-400">
                      {column.projects.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {column.projects.map((project, projectIndex) => (
                      <div
                        key={projectIndex}
                        className="rounded-lg bg-[#3A3A3A] p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span>{project.name}</span>
                          <Folder className="h-4 w-4" />
                        </div>
                        <div className="mb-2 text-sm text-gray-400">
                          {project.area}
                        </div>
                        <Progress value={project.progress} className="h-1" />
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-400"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New page
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full border-gray-600 bg-[#2E2E2E]"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full border-gray-600 bg-[#2E2E2E]"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
