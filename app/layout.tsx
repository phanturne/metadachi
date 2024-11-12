import { GeistSans } from "geist/font/sans";
import "./globals.css";
import * as React from "react";
import AppSidebar from "@/components/app-sidebar";
import AppHeader from "@/components/app-header";
import { SidebarInset } from "@/components/ui/sidebar";
import AppProviders from "@/components/app-providers";

const defaultUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Metadachi",
  description: "AI Second Brain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AppProviders>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />
            {children}
          </SidebarInset>
        </AppProviders>
      </body>
    </html>
  );
}
