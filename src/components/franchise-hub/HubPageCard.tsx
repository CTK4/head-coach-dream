import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HubPageCard({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 border-slate-300/15 bg-slate-950/35">
      <CardHeader className="space-y-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-slate-100">
          <span className="tracking-normal">{title}</span>
          {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
        </CardTitle>
        {subtitle ? <div className="text-sm text-slate-200/70">{subtitle}</div> : null}
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}
