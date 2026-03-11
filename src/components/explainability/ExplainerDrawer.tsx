import * as React from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export type ExplainerFactor = {
  label: string;
  weight?: string;
  description: string;
};

export type ExplainerDrawerProps = {
  title: string;
  description: string;
  factors: ExplainerFactor[];
  example?: string;
  trigger: React.ReactNode;
  triggerAriaLabel: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ExplainerDrawer({
  title,
  description,
  factors,
  example,
  trigger,
  triggerAriaLabel,
  open,
  onOpenChange,
}: ExplainerDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild aria-label={triggerAriaLabel}>
        {trigger}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] overflow-y-auto px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
        <DrawerHeader className="px-0 pb-3 text-left">
          <DrawerTitle className="text-base sm:text-lg">{title}</DrawerTitle>
          <DrawerDescription className="text-xs leading-relaxed sm:text-sm">{description}</DrawerDescription>
        </DrawerHeader>

        <section className="space-y-2.5" aria-label={`${title} factors`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top factors</h3>
          <ul className="space-y-2">
            {factors.map((factor) => (
              <li key={`${factor.label}-${factor.weight ?? "base"}`} className="rounded-md border bg-card/60 p-2.5 sm:p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-5">{factor.label}</p>
                  {factor.weight ? (
                    <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {factor.weight}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{factor.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {example ? (
          <section className="mt-3.5 rounded-md border border-dashed bg-muted/30 p-2.5 sm:mt-4 sm:p-3" aria-label="Example">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example</h3>
            <p className="text-xs leading-relaxed sm:text-sm">{example}</p>
          </section>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
