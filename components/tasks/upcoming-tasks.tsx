import { ListChecks, MoreHorizontal, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const UpcomingTasks = () => (
  <div className="flex h-full flex-col">
    <div className="mb-2 flex items-center justify-between">
      <h2 className="flex items-center text-sm text-gray-400">
        <ListChecks className="mr-2 h-4 w-4" />
        Upcoming tasks
      </h2>
      <Button variant="ghost" size="sm" className="text-gray-400">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-grow items-center justify-center">
        <div className="text-center">
          <Rocket className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;re working on bringing you the latest updates on your
            upcoming tasks.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
);
