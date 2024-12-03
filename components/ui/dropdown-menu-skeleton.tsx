
import { DropdownMenuContent } from "./dropdown-menu";
import { Skeleton } from "./skeleton";

export function DropdownMenuSkeleton() {
  return (
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <div className="p-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </div>
      </div>
      <div className="my-2 h-px bg-muted" />
      <div className="p-2 space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="my-2 h-px bg-muted" />
      <div className="p-2">
        <Skeleton className="h-8 w-full" />
      </div>
    </DropdownMenuContent>
  );
}