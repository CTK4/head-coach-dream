import { useEffect, useMemo, useState } from "react";
import { getDraftClass, useGame } from "@/context/GameContext";
import {
  COMBINE_DEFAULT_HOURS,
  COMBINE_DEFAULT_INTERVIEW_SLOTS,
  COMBINE_FOCUS_HOURS_COST,
  COMBINE_INTERVIEW_ATTRIBUTE_BY_CATEGORY,
} from "@/engine/scouting/combineConstants";
import { useProspectProfileModal } from "@/hooks/useProspectProfileModal";
import { getPositionLabel } from "@/lib/displayLabels";
import { getDeterministicRevealRange } from "@/engine/scouting/revealRange";

const DAYS = [
  { day: 1 as const, label: "Day 1" },
  { day: 2 as const, label: "Day 2" },
  { day: 3 as const, label: "Day 3" },
  { day: 4 as const, label: "Day 4" },
  { day: 5 as const, label: "Day 5" },
];

const INT_CATS: ("IQ" | "LEADERSHIP" | "STRESS" | "CULTURAL")[] = ["IQ", "LEADERSHIP", "STRESS", "CULTURAL"];

export default function ScoutingCombine() {
  const { state, dispatch } = useGame();
  const { openProspectProfile, modal } = useProspectProfileModal(state);
  const scouting = state.scoutingState;
  const [intCat, setIntCat] = useState<"IQ" | "LEADERSHIP" | "STRESS" | "CULTURAL">("LEADERSHIP");

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
    if (scouting && !scouting.combine.generated) dispatch({ type: "SCOUT_COMBINE_GENERATE" });
  }, [dispatch, scouting]);

  const draftClass = useMemo(
    (): { id: string; name: string; pos: string }[] =>
      (getDraftClass() as any[]).map((row, i) => ({
        id: row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${i + 1}`,
        name: row.name ?? row["Name"] ?? "Unknown",
        pos: row.pos ?? row["POS"] ?? "UNK",
      })),
    [],
  );

  const topList = useMemo(() => {
    if (!scouting) return [];
    const ids = Object.keys(scouting.scoutProfiles);
    return ids
      .map((id) => ({ id, s: scouting.scoutProfiles[id], p: draftClass.find((x) => x.id === id) }))
      .filter((x) => x.p)
      .sort((a, b) => (b.s?.estCenter ?? 0) - (a.s?.estCenter ?? 0))
      .slice(0, 25);
  }, [draftClass, scouting]);

  if (!scouting) return <div className="p-4 opacity-70">Loading…</div>;

  const day = scouting.combine.day;
  const focusEnabled = day === 2 || day === 3;
  const interviewEnabled = day === 4;
  const feed = scouting.combine.feed.filter((f) => f.day === day).slice(-12).reverse();
  const recap =
    scouting.combine.recapByDay[day] ?? {
      risers: [],
      fallers: [],
      flags: [],
      focusedProspectIds: [],
      interviewedProspectIds: [],
      focusHoursSpent: 0,
      interviewsUsed: 0,
    };
  const used = Object.values(scouting.allocation.byGroup).reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, scouting.combine.hoursRemaining ?? COMBINE_DEFAULT_HOURS);
  const interviewsRemaining = Math.max(0, scouting.interviews.interviewsRemaining ?? COMBINE_DEFAULT_INTERVIEW_SLOTS);

  const formatRange = (trueScore: number, revealPct: number) => {
    const [low, high] = getDeterministicRevealRange({ trueScore, revealPct });
    return low === high ? `${low}` : `${low}–${high}`;
  };

  return (
    <div className="space-y-3 p-4">
      <div className="sticky top-[52px] z-20 rounded-lg border border-white/10 bg-black/40 p-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Combine</div>
          <div className="text-xs opacity-70">
            Combine Hours: {used}/{scouting.allocation.poolHours} (rem {remaining}) • Focus: {focusEnabled ? "ON" : "OFF"} • Interviews: {interviewEnabled ? `${interviewsRemaining} left` : "OFF"}
          </div>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {DAYS.map((d) => (
            <button
              key={d.day}
              className={`rounded border px-3 py-1 ${day === d.day ? "border-sky-400 text-sky-200" : "border-white/10"}`}
              onClick={() => dispatch({ type: "SCOUT_COMBINE_SET_DAY", payload: { day: d.day } })}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="font-semibold">Focus Drill</div>
        <div className="mt-1 text-xs opacity-70">Spend Combine Hours to tighten confidence (by position group).</div>
        {!focusEnabled ? <div className="mt-2 text-xs text-amber-300/80">Focus drill opens on Day 2 and Day 3.</div> : null}
        {remaining <= 0 ? <div className="mt-2 text-xs text-rose-300/80">No hours remaining.</div> : null}
        <div className="mt-3 space-y-2">
          {topList.map(({ id, p, s }) => {
            const alreadyFocusedToday = recap.focusedProspectIds.includes(id);
            const focusDisabled = !focusEnabled || remaining < COMBINE_FOCUS_HOURS_COST || alreadyFocusedToday;
            return (
              <div key={id} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-black/20 p-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    <button type="button" className="text-sky-300 hover:underline" onClick={() => openProspectProfile(id)}>{p.name}</button>{" "}
                    <span className="opacity-70">{getPositionLabel(p.pos)}</span>
                  </div>
                  <div className="text-xs opacity-70">Band {s.estLow}-{s.estHigh} • Conf {s.confidence}%</div>
                </div>
                <button
                  className={`rounded border px-3 py-2 ${focusDisabled ? "cursor-not-allowed border-white/10 text-white/40" : "border-sky-500 text-sky-200"}`}
                  disabled={focusDisabled}
                  onClick={() => dispatch({ type: "SCOUT_COMBINE_FOCUS", payload: { prospectId: id } })}
                >
                  {alreadyFocusedToday ? "Focused" : `Focus (-${COMBINE_FOCUS_HOURS_COST}h)`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Day 4 Interviews</div>
            <div className="text-xs opacity-70">Consumes interview slots. Improves CHAR/FIT clarity and reveals selected interview attribute.</div>
          </div>
          <div className="flex gap-2">
            {INT_CATS.map((c) => (
              <button
                key={c}
                className={`rounded border px-3 py-1 ${intCat === c ? "border-sky-400 text-sky-200" : "border-white/10"} ${interviewEnabled ? "" : "opacity-50"}`}
                disabled={!interviewEnabled}
                onClick={() => setIntCat(c)}
                title={`Reveals ${COMBINE_INTERVIEW_ATTRIBUTE_BY_CATEGORY[c]}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-1 text-xs opacity-70">{interviewEnabled ? `${interviewsRemaining} interviews left` : "Interviews open on Day 4."}</div>
        {/* STUB — Phase N: Model B focus interviews are intentionally disabled until follow-up design work lands. */}
        <button className="mt-2 rounded border border-white/10 px-3 py-1 text-xs text-white/40" disabled>
          Advanced Interview (Coming Soon)
        </button>

        <div className="mt-3 space-y-2">
          {topList.map(({ id, p, s }) => {
            const alreadyInterviewedToday = recap.interviewedProspectIds.includes(id);
            const interviewDisabled = !interviewEnabled || interviewsRemaining <= 0 || alreadyInterviewedToday;
            const reveal = scouting.interviews.modelARevealByProspectId?.[id] ?? { characterRevealPct: 0, intelligenceRevealPct: 0 };
            const trueCharacterScore = scouting.trueProfiles[id]?.trueAttributes?.character ?? 50;
            const trueIntelligenceScore = scouting.trueProfiles[id]?.trueAttributes?.intelligence ?? 50;
            const charRange = formatRange(trueCharacterScore, reveal.characterRevealPct);
            const iqRange = formatRange(trueIntelligenceScore, reveal.intelligenceRevealPct);
            return (
              <div key={id} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-black/20 p-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    <button type="button" className="text-sky-300 hover:underline" onClick={() => openProspectProfile(id)}>{p.name}</button>{" "}
                    <span className="opacity-70">{getPositionLabel(p.pos)}</span>
                  </div>
                  <div className="mt-1 text-xs opacity-80">
                    <div className="mb-1">Character Reveal: {reveal.characterRevealPct}%</div>
                    <div className="h-1.5 w-full overflow-hidden rounded bg-white/10"><div className="h-full bg-emerald-400" style={{ width: `${reveal.characterRevealPct}%` }} /></div>
                  </div>
                  <div className="mt-1 text-xs opacity-80">
                    <div className="mb-1">Football IQ Reveal: {reveal.intelligenceRevealPct}%</div>
                    <div className="h-1.5 w-full overflow-hidden rounded bg-white/10"><div className="h-full bg-sky-400" style={{ width: `${reveal.intelligenceRevealPct}%` }} /></div>
                  </div>
                  <div className="mt-1 text-xs opacity-70">
                    Character: {charRange} • Football IQ: {iqRange} • Leadership: {s.revealed.leadershipTag ?? "—"}
                  </div>
                </div>
                <button
                  className={`rounded border px-3 py-2 ${interviewDisabled ? "cursor-not-allowed border-white/10 text-white/40" : "border-amber-500 text-amber-200"}`}
                  disabled={interviewDisabled}
                  onClick={() => dispatch({ type: "SCOUT_COMBINE_INTERVIEW", payload: { prospectId: id, category: intCat } })}
                >
                  {alreadyInterviewedToday ? "Interviewed" : `Interview (${COMBINE_INTERVIEW_ATTRIBUTE_BY_CATEGORY[intCat]})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="font-semibold">Live Metric Feed</div>
        <div className="mt-2 space-y-2">
          {feed.length ? (
            feed.map((i) => (
              <div key={i.id} className="rounded border border-white/10 bg-black/20 p-2 text-sm">
                {i.text}
              </div>
            ))
          ) : (
            <div className="text-sm opacity-70">No events yet.</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="font-semibold">Recap</div>
        <div className="mt-2 text-sm">
          <div className="opacity-70">Risers: {(recap.risers ?? []).slice(0, 5).join(", ") || "—"}</div>
          <div className="opacity-70">Fallers: {(recap.fallers ?? []).slice(0, 5).join(", ") || "—"}</div>
          <div className="opacity-70">New flags: {(recap.flags ?? []).slice(0, 5).join(", ") || "—"}</div>
          <div className="opacity-70">Focus actions: {recap.focusedProspectIds.length} • Hours spent: {recap.focusHoursSpent}</div>
          <div className="opacity-70">Interviews completed: {recap.interviewedProspectIds.length}</div>
        </div>
      </div>
      {modal}
    </div>
  );
}
