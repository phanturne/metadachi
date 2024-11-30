"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "../ui/calendar";

const CalendarCard = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="-p-3"
              classNames={{
                months: "space-y-2",
                month: "space-y-2",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                  "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-1",
                cell: "text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
          <div className="w-full md:w-1/2 md:border-l-2 md:border-border md:pl-6">
            <h4 className="mb-4 text-lg font-semibold">
              Events for{" "}
              {date
                ? `${date.getMonth() + 1}/${date.getDate()}`
                : "Selected Date"}
            </h4>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Coming Soon</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;re working on bringing you calendar events. Stay
                    tuned for updates!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarCard;
