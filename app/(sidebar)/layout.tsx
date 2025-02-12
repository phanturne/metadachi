import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getUser } from '@/supabase/queries/user';

export default async function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="h-full overflow-hidden">
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="h-[calc(100svh-16px)] rounded-lg">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
