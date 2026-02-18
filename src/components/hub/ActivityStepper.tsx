import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ActivityStep {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface ActivityStepperProps {
  steps: ActivityStep[];
  activeStep: string;
}

const ActivityStepper = ({ steps, activeStep }: ActivityStepperProps) => {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-black uppercase tracking-[0.08em] text-slate-100">Offseason Activities</h2>
      <div className="no-scrollbar overflow-x-auto pb-2">
        <ul className="flex min-w-max items-center gap-2">
          {steps.map((step, index) => {
            const isActive = step.id === activeStep;
            const Icon = step.icon;

            return (
              <li key={step.id} className="flex items-center gap-2">
                <button
                  type="button"
                  className={[
                    "group flex min-w-[128px] items-center gap-2 rounded-xl border px-3 py-2 text-left transition",
                    isActive
                      ? "border-cyan-300/70 bg-gradient-to-r from-blue-500/35 to-cyan-400/10 text-white shadow-[0_0_22px_rgba(56,189,248,0.35)]"
                      : "border-white/10 bg-slate-900/55 text-slate-300 hover:border-cyan-300/40 hover:text-slate-100",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-lg border",
                      isActive
                        ? "border-cyan-200/70 bg-cyan-300/15 text-cyan-100"
                        : "border-white/15 bg-slate-950/60 text-slate-400 group-hover:text-cyan-200",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold leading-tight">{step.label}</span>
                </button>
                {index < steps.length - 1 ? <ChevronRight className="h-4 w-4 text-slate-500" /> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default ActivityStepper;
