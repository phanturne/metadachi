import { FolderOpenDot, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ProjectItemDialog from "./project-item-dialog";
import { useGetProjectsByStatus } from "@/hooks/use-projects-service";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import ProjectItem from "./project-item";

export const ProjectsBoard = () => {
  const [open, setOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<string>("active");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/sign-in");
      } else {
        setUserId(session.user.id);
      }
      setIsLoadingSession(false);
    };
    loadSession();
  }, [supabase, router]);

  const {
    data: onHoldProjects,
    isLoading: isLoadingOnHold,
    error: errorOnHold,
  } = useGetProjectsByStatus(userId || "", "on hold");
  const {
    data: activeProjects,
    isLoading: isLoadingActive,
    error: errorActive,
  } = useGetProjectsByStatus(userId || "", "active");
  const {
    data: completedProjects,
    isLoading: isLoadingCompleted,
    error: errorCompleted,
  } = useGetProjectsByStatus(userId || "", "completed");

  if (
    isLoadingSession ||
    isLoadingOnHold ||
    isLoadingActive ||
    isLoadingCompleted
  ) {
    return (
      <Card className="flex h-[50vh] items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Loading projects...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (errorOnHold || errorActive || errorCompleted) {
    return (
      <Card className="flex h-[50vh] items-center justify-center bg-destructive/5">
        <CardContent className="p-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-xl text-destructive">
            Error loading projects
          </CardTitle>
          <p className="mt-2 text-destructive-foreground">
            {errorOnHold?.message ||
              errorActive?.message ||
              errorCompleted?.message ||
              "An unexpected error occurred."}
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    { status: "On Hold", color: "bg-yellow-600", projects: onHoldProjects },
    { status: "Active", color: "bg-blue-600", projects: activeProjects },
    { status: "Completed", color: "bg-green-600", projects: completedProjects },
  ];

  return (
    <>
      <div className="flex h-full flex-col">
        <h2 className="mb-4 flex items-center text-sm text-gray-400">
          <FolderOpenDot className="mr-2 h-4 w-4" />
          Projects
        </h2>
        <div className="grid max-h-72 flex-grow grid-cols-1 gap-4 overflow-y-auto md:grid-cols-3">
          {columns.map((column, index) => (
            <div key={index} className="rounded-xl bg-card p-6 shadow-md">
              <div className="mb-4 flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${column.color}`}></span>
                <span>{column.status}</span>
                <span className="text-gray-400">{column.projects?.length}</span>
              </div>
              <div className="space-y-4">
                {column.projects?.map((project, projectIndex) => (
                  <ProjectItem key={projectIndex} project={project} />
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400"
                  onClick={() => {
                    setDefaultStatus(column.status.toLowerCase());
                    setOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New project
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProjectItemDialog
        open={open}
        onOpenChange={setOpen}
        defaultStatus={defaultStatus}
      />
    </>
  );
};
