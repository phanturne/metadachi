"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Loader2, UserRoundPen, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { ProfileService } from "@/utils/database/profile-service";
import { Routes } from "@/utils/constants";
import { useDebouncedCallback } from "use-debounce";

interface FormData {
  username: string;
  displayName: string;
}

const ProfileSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    displayName: "",
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);

  const router = useRouter();
  const supabase = createClient();
  const profileService = useMemo(
    () => new ProfileService(supabase),
    [supabase],
  );
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        router.push(Routes.SIGN_IN);
      }
    };
    loadSession();
  }, [supabase, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return;

      try {
        const profile = await profileService.getProfile(session.user.id);
        setFormData({
          username: profile.username || "",
          displayName: profile.display_name || "",
        });
        setAvatarPreview(profile.avatar_url);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      loadProfile();
    }
  }, [session, profileService]);

  const checkUsernameAvailability = useDebouncedCallback(
    async (username: string) => {
      if (username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      setIsCheckingUsername(true);
      try {
        const isAvailable = await profileService.isUsernameAvailable(username);
        setUsernameAvailable(isAvailable);
      } catch (err) {
        console.error("Error checking username availability:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    },
    300,
  );

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setFormData((prev) => ({ ...prev, username: newUsername }));
    checkUsernameAvailability(newUsername);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user || !usernameAvailable) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await profileService.updateProfile(session.user.id, {
        username: formData.username,
        display_name: formData.displayName,
        avatar_file: avatarFile || undefined,
      });

      setSuccess("Profile updated successfully!");
      setAvatarFile(null);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          ProfileService Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img
                  src={avatarPreview || "/api/placeholder/150/150"}
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-primary object-cover"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-white transition-colors hover:bg-primary/90"
                      >
                        <UserRoundPen className="h-5 w-5 dark:text-black" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Change profile picture</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {avatarFile && (
                <p className="text-sm text-muted-foreground">
                  New avatar selected
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="your_username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  className={`pr-10 ${
                    usernameAvailable === true
                      ? "border-green-500"
                      : usernameAvailable === false
                        ? "border-red-500"
                        : ""
                  }`}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  {isCheckingUsername && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {!isCheckingUsername && usernameAvailable === true && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {!isCheckingUsername && usernameAvailable === false && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {!isCheckingUsername && usernameAvailable === false && (
                <p className="text-sm text-red-500">
                  Username is already taken
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Your Name"
                value={formData.displayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert
                variant="default"
                className="border-green-200 bg-green-50 text-green-700"
              >
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isSaving || !usernameAvailable || formData.username.length < 3
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
