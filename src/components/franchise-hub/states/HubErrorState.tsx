import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HubErrorState({ title = "Something went wrong", description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-300/30 bg-red-950/20 p-5 text-center">
      <AlertTriangle className="mx-auto mb-2 h-5 w-5 text-red-200" aria-hidden="true" />
      <p className="text-sm font-semibold text-red-100">{title}</p>
      {description ? <p className="mt-1 text-xs text-red-200/90">{description}</p> : null}
      {onRetry ? <Button onClick={onRetry} className="mt-3" size="sm">Retry</Button> : null}
    </div>
  );
}
