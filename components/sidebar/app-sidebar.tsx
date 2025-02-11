'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';

import { NavMain } from '@/components/sidebar/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { GetUserReturn } from '@/supabase/queries/user';
import { ROUTES } from '@/utils/constants';
import { NavHistory } from './nav-history';
import { NavSupport } from './nav-support';

export function AppSidebar({
  user,
  ...props
}: { user: GetUserReturn } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-between items-center">
            <SidebarMenuButton size="lg" asChild>
              <a
                href={ROUTES.HOME}
                className="flex w-full items-center justify-between"
              >
                <div className="flex aspect-square size-8 items-center bg-sidebar-primary justify-center rounded-lg text-sidebar-primary-foreground">
                  {/* <Image
                    src="/metadachi.svg"
                    alt="Metadachi Icon"
                    width={20}
                    height={20}
                  /> */}
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Metadachi</span>
                </div>
              </a>
            </SidebarMenuButton>
            {/* <Button
              variant="ghost"
              type="button"
              className="size-8"
              onClick={() => {
                // TODO: Handle search
              }}
            >
              <Search />
            </Button> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <NavMain />

      <SidebarContent>
        <NavHistory user={user.user} />
        {/* <NavSecondary className="mt-auto" /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavSupport />
      </SidebarFooter>
    </Sidebar>
  );
}
