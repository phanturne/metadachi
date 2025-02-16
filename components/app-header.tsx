'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ProfileMenu } from '@/components/user/profile-menu';
import { useProfile } from '@/hooks/use-profile';

interface AppHeaderProps {
  children?: React.ReactNode;
  isScrolled?: boolean;
}

export function AppHeader({ children, isScrolled }: AppHeaderProps) {
  const { data: profile } = useProfile();

  return (
    <header
      className={`sticky flex h-16 shrink-0 items-center justify-between gap-2 ${
        isScrolled
          ? 'border-border/40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </div>
        {children}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            className="relative mr-4 h-8 w-8 rounded-full"
          >
            <Avatar className="h-8 w-8 content-center">
              <AvatarImage
                src={profile?.avatar_url || ''}
                alt={profile?.display_name || 'User'}
              />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <ProfileMenu />
      </DropdownMenu>
    </header>
  );
} 