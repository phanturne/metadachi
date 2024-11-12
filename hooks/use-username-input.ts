import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { profileKeys, useProfileService } from "@/hooks/use-profile-service";

type UsernameValidation = {
  isValid: boolean;
  message: string | null;
};

export const useUsernameInput = (initialValue: string = "") => {
  const [username, setUsername] = useState(initialValue);
  const [debouncedUsername] = useDebounce(username, 300);
  const [hasChanged, setHasChanged] = useState(false);
  const profileService = useProfileService();

  useEffect(() => {
    setHasChanged(username !== initialValue);
  }, [username, initialValue]);

  const {
    data: isAvailable,
    isLoading,
    isError,
    error,
  } = useQuery<boolean | null, Error>({
    queryKey: profileKeys.username(debouncedUsername),
    queryFn: async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        return null;
      }
      // Skip availability check if username matches the initial username
      if (debouncedUsername === initialValue) {
        return true;
      }
      return profileService.isUsernameAvailable(debouncedUsername);
    },
    enabled: !!debouncedUsername && debouncedUsername.length >= 3 && hasChanged,
    gcTime: 30000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const validation = useMemo((): UsernameValidation => {
    if (!username) {
      return { isValid: false, message: "Username is required" };
    }
    if (username.length < 3) {
      return {
        isValid: false,
        message: "Username must be at least 3 characters",
      };
    }
    if (username.length > 30) {
      return {
        isValid: false,
        message: "Username must be less than 30 characters",
      };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return {
        isValid: false,
        message:
          "Username can only contain letters, numbers, underscores, and hyphens",
      };
    }
    if (!isLoading && isAvailable === false) {
      return { isValid: false, message: "Username is already taken" };
    }
    if (!isLoading && isAvailable === true) {
      return { isValid: true, message: "Username is available" };
    }
    return { isValid: false, message: null };
  }, [username, isLoading, isAvailable]);

  return {
    username,
    setUsername,
    isLoading,
    isError,
    error,
    validation,
    isAvailable,
    hasChanged,
  };
};
