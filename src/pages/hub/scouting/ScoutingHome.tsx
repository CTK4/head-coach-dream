import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";

interface Module {
  title: string;
  desc: string;
  to: string;
  unlockNote: string;
  locked: (stage: string) => boolean;
}

const MODULES: Module[] = [
  {
    title: "Big Board",
    desc: "Tiers, ordering, and prospect profiles.",
    to: "/scouting/big-board",
    unlockNote: "Always viewable. Editing enabled during scouting phases.",
    locked: () => false,
  },
  {
    title: "Combine",
    desc: "Day tabs, feed, buzz, recap.",
    to: "/scouting/combine",
    unlockNote: "Available during the Combine phase only.",
    locked: (stage) => stage !== "COMBINE",
  },
  {
    title: "Private Workouts",
    desc: "Spend visits for focused clarity gains.",
    to: "/scouting/private-workouts",
    unlockNote: "Available during Pre-Draft and Combine scouting windows.",
    locked: (stage) => !["COMBINE", "PRE_DRAFT"].includes(stage),
  },
  {
    title: "Interviews",
    desc: "IQ/Leadership/Stress/Cultural slots.",
    to: "/scouting/interviews",
    unlockNote: "Available during Combine (Day 4) and Pre-Draft phases.",
    locked: (stage) => !["COMBINE", "PRE_DRAFT"].includes(stage),
  },
  {
    title: "Medical Board",
    desc: "Clarity-gated medical intel and flags.",
    to: "/scouting/medical",
    unlockNote: "Available during Combine, Free Agency, and Pre-Draft phases.",
    locked: (stage) => !["COMBINE", "PRE_DRAFT", "FREE_AGENCY"].includes(stage),
  },
  {
    title: "Scout Allocation",
    desc: "Distribute hours by position group.",
    to: "/scouting/allocation",
    unlockNote: "Available during the Combine phase.",
    locked: (stage) => stage !== "COMBINE",
  },
  {
    title: "In-Season Scouting",
    desc: "Weekly film updates + regional focus.",
    to: "/scouting/in-season",
    unlockNote: "Available during the Regular Season only.",
    locked: (stage) => stage !== "REGULAR_SEASON",
  },
];

export default function ScoutingHome() {
  const { state } = useGame();
  const nav = useNavigate();
  const stage = state.careerStage as string;
  const [lockedSheet, setLockedSheet] = useState<Module | null>(null);

  return (
    <div className="space-y-3 p-4 pb-24">
      <div className="text-xs opacity-50">Phase: {stage}</div>
      {MODULES.map((mod) => {
        const isLocked = mod.locked(stage);
        return (
          <button
            key={mod.to}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
            onClick={() => (isLocked ? setLockedSheet(mod) : nav(mod.to))}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold">{mod.title}</div>
              {isLocked && (
                <span className="shrink-0 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                  LOCKED
                </span>
              )}
            </div>
            <div className="mt-1 text-xs opacity-70">{mod.desc}</div>
          </button>
        );
      })}

      {lockedSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/70"
          onClick={() => setLockedSheet(null)}
        >
          <div
            className="w-full rounded-t-2xl border border-white/10 bg-slate-950 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{lockedSheet.title}</div>
                <div className="mt-1 text-sm opacity-70">
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">LOCKED</span>
                </div>
              </div>
              <button
                className="rounded border border-white/10 px-3 py-1 text-sm"
                onClick={() => setLockedSheet(null)}
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-sm opacity-80">{lockedSheet.unlockNote}</p>
            <p className="mt-1 text-xs opacity-50">Current phase: {stage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

