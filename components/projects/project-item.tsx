import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Folder } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ProjectItemDialog from "./project-item-dialog";
import { Project } from "@/lib/database/projects-service";

interface ProjectItemProps {
  project: Partial<Project> & { complete_tasks: number; total_tasks: number };
}

export default function ProjectItem({ project }: ProjectItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="transform cursor-pointer bg-nested-card-background transition-transform hover:scale-105"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span>{project.name}</span>
            <Folder className="h-4 w-4" />
          </div>
          {project.total_tasks > 0 && (
            <Progress
              value={(project.complete_tasks / project.total_tasks) * 100}
              className="h-1"
            />
          )}
        </CardContent>
      </Card>
      <ProjectItemDialog
        open={open}
        onOpenChange={setOpen}
        projectId={project.project_id}
        defaultStatus={project.status}
      />
    </>
  );
}
