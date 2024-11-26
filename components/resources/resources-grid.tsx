import { AlertCircle, Bookmark, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ResourceItem from "@/components/resources/resource-item";
import { useGetUserResources } from "@/hooks/use-resources-service";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import ResourceItemDialog from "./resource-item-dialog";

export function ResourcesGrid() {
  const [open, setOpen] = useState(false);
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
    data: resources,
    isLoading,
    error,
  } = useGetUserResources(userId || "");

  if (isLoadingSession || isLoading) {
    return (
      <Card className="flex h-[50vh] items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center p-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Loading resources...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-[50vh] items-center justify-center bg-destructive/5">
        <CardContent className="p-4 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-xl text-destructive">
            Error loading resources
          </CardTitle>
          <p className="mt-2 text-destructive-foreground">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
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

  return (
    <>
      <div className="flex h-full flex-col">
        <h2 className="mb-4 flex items-center text-sm text-muted-foreground">
          <Bookmark className="mr-2 h-4 w-4" />
          Resources
        </h2>
        <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {resources?.map((resource, index) => (
            <ResourceItem key={index} resource={resource} />
          ))}
          <Button
            variant="outline"
            className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-transform hover:scale-105"
            onClick={() => setOpen(true)}
          >
            <Plus className="mb-2 h-6 w-6 text-muted-foreground transition-transform hover:scale-110" />
            <span className="text-muted-foreground">New resource</span>
          </Button>
        </div>
      </div>
      <ResourceItemDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
