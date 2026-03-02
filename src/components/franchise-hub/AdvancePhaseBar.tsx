import { hubTheme } from "@/components/franchise-hub/theme";

type AdvancePhaseBarProps = {
  nextLabel: string;
  onAdvance: () => void;
};

export function AdvancePhaseBar({ nextLabel, onAdvance }: AdvancePhaseBarProps) {
  return (
    <button type="button" onClick={onAdvance} aria-label="Advance to next phase" className={`${hubTheme.advanceBar} w-full`}>
      <div className="text-4xl font-bold tracking-wide text-slate-100">ADVANCE TO NEXT PHASE →</div>
      <div className="text-2xl text-slate-200/90">Next: {nextLabel}</div>
    </button>
  );
}
