import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HubEmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: ReactNode; action?: { label: string; onClick?: () => void; to?: string } }) {
  const actionButton = action ? (
    <Button onClick={action.onClick} asChild={!!action.to} className="mt-3">
      {action.to ? <Link to={action.to}>{action.label}</Link> : <span>{action.label}</span>}
    </Button>
  ) : null;

  return (
    <div className="rounded-lg border border-slate-300/20 bg-slate-900/40 p-6 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/20 bg-slate-800/70 text-slate-100">{icon ?? <Inbox className="h-5 w-5" aria-hidden="true" />}</div>
      <h3 className="text-sm font-semibold tracking-wide text-slate-100">{title}</h3>
      {description ? <p className="mt-1 text-xs text-slate-300">{description}</p> : null}
      {actionButton}
    </div>
  );
}
