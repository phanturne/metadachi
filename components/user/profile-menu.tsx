'use client';

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { UserInfoCard } from '@/components/user/user-info-card';
import { useProfile } from '@/hooks/use-profile';
import { useSession } from '@/hooks/use-session';
import { ROUTES } from '@/utils/constants';
import { createClient } from '@/utils/supabase/client';
import { LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

export function ProfileMenu() {
  const router = useRouter();
  const { session } = useSession();
  const { data: profile, isLoading } = useProfile();
  const supabase = createClient();
  const { setTheme, theme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(ROUTES.LOGIN);
  };

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
            name={profile?.display_name || ''}
            email={session?.user.email || ''}
          />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={toggleTheme}
          className="flex cursor-default justify-between"
        >
          <div className="flex items-center">
            <Sun className="dark:-rotate-90 mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Dark mode</span>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={() =>
              setTheme(theme === 'dark' ? 'light' : 'dark')
            }
            onClick={(e) => e.stopPropagation()}
            aria-label="Toggle theme"
          />
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

function DropdownMenuSkeleton() {
  return (
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <div className="p-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </div>
      </div>
      <div className="my-2 h-px bg-muted" />
      <div className="space-y-2 p-2">
        {['profile', 'settings', 'theme'].map((item) => (
          <Skeleton key={item} className="h-8 w-full" />
        ))}
      </div>
      <div className="my-2 h-px bg-muted" />
      <div className="p-2">
        <Skeleton className="h-8 w-full" />
      </div>
    </DropdownMenuContent>
  );
}
