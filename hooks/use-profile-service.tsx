// hooks/profile/useProfileService.ts
import { createClient } from "@/utils/supabase/client";
import { useMemo } from "react";
import { ProfileService, ProfileUpdate } from "@/lib/database/profile-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfileService = () => {
  const supabase = createClient();
  const profileService = useMemo(
    () => new ProfileService(supabase),
    [supabase],
  );
  return profileService;
};

export const profileKeys = {
  all: ["profile"] as const,
  profile: (userId: string) => [...profileKeys.all, userId] as const,
  username: (username: string) => ["username", username] as const,
};

export const useGetProfile = (userId: string) => {
  const profileService = useProfileService();

  return useQuery({
    queryKey: profileKeys.profile(userId),
    queryFn: () => profileService.getProfile(userId),
  });
};

export type UpdateProfileParams = {
  userId: string;
  updates: Partial<ProfileUpdate> & {
    avatar_file?: File;
  };
};

export const useUpdateProfile = () => {
  const profileService = useProfileService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: UpdateProfileParams) =>
      profileService.updateProfile(userId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.profile(variables.userId),
      });
    },
  });
};
