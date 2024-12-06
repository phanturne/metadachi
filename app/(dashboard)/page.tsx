"use client";

import { ProjectsBoard } from "@/components/projects/projects-board";
import { AreasGrid } from "@/components/areas/areas-grid";
import { ResourcesGrid } from "@/components/resources/resources-grid";
import { UpcomingEvents } from "@/components/tasks/upcoming-events";
import { UpcomingTasks } from "@/components/tasks/upcoming-tasks";
import { NotesGrid } from "@/components/notes/notes-grid";
import { QuickActions } from "@/components/quick-actions";
import { RecentlyVisited } from "@/components/dashboard/recently-visited";
import { InboxComponent } from "@/components/dashboard/inbox-component";
import { getTimeBasedGreeting } from "@/app/utils/time";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { Routes } from "@/utils/constants";
import { useGetProfile } from "@/hooks/use-profile-service";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);

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

  const { data: profile } = useGetProfile(session?.user.id || "");

  return (
    <>
      <div className="m-auto flex h-full max-w-[90%] flex-1 flex-col gap-8 pb-20 pt-0 sm:max-w-[90%] sm:px-4 md:max-w-[90%] md:px-6 lg:max-w-5xl lg:px-8 xl:max-w-6xl">
        <h1 className="text-center text-3xl font-bold">
          {getTimeBasedGreeting()}, {profile?.display_name || profile?.username}
        </h1>

        <RecentlyVisited />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UpcomingEvents />
          <UpcomingTasks />
        </div>
        <InboxComponent />
        <ProjectsBoard />
        <AreasGrid />
        <ResourcesGrid />
        <NotesGrid />
      </div>
      <QuickActions />
    </>
  );
}
