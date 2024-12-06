import AppSidebar from "@/components/dashboard/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import AppHeader from "@/components/app-header";
import * as React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </>
  );
}
