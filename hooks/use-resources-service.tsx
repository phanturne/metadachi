import { createClient } from "@/utils/supabase/client";
import { useMemo } from "react";
import {
  ResourcesService,
  UpdateResourceReturnType,
} from "@/lib/database/resources-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TablesInsert } from "@/supabase/types";

export const useResourcesService = () => {
  const supabase = createClient();
  const resourcesService = useMemo(
    () => new ResourcesService(supabase),
    [supabase],
  );
  return resourcesService;
};

export const resourceKeys = {
  all: ["resources"] as const,
  resource: (resourceId: string) => [...resourceKeys.all, resourceId] as const,
  resourceTags: (resourceId: string) =>
    [...resourceKeys.resource(resourceId), "tags"] as const,
  resourceSummary: (resourceId: string) =>
    [...resourceKeys.resource(resourceId), "summary"] as const,
  userResources: (userId: string) =>
    [...resourceKeys.all, "user", userId] as const,
};

export const useGetResource = (resourceId: string) => {
  const resourcesService = useResourcesService();

  return useQuery({
    queryKey: resourceKeys.resource(resourceId),
    queryFn: () => resourcesService.selectResource(resourceId),
  });
};

export const useGetResourceTags = (resourceId: string) => {
  const resourcesService = useResourcesService();

  return useQuery({
    queryKey: resourceKeys.resourceTags(resourceId),
    queryFn: () => resourcesService.getResourceTags(resourceId),
  });
};

export const useGetResourceSummary = (resourceId: string) => {
  const resourcesService = useResourcesService();

  return useQuery({
    queryKey: resourceKeys.resourceSummary(resourceId),
    queryFn: () => resourcesService.getResourceSummary(resourceId),
  });
};

export const useGetUserResources = (userId: string) => {
  const resourcesService = useResourcesService();

  return useQuery({
    queryKey: resourceKeys.userResources(userId),
    queryFn: () => resourcesService.getUserResources(userId),
  });
};

export const useCreateResource = () => {
  const resourcesService = useResourcesService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resource: TablesInsert<"resources">) =>
      resourcesService.insertResource(resource),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.all,
      });
      if (data.user_id) {
        queryClient.invalidateQueries({
          queryKey: resourceKeys.userResources(data.user_id),
        });
      }
    },
  });
};

export const useUpdateResource = () => {
  const resourcesService = useResourcesService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resourceId,
      updates,
    }: {
      resourceId: string;
      updates: UpdateResourceReturnType;
    }) => resourcesService.updateResource(resourceId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.resource(variables.resourceId),
      });
      if (data.user_id) {
        queryClient.invalidateQueries({
          queryKey: resourceKeys.userResources(data.user_id),
        });
      }
    },
  });
};

export const useDeleteResource = () => {
  const resourcesService = useResourcesService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) =>
      resourcesService.deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.all,
      });
    },
  });
};

export const useArchiveResource = () => {
  const resourcesService = useResourcesService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) =>
      resourcesService.archiveResource(resourceId),
    onSuccess: (data, resourceId) => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.resource(resourceId),
      });
      if (data.user_id) {
        queryClient.invalidateQueries({
          queryKey: resourceKeys.userResources(data.user_id),
        });
      }
    },
  });
};

export const useUnarchiveResource = () => {
  const resourcesService = useResourcesService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId: string) =>
      resourcesService.unarchiveResource(resourceId),
    onSuccess: (data, resourceId) => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.resource(resourceId),
      });
      if (data.user_id) {
        queryClient.invalidateQueries({
          queryKey: resourceKeys.userResources(data.user_id),
        });
      }
    },
  });
};
