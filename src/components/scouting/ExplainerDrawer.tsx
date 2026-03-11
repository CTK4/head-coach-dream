import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { ModelCardConfig } from "@/engine/scouting/modelCards";

type Props = {
  card: ModelCardConfig;
  className?: string;
};

export function ExplainerDrawer({ card, className = "" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`Open ${card.title} explainer`}
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-sky-400/50 text-[11px] leading-none text-sky-200 hover:bg-sky-500/15 ${className}`}
        onClick={() => setOpen(true)}
      >
        ⓘ
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-slate-950 px-4 pb-6 pt-3 text-slate-100">
          <DrawerHeader className="px-0">
            <DrawerTitle>{card.title}</DrawerTitle>
          </DrawerHeader>

          <p className="text-sm text-slate-300">{card.description}</p>

          <section className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">Factors</h3>
            {card.factors.map((factor) => (
              <div key={factor.name} className="rounded border border-white/10 bg-black/20 p-2 text-xs">
                <div className="font-semibold text-sky-200">{factor.name}</div>
                {factor.weight ? <div className="opacity-80">Weight: {factor.weight}</div> : null}
                <div className="opacity-80">{factor.direction}</div>
                <div className="mt-1 opacity-90">{factor.details}</div>
              </div>
            ))}
          </section>

          <section className="mt-4">
            <h3 className="text-sm font-semibold text-slate-100">Summary buckets</h3>
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              {card.tiers.map((tier) => (
                <span key={tier} className="rounded border border-white/15 px-2 py-1">
                  {tier}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-4 space-y-2">
            <h3 className="text-sm font-semibold text-slate-100">Examples</h3>
            {card.examples.map((example) => (
              <div key={example.title} className="rounded border border-emerald-500/25 bg-emerald-500/10 p-2 text-xs">
                <div className="font-semibold text-emerald-200">{example.title}</div>
                <div className="mt-1 opacity-90">Before: {example.before}</div>
                <div className="opacity-90">After: {example.after}</div>
                <div className="mt-1 text-emerald-100">{example.result}</div>
              </div>
            ))}
          </section>
        </DrawerContent>
      </Drawer>
    </>
  );
}
