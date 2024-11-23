import { createClient } from "@/utils/supabase/client";
import { useMemo } from "react";
import {
  InsertProjectParams,
  ProjectsService,
  UpdateProjectParams,
} from "@/lib/database/projects-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProjectService = () => {
  const supabase = createClient();
  const projectService = useMemo(
    () => new ProjectsService(supabase),
    [supabase],
  );
  return projectService;
};

export const projectKeys = {
  all: ["projects"] as const,
  project: (projectId: string) => [...projectKeys.all, projectId] as const,
  projectTags: (projectId: string) =>
    [...projectKeys.project(projectId), "tags"] as const,
  connectedProjects: (projectId: string) =>
    [...projectKeys.project(projectId), "connected"] as const,
  projectHierarchy: (projectId: string) =>
    [...projectKeys.project(projectId), "hierarchy"] as const,
  projectConnections: (projectId: string) =>
    [...projectKeys.project(projectId), "connections"] as const,
  projectSummary: (projectId: string) =>
    [...projectKeys.project(projectId), "summary"] as const,
  projectStatistics: (projectId: string) =>
    [...projectKeys.project(projectId), "statistics"] as const,
  projectTimeline: (projectId: string) =>
    [...projectKeys.project(projectId), "timeline"] as const,
};

export const useGetProject = (projectId: string) => {
  const projectService = useProjectService();

  return useQuery({
    queryKey: projectKeys.project(projectId),
    queryFn: () => projectService.selectProject(projectId),
  });
};

export const useGetProjectTags = (projectId: string) => {
  const projectService = useProjectService();

  return useQuery({
    queryKey: projectKeys.projectTags(projectId),
    queryFn: () => projectService.getProjectTags(projectId),
  });
};

export const useGetConnectedProjects = (projectId: string) => {
  const projectService = useProjectService();

  return useQuery({
    queryKey: projectKeys.connectedProjects(projectId),
    queryFn: () => projectService.getConnectedProjects(projectId),
  });
};

export const useGetProjectHierarchy = (projectId: string) => {
  const projectService = useProjectService();

  return useQuery({
    queryKey: projectKeys.projectHierarchy(projectId),
    queryFn: () => projectService.getProjectHierarchy(projectId),
  });
};

export const useGetProjectSummary = (projectId: string) => {
  const projectService = useProjectService();

  return useQuery({
    queryKey: projectKeys.projectSummary(projectId),
    queryFn: () => projectService.getProjectSummary(projectId),
  });
};

export const useGetProjectStatistics = (projectId: string) => {
  const projectService = useProjectService();

  return useQuery({
    queryKey: projectKeys.projectStatistics(projectId),
    queryFn: () => projectService.getProjectStatistics(projectId),
  });
};

export const useGetProjectTimeline = (projectId: string) => {
  const projectService = useProjectService();

  return useQuery({
    queryKey: projectKeys.projectTimeline(projectId),
    queryFn: () => projectService.getProjectTimeline(projectId),
  });
};

export const useMoveProject = () => {
  const projectService = useProjectService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      newParentId,
    }: {
      projectId: string;
      newParentId?: string;
    }) => projectService.moveProject(projectId, newParentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.projectHierarchy(variables.projectId),
      });
    },
  });
};

export const useCreateProject = () => {
  const projectService = useProjectService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: InsertProjectParams) =>
      projectService.insertProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });
    },
  });
};

export const useUpdateProject = () => {
  const projectService = useProjectService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: UpdateProjectParams;
    }) => projectService.updateProject(projectId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.project(variables.projectId),
      });
    },
  });
};

export const useDeleteProject = () => {
  const projectService = useProjectService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });
    },
  });
};

export const useCreateProjectConnection = () => {
  const projectService = useProjectService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      connectedProjectId,
      connectionType,
      context,
    }: {
      projectId: string;
      connectedProjectId: string;
      connectionType: string;
      context?: string;
    }) =>
      projectService.createProjectConnection(
        projectId,
        connectedProjectId,
        connectionType,
        context,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.projectConnections(variables.projectId),
      });
    },
  });
};

export const useDeleteProjectConnection = () => {
  const projectService = useProjectService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      connectedProjectId,
    }: {
      projectId: string;
      connectedProjectId: string;
    }) => projectService.deleteProjectConnection(projectId, connectedProjectId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.projectConnections(variables.projectId),
      });
    },
  });
};

export const useArchiveProjectCascade = () => {
  const projectService = useProjectService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) =>
      projectService.archiveProjectCascade(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      });
    },
  });
};
