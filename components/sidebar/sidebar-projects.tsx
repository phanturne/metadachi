"use client";

import { FolderOpenDot, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useGetUserProjects } from "@/hooks/use-projects-service";
import { useState } from "react";
import ProjectItemDialog from "@/components/projects/project-item-dialog";

interface ProjectItemsProps {
  userId: string;
}

const ProjectItems = ({ userId }: ProjectItemsProps) => {
  const { data: projects } = useGetUserProjects(userId);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  return (
    <>
      <Collapsible asChild defaultOpen>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Projects">
            <a href="#">
              <FolderOpenDot />
              <span>Projects</span>
            </a>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="data-[state=open]:rotate-90">
              <ChevronRight />
              <span className="sr-only">Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {projects?.map((project) => (
                <SidebarMenuSubItem key={project.project_id}>
                  <SidebarMenuSubButton
                    asChild
                    onClick={() => {
                      setSelectedProjectId(project.project_id);
                      setOpenProjectDialog(true);
                    }}
                  >
                    <a href="#">
                      <span className="truncate">{project.name}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
      {selectedProjectId && (
        <ProjectItemDialog
          open={openProjectDialog}
          onOpenChange={setOpenProjectDialog}
          projectId={selectedProjectId}
        />
      )}
    </>
  );
};

export default ProjectItems;
