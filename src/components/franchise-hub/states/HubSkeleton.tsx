import { Skeleton } from "@/components/ui/skeleton";
import { HUB_CARD } from "@/components/franchise-hub/theme";

export function HubSkeleton({ variant = "page", rows = 4, className = "" }: { variant?: "page" | "panel" | "table"; rows?: number; className?: string }) {
  if (variant === "panel") return <Skeleton className={`h-32 w-full ${className}`} />;
  return (
    <div className={`space-y-4 ${className}`}>
      <Skeleton className="h-8 w-56" />
      <div className={`${HUB_CARD} p-4 space-y-3`}>
        {Array.from({ length: variant === "table" ? Math.max(6, rows) : rows }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      <div className={`${HUB_CARD} p-4`}>
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
