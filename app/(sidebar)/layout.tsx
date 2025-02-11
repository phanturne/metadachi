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
    <>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset className="rounded-lg">{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
