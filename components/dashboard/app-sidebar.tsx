"use client";

import {
  Brain,
  ChevronsUpDown,
  Flame,
  Home,
  LifeBuoy,
  LucideTrash2,
  MoreHorizontal,
  Search,
  Send,
  Sparkles,
  Telescope,
  WalletCards,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSearchDialog } from "@/providers/search-dialog-provider";
import { ProfileMenu } from "@/components/profile/profile-menu";
import { useSession } from "@/hooks/use-session";
import { useGetProfile } from "@/hooks/use-profile-service";
import { UserInfoCard } from "@/components/shared/user-info-card";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Routes } from "@/utils/constants";
import { Session } from "@supabase/supabase-js";
import ProjectItems from "@/components/sidebar/sidebar-projects";
import AreaItems from "@/components/sidebar/sidebar-areas";
import ResourceItems from "@/components/sidebar/sidebar-resources";
import NoteItems from "@/components/sidebar/sidebar-notes";

const data = {
  navMain: [
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
    },
    {
      title: "Search",
      icon: Search,
      disabled: true,
    },
    {
      title: "Ask AI",
      url: "#",
      icon: Sparkles,
      disabled: true,
    },
    {
      title: "Explore",
      url: "#",
      icon: Telescope,
      disabled: true,
    },
  ],
  navTools: [
    {
      title: "Habit Tracker",
      url: "#",
      icon: Flame,
      disabled: true,
    },
    {
      title: "Flashcards",
      url: "#",
      icon: WalletCards,
      disabled: true,
    },
    {
      title: "More",
      url: "#",
      icon: MoreHorizontal,
      disabled: true,
    },
  ],
  navSecondary: [
    {
      title: "Trash",
      icon: LucideTrash2,
      disabled: true,
    },
    {
      title: "Support",
      icon: LifeBuoy,
      disabled: true,
    },
    {
      title: "Feedback",
      icon: Send,
      disabled: true,
    },
  ],
};

export default function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <AppSidebarMenu />
        <NavMain />
      </SidebarHeader>

      <SidebarContent>
        <NavFavorites />
        <NavWorkspace />
        <NavTools />
        <NavSecondary />
      </SidebarContent>
      <SidebarFooter>
        <AppFooter />
      </SidebarFooter>
    </Sidebar>
  );
}

function AppSidebarMenu() {
  // const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <a href="#" className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Brain className="size-5" />
              </div>
              <div className="ml-3 grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Metadachi</span>
              </div>
            </div>
            {/*<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>*/}
            {/*  <DialogTrigger asChild>*/}
            {/*    <Button variant="ghost" size="icon" className="ml-2">*/}
            {/*      <Plus className="size-4" />*/}
            {/*      <span className="sr-only">Add new item</span>*/}
            {/*    </Button>*/}
            {/*  </DialogTrigger>*/}
            {/*  <DialogContent>*/}
            {/*    <DialogHeader>*/}
            {/*      <DialogTitle>Add New Item</DialogTitle>*/}
            {/*      <DialogDescription>*/}
            {/*        Create a new item to add.*/}
            {/*      </DialogDescription>*/}
            {/*    </DialogHeader>*/}
            {/*    /!* Add your form or content for the modal here *!/*/}
            {/*    <div className="mt-4">*/}
            {/*      <Button onClick={() => setIsModalOpen(false)}>Close</Button>*/}
            {/*    </div>*/}
            {/*  </DialogContent>*/}
            {/*</Dialog>*/}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavMain() {
  const { setOpen } = useSearchDialog();

  const handleNavClick = (title: string) => {
    if (title === "Search") {
      setOpen(true);
    }
  };

  return (
    <SidebarMenu>
      {data.navMain.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.url ? (
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              disabled={item.disabled}
            >
              <a
                href={item.url}
                className={
                  item.disabled ? "pointer-events-none opacity-50" : ""
                }
              >
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              onClick={() => handleNavClick(item.title)}
              disabled={item.disabled}
            >
              <button>
                <item.icon />
                <span>{item.title}</span>
              </button>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function NavFavorites() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <span className="text-sm">No favorites yet</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavWorkspace() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const supabase = createClient();

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

  const userId = session?.user.id || "";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        <ProjectItems userId={userId} />
        <AreaItems userId={userId} />
        <ResourceItems userId={userId} />
        <NoteItems userId={userId} />
        {/* AI Chats and Archive sections remain unchanged */}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavSecondary() {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          {data.navSecondary.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton size="sm" disabled={item.disabled}>
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavTools() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tools</SidebarGroupLabel>
      <SidebarMenu>
        {data.navTools.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild size="sm" disabled={item.disabled}>
              <a href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function AppFooter() {
  const { session } = useSession();
  const { data: profile } = useGetProfile(session?.user.id || "");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserInfoCard
                avatar={profile?.avatar_url}
                name={profile?.display_name || ""}
                email={session?.user.email || ""}
              />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <ProfileMenu />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
