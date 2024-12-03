"use client";

import { Clock } from "lucide-react";
import { useGetRecentItems } from "@/hooks/use-para-service";
import { useSession } from "@/hooks/use-session";
import { formatDistanceToNow } from "date-fns";

export const RecentlyVisited = () => {
  const { session } = useSession();
  const {
    data: recentItems,
    isLoading,
    error,
  } = useGetRecentItems(session?.user.id ?? "", 6);

  const containerClasses = "flex flex-col";
  const cardClasses =
    "h-18 transform rounded-lg bg-card p-4 shadow-md transition-transform hover:scale-105";

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <h2 className="mb-2 flex items-center text-sm text-gray-400">
          <Clock className="mr-2 h-4 w-4" />
          Recently visited
        </h2>
        <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={cardClasses + " animate-pulse"}>
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <h2 className="mb-2 flex items-center text-sm text-gray-400">
          <Clock className="mr-2 h-4 w-4" />
          Recently visited
        </h2>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-sm text-red-500">
            Failed to load recent items
          </div>
        </div>
      </div>
    );
  }

  if (!recentItems?.length) {
    return (
      <div className={containerClasses}>
        <h2 className="mb-2 flex items-center text-sm text-gray-400">
          <Clock className="mr-2 h-4 w-4" />
          Recently visited
        </h2>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No recently visited items yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <h2 className="mb-2 flex items-center text-sm text-gray-400">
        <Clock className="mr-2 h-4 w-4" />
        Recently visited
      </h2>
      <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {recentItems?.map((item) => (
          <div key={item.item_id} className={cardClasses}>
            <h3 className="mb-2 text-sm font-normal">{item.name}</h3>
            <p className="truncate text-xs text-gray-400">
              {item.item_type} ·{" "}
              {formatDistanceToNow(new Date(item.updated_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
