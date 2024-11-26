import { createClient } from "@/utils/supabase/client";
import { useMemo } from "react";
import {
  AreasService,
  InsertAreaParams,
  UpdateAreaParams,
} from "@/lib/database/areas-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAreasService = () => {
  const supabase = createClient();
  const areasService = useMemo(() => new AreasService(supabase), [supabase]);
  return areasService;
};

export const areaKeys = {
  all: ["areas"] as const,
  area: (areaId: string) => [...areaKeys.all, areaId] as const,
  areaTags: (areaId: string) => [...areaKeys.area(areaId), "tags"] as const,
  areaSummary: (areaId: string) =>
    [...areaKeys.area(areaId), "summary"] as const,
  userAreas: (userId: string) => [...areaKeys.all, "user", userId] as const,
};

export const useGetArea = (areaId: string) => {
  const areasService = useAreasService();

  return useQuery({
    queryKey: areaKeys.area(areaId),
    queryFn: () => areasService.selectArea(areaId),
  });
};

export const useGetAreaTags = (areaId: string) => {
  const areasService = useAreasService();

  return useQuery({
    queryKey: areaKeys.areaTags(areaId),
    queryFn: () => areasService.getAreaTags(areaId),
  });
};

export const useGetAreaSummary = (areaId: string) => {
  const areasService = useAreasService();

  return useQuery({
    queryKey: areaKeys.areaSummary(areaId),
    queryFn: () => areasService.getAreaSummary(areaId),
  });
};

export const useGetUserAreas = (userId: string) => {
  const areasService = useAreasService();

  return useQuery({
    queryKey: areaKeys.userAreas(userId),
    queryFn: () => areasService.getUserAreas(userId),
  });
};

export const useCreateArea = () => {
  const areasService = useAreasService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (area: InsertAreaParams) => areasService.insertArea(area),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: areaKeys.all,
      });
    },
  });
};

export const useUpdateArea = () => {
  const areasService = useAreasService();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: (updates: UpdateAreaParams) => areasService.updateArea(updates),
    onSuccess: async (_, variables) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        queryClient.invalidateQueries({
          queryKey: areaKeys.area(variables.area_id),
        });
        queryClient.invalidateQueries({
          queryKey: areaKeys.userAreas(session.user.id),
        });
      }
    },
  });
};

export const useDeleteArea = () => {
  const areasService = useAreasService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (areaId: string) => areasService.deleteArea(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: areaKeys.all,
      });
    },
  });
};

export const useArchiveArea = () => {
  const areasService = useAreasService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (areaId: string) => areasService.archiveArea(areaId),
    onSuccess: (data, areaId) => {
      queryClient.invalidateQueries({
        queryKey: areaKeys.area(areaId),
      });
    },
  });
};

export const useUnarchiveArea = () => {
  const areasService = useAreasService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (areaId: string) => areasService.unarchiveArea(areaId),
    onSuccess: (data, areaId) => {
      queryClient.invalidateQueries({
        queryKey: areaKeys.area(areaId),
      });
    },
  });
};
