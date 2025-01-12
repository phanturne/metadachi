import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getUser } from '@/supabase/queries/user';
import Script from 'next/script';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider
        style={
          {
            '--sidebar-width': '350px',
          } as React.CSSProperties
        }
        defaultOpen={false}
      >
        <AppSidebar user={user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
