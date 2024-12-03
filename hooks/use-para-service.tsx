import { createClient } from "@/utils/supabase/client";
import { useMemo } from "react";
import { ParaService } from "@/lib/database/para-service";
import { useQuery } from "@tanstack/react-query";

export const useParaService = () => {
  const supabase = createClient();
  const paraService = useMemo(() => new ParaService(supabase), [supabase]);
  return paraService;
};

export const paraKeys = {
  all: ["para"] as const,
  recentItems: (userId: string) => [...paraKeys.all, "recent", userId] as const,
};

export const useGetRecentItems = (userId: string, limit?: number) => {
  const paraService = useParaService();

  return useQuery({
    queryKey: paraKeys.recentItems(userId),
    queryFn: () => paraService.getRecentItems(userId, limit),
  });
};
