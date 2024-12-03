'use client'

import { useRouter } from "next/navigation";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuSkeleton } from "@/components/ui/dropdown-menu-skeleton";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Routes } from "@/utils/constants";
import { UserInfoCard } from "@/components/shared/user-info-card";
import { useSession } from "@/hooks/use-session";
import { useGetProfile } from "@/hooks/use-profile-service";
import { createClient } from "@/utils/supabase/client";

export function ProfileMenu() {
  const router = useRouter();
  const { session } = useSession();
  const { data: profile, isLoading } = useGetProfile(session?.user.id || "");
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(Routes.SIGN_IN);
  };

  if (isLoading) {
    return <DropdownMenuSkeleton />;
  }

  return (
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfoCard
            avatar={profile?.avatar_url}
            name={profile?.display_name || ""}
            email={session?.user.email || ""}
          />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => router.push(Routes.PROFILE)}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(Routes.SETTINGS)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
