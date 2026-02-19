import type { ReactNode } from "react";
import { HUB_CARD } from "@/components/franchise-hub/theme";

export function HubPanel({ title, badge, children, footer, className = "" }: { title?: string; badge?: ReactNode; children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <section className={`${HUB_CARD} ${className}`}>
      {title ? (
        <div className="flex items-center justify-between border-b border-slate-300/15 px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">{title}</h2>
          {badge}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
      {footer ? <div className="border-t border-slate-300/15 px-4 py-3">{footer}</div> : null}
    </section>
  );
}
