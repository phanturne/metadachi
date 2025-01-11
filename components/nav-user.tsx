'use client';

import { Bell, ChevronsUpDown, LogOut, Settings, User } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Profile } from '@/supabase/queries/user';
import { UserInfoCard } from './user-info-card';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants';
import { signOutAction } from '@/app/(auth)/actions';

export function NavUser({
  userId,
  email,
}: {
  userId?: string;
  email?: string;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const {
    data: profile,
    isLoading,
    mutate,
  } = useSWR<Profile>(userId ? '/api/profile' : null, fetcher);

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0 flex"
          >
            <Skeleton className="size-8 rounded-full shrink-0" />
            <Skeleton className="ml-2 size-40 shrink-0" />
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <UserInfoCard
                avatar={profile?.avatar_url}
                name={profile?.display_name || ''}
                email={email || ''}
              />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserInfoCard
                  avatar={profile?.avatar_url}
                  name={profile?.display_name || ''}
                  email={email || ''}
                />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.PROFILE)}
                disabled
              >
                <User />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Bell />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(ROUTES.SETTINGS)}
                disabled
              >
                <Settings />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOutAction}>
              <LogOut />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
