"use client";

import {
  Archive,
  Bell,
  Bot,
  Brain,
  ChevronRight,
  ChevronsUpDown,
  Flame,
  FolderOpenDot,
  Home,
  LandPlot,
  Leaf,
  LifeBuoy,
  LogOut,
  MoreHorizontal,
  Notebook,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  User,
  WalletCards,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogHeader } from "next/dist/client/components/react-dev-overlay/internal/components/Dialog";
import { Button } from "@/components/ui/button";

const data = {
  user: {
    name: "Kevin Ding",
    email: "kding60@gatech.edu",
    avatar: "",
  },
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Ask AI",
      url: "#",
      icon: Sparkles,
    },
    {
      title: "Home",
      url: "#",
      icon: Home,
      isActive: true,
    },
  ],
  navFavorites: [
    {
      title: "Georgia Tech Notes",
      url: "#",
      icon: Notebook,
    },
    {
      title: "HCI HW #1 Rough Draft",
      url: "#",
      icon: Notebook,
    },
    {
      title: "How to Get a Job at Google: A Complete Guide",
      url: "#",
      icon: Notebook,
    },
    {
      title: "More",
      url: "#",
      icon: MoreHorizontal,
    },
  ],
  navWorkspace: [
    {
      title: "Projects",
      url: "#",
      icon: FolderOpenDot,
      isActive: true,
      items: [
        {
          title: "Learn Python",
          url: "#",
        },
        {
          title: "Trip to Japan",
          url: "#",
        },
        {
          title: "Get AI/ML Job",
          url: "#",
        },
      ],
    },
    {
      title: "Areas",
      url: "#",
      icon: LandPlot,
      items: [
        {
          title: "Personal",
          url: "#",
        },
        {
          title: "Health & Fitness",
          url: "#",
        },
        {
          title: "Finance",
          url: "#",
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      icon: Leaf,
      items: [
        {
          title: "LLM Comparisons",
          url: "#",
        },
        {
          title: "Grokking the Coding Interview",
          url: "#",
        },
        {
          title: "Cooking Handbook",
          url: "#",
        },
        {
          title: "AI for Everyone",
          url: "#",
        },
      ],
    },
    {
      title: "AI Chats",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "How to cheat on your HW",
          url: "#",
        },
        {
          title: "Create a chatbot",
          url: "#",
        },
        {
          title: "How many R's in strawberry",
          url: "#",
        },
        {
          title: "Stock market analysis",
          url: "#",
        },
      ],
    },
    {
      title: "Archive",
      url: "#",
      icon: Archive,
      items: [
        {
          title: "Cat Pictures",
          url: "#",
        },
        {
          title: "Python for Beginners",
          url: "#",
        },
        {
          title: "HCI HW #1 Rough Draft",
          url: "#",
        },
        {
          title: "Random Notes",
          url: "#",
        },
      ],
    },
  ],
  navTools: [
    {
      title: "Habit Tracker",
      url: "#",
      icon: Flame,
    },
    {
      title: "Flashcards",
      url: "#",
      icon: WalletCards,
    },
    {
      title: "More",
      url: "#",
      icon: MoreHorizontal,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
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
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Plus className="size-4" />
                  <span className="sr-only">Add new item</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                  <DialogDescription>
                    Create a new item to add.
                  </DialogDescription>
                </DialogHeader>
                {/* Add your form or content for the modal here */}
                <div className="mt-4">
                  <Button onClick={() => setIsModalOpen(false)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavMain() {
  return (
    <SidebarMenu>
      {data.navMain.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild tooltip={item.title}>
            <a href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
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
        {data.navFavorites.map((item) => (
          <Collapsible key={item.title} asChild>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon /> <span>{item.title}</span>{" "}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavWorkspace() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {data.navWorkspace.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
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
              <SidebarMenuButton asChild size="sm">
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
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
          <Collapsible key={item.title} asChild>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function AppFooter() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserInfoCard />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <ProfileMenuContent />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function UserInfoCard() {
  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={data.user.avatar} alt={data.user.name} />
        <AvatarFallback className="rounded-lg">KD</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{data.user.name}</span>
        <span className="truncate text-xs">{data.user.email}</span>
      </div>
    </>
  );
}

export function ProfileMenuContent() {
  return (
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfoCard />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell />
          Notifications
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
