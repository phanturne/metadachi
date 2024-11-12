import { Folder, FolderOpenDot, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import CreateProjectDialog from "@/components/projects/create-project-dialog";

const mockProjects = [
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
];

export const ProjectsBoard = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex h-full flex-col">
        <h2 className="mb-4 flex items-center text-sm text-gray-400">
          <FolderOpenDot className="mr-2 h-4 w-4" />
          Projects
        </h2>
        <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3">
          {mockProjects.map((column, index) => (
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
                  onClick={() => setOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New project
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CreateProjectDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
