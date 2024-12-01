import { Clock } from "lucide-react";

export const RecentlyVisited = () => (
  <div className="flex h-full flex-col">
    <h2 className="mb-2 flex items-center text-sm text-gray-400">
      <Clock className="mr-2 h-4 w-4" />
      Recently visited
    </h2>
    <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {[
        "Home",
        "Resources",
        "Second Brain (1)",
        "New Note",
        "Notes",
        "Inbox",
      ].map((item, index) => (
        <div
          key={index}
          className="transform rounded-lg bg-card p-4 shadow-md transition-transform hover:scale-105"
        >
          <h3 className="mb-2 text-sm font-normal">{item}</h3>
          <p className="text-xs text-gray-400">
            K · {["1w", "3w", "3w", "1m", "1m", "3w"][index]} ago
          </p>
        </div>
      ))}
    </div>
  </div>
);
