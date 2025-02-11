'use client';

import {
  Bot,
  Library,
  MessageCirclePlus,
  PencilRuler,
  Shapes,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ROUTES } from '@/utils/constants';
import { useRouter } from 'next/navigation';

const data = {
  navMain: [
    {
      title: 'Assistants',
      url: ROUTES.ASSISTANTS,
      icon: Bot,
    },
    {
      title: 'Library',
      url: ROUTES.LIBRARY,
      icon: Library,
    },
    {
      title: 'Tools',
      url: ROUTES.TOOLS,
      icon: PencilRuler,
    },
    {
      title: 'Explore',
      url: '#',
      icon: Shapes,
    },
  ],
};

export function NavMain() {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarNewChatButton />
        <div className="grid grid-cols-2 gap-2">
          {data.navMain.map((item) => (
            <SidebarMenuItem
              key={item.title}
              className="rounded-md shadow-sm transition-all duration-200 ease-in-out"
            >
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                onClick={() => router.push(item.url)}
                className={`size-full p-2 flex items-center justify-center text-center
                  ${'bg-accent hover:bg-accent/80 text-accent-foreground hover:text-accent-foreground/90 dark:bg-accent-dark dark:text-accent-foreground-dark'}`}
              >
                <a href={item.url} className="flex items-center">
                  <item.icon />
                  <span className="text-xs">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      </SidebarMenu>
    </SidebarGroup>
  );
}

const SidebarNewChatButton = () => {
  const router = useRouter();

  return (
    <SidebarMenuItem className="pb-2">
      <Button
        variant="default"
        onClick={() => router.push(ROUTES.CHAT)} // TODO: handle new chat logic properly
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary-dark dark:text-primary-foreground-dark rounded-md shadow-sm transition-all duration-200 ease-in-out"
      >
        <MessageCirclePlus />
        New Chat
      </Button>
    </SidebarMenuItem>
  );
};
