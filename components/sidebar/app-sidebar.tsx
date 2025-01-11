'use client';

import * as React from 'react';
import {
  FileText,
  Flame,
  Folder,
  HeartIcon,
  Home,
  Library,
  LifeBuoy,
  LucideTrash2,
  MoreHorizontal,
  PlusIcon,
  Search,
  Send,
  Sparkles,
  Tag,
  Telescope,
  WalletCards,
} from 'lucide-react';

import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ROUTES } from '@/utils/constants';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarHistory } from './sidebar-history';
import type { GetUserReturn } from '@/supabase/queries/user';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import dynamic from 'next/dynamic';

type AppSidebarMenuItemType = {
  title: string;
  icon: any;
  url?: string;
  disabled?: boolean;
};

const pagesWithDoubleSidebar = [ROUTES.CHAT, ROUTES.HOME];

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Home',
      url: ROUTES.HOME,
      icon: Home,
    },
    {
      title: 'Search',
      icon: Search,
      disabled: true,
    },
    {
      title: 'Ask AI',
      url: ROUTES.CHAT,
      icon: Sparkles,
    },
    {
      title: 'Explore',
      url: '#',
      icon: Telescope,
      disabled: true,
    },
  ],
  navSecondary: [
    {
      title: 'Favorites',
      icon: HeartIcon,
      url: ROUTES.HOME,
      disabled: false,
    },
    {
      title: 'Documents',
      icon: FileText,
    },
    {
      title: 'Folders',
      icon: Folder,
    },
    {
      title: 'Libraries',
      icon: Library,
    },
    {
      title: 'Tags',
      icon: Tag,
    },
  ],
  navTools: [
    {
      title: 'Habit Tracker',
      url: '#',
      icon: Flame,
      disabled: true,
    },
    {
      title: 'Flashcards',
      url: '#',
      icon: WalletCards,
      disabled: true,
    },
    {
      title: 'More',
      url: '#',
      icon: MoreHorizontal,
      disabled: true,
    },
  ],
  navBottom: [
    {
      title: 'Trash',
      icon: LucideTrash2,
      disabled: true,
      url: ROUTES.HOME,
    },
    {
      title: 'Support',
      icon: LifeBuoy,
      disabled: true,
    },
    {
      title: 'Feedback',
      icon: Send,
      disabled: true,
    },
  ],
};

export function AppSidebar({ user }: { user: GetUserReturn }) {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false);
  const SearchDialog = React.useMemo(
    () => dynamic(() => import('@/components/search-dialog')),
    [],
  );

  const [activeItem, setActiveItem] = React.useState<AppSidebarMenuItemType>(
    data.navMain[0],
  );

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
      >
        <FirstSidebar
          user={user}
          setIsSearchDialogOpen={setIsSearchDialogOpen}
        />
        <SecondSidebar user={user} />
      </Sidebar>

      {isSearchDialogOpen && (
        <SearchDialog
          open={isSearchDialogOpen}
          setOpen={setIsSearchDialogOpen}
        />
      )}
    </>
  );
}

const FirstSidebarMenuItem = ({
  item,
  setIsSearchDialogOpen,
}: {
  item: AppSidebarMenuItemType;
  setIsSearchDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { setOpen } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (item: AppSidebarMenuItemType) => {
    if (pagesWithDoubleSidebar.includes(item.url ?? '')) {
      setOpen(true);
    } else if (item.url) {
      setOpen(false);
    }

    if (item.title === 'Search') {
      setIsSearchDialogOpen(true);
    }

    if (item.url) {
      router.push(item.url);
    }
  };

  return (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton
        tooltip={{
          children: item.title,
          hidden: false,
        }}
        disabled={item.disabled}
        isActive={pathname === item.url}
        className="px-2.5 md:px-2"
        onClick={() => handleNavClick(item)}
      >
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

function FirstSidebar({
  user,
  setIsSearchDialogOpen,
}: {
  user: GetUserReturn;
  setIsSearchDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="none"
      className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <a
                href={ROUTES.HOME}
                className="flex w-full items-center justify-between"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image
                    src="/metadachi.svg"
                    alt="Metadachi Icon"
                    width={24}
                    height={24}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Metadachi</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Group */}
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {data.navMain.map((item) => (
                <FirstSidebarMenuItem
                  key={item.title}
                  item={item}
                  setIsSearchDialogOpen={setIsSearchDialogOpen}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Group */}
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <FirstSidebarMenuItem
                  key={item.title}
                  item={item}
                  setIsSearchDialogOpen={setIsSearchDialogOpen}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Group */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {data.navBottom.map((item) => (
                <FirstSidebarMenuItem
                  key={item.title}
                  item={item}
                  setIsSearchDialogOpen={setIsSearchDialogOpen}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser userId={user.user?.id} email={user.user?.email} />
      </SidebarFooter>
    </Sidebar>
  );
}

function SecondSidebar({ user }: { user: GetUserReturn }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const renderComponent = () => {
    switch (pathname) {
      case ROUTES.HOME:
        return <p>Home</p>;
      case ROUTES.CHAT:
        return <SidebarHistory user={user.user} />;
      default:
        return;
    }
  };

  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium text-foreground">
            {pathname}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                type="button"
                className="p-2 h-fit"
                onClick={() => {
                  setOpenMobile(false);
                  router.push('/');
                  router.refresh();
                }}
              >
                <PlusIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end">New Chat</TooltipContent>
          </Tooltip>
        </div>
        <SidebarInput placeholder="Type to search..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>{renderComponent()}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
