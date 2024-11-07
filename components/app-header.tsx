"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useScroll } from "@/hooks/use-scroll";
import { ProfileMenu } from "@/components/profile/profile-menu";

const data = {
  user: {
    name: "Kevin Ding",
    email: "kding60@gatech.edu",
    avatar: "",
  },
};

export default function AppHeader() {
  const isScrolled = useScroll();

  return (
    <header
      className={`sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 p-4 ${
        isScrolled
          ? "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        {/*<AppBreadcrumb />*/}
      </div>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        {/*<Button variant="ghost" size="icon">*/}
        {/*  <Bell className="h-5 w-5" />*/}
        {/*</Button>*/}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={data.user.avatar} alt={data.user.name} />
                <AvatarFallback>KD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <ProfileMenu />
        </DropdownMenu>
      </div>
    </header>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AppBreadcrumb() {
  return (
    <>
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>Inbox</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
