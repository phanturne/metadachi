import { MoreHorizontal, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import CalendarCard from "./calendar-card";

export const UpcomingEvents = () => (
  <div className="flex h-full flex-col">
    <div className="mb-2 flex items-center justify-between">
      <h2 className="flex items-center text-sm text-gray-400">
        <Calendar className="mr-2 h-4 w-4" />
        Upcoming events
      </h2>
      <Button variant="ghost" size="sm" className="text-gray-400">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
    <div className="max-h-72 flex-grow overflow-y-auto">
      <CalendarCard />
    </div>
  </div>
);
