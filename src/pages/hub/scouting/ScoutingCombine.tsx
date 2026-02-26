import { useEffect, useMemo, useState } from "react";
import { getDraftClass, useGame } from "@/context/GameContext";
import { COMBINE_DEFAULT_INTERVIEW_TOKENS, COMBINE_FOCUS_HOURS_COST, COMBINE_INTERVIEW_ATTRIBUTE_BY_CATEGORY } from "@/engine/scouting/combineConstants";
import { useProspectProfileModal } from "@/hooks/useProspectProfileModal";
import { getPositionLabel } from "@/lib/displayLabels";
import { getDeterministicRevealRange } from "@/engine/scouting/revealRange";

const DAYS = [
  { day: 1 as const, label: "Day 1" },
  { day: 2 as const, label: "Day 2" },
  { day: 3 as const, label: "Day 3" },
  { day: 4 as const, label: "Day 4" },
];
type TabId = "ALL" | "SHORTLIST" | "NOTES";
type CombineProspectState = { notes: string };

type DraftProspectLite = {
  id: string;
  name: string;
  pos: string;
  school: string;
  age: string;
};

const DAY_BUCKETS: Record<number, { label: string; positions: string[] }> = {
  1: { label: "Backfield", positions: ["QB", "RB", "FB"] },
  2: { label: "TE / Secondary", positions: ["TE", "WR", "CB", "FS", "SS", "S", "DB"] },
  3: { label: "Trenches", positions: ["OT", "OG", "C", "OL", "DE", "DT", "NT", "DL", "EDGE", "MLB", "ILB", "OLB", "LB"] },
  4: { label: "Specialists", positions: ["K", "P", "LS", "ATH", "UNK"] },
};

const TABS: { id: TabId; label: string }[] = [
  { id: "ALL", label: "All Prospects" },
  { id: "SHORTLIST", label: "Interview Shortlist" },
  { id: "NOTES", label: "Notes" },
];

const medicalToneByTier: Record<string, string> = {
  GREEN: "text-emerald-200 border-emerald-500/40",
  YELLOW: "text-amber-200 border-amber-500/40",
  ORANGE: "text-orange-200 border-orange-500/40",
  RED: "text-rose-200 border-rose-500/40",
  BLACK: "text-rose-100 border-rose-600/60",
};

function getDayBucketForPos(pos: string): 1 | 2 | 3 | 4 {
  const normalized = String(pos ?? "UNK").toUpperCase();
  if (DAY_BUCKETS[1].positions.includes(normalized)) return 1;
  if (DAY_BUCKETS[2].positions.includes(normalized)) return 2;
  if (DAY_BUCKETS[3].positions.includes(normalized)) return 3;
  return 4;
}

function barTone(value: number) {
  if (value >= 70) return "bg-emerald-400";
  if (value >= 40) return "bg-amber-400";
  return "bg-rose-400";
}

export default function ScoutingCombine() {
  const { state, dispatch } = useGame();
  const { openProspectProfile, modal } = useProspectProfileModal(state);
  const scouting = state.scoutingState;
  const [activeTab, setActiveTab] = useState<TabId>("ALL");
  const [notesByProspect, setNotesByProspect] = useState<Record<string, CombineProspectState>>({});

  useEffect(() => {
    if (!scouting) dispatch({ type: "SCOUT_INIT" });
    if (scouting && !scouting.combine.generated) dispatch({ type: "SCOUT_COMBINE_GENERATE" });
  }, [dispatch, scouting]);

  useEffect(() => {
    const persisted = globalThis.localStorage?.getItem(`combine-notes:${state.saveSeed}`);
    if (!persisted) return;
    try {
      setNotesByProspect(JSON.parse(persisted));
    } catch {
      setNotesByProspect({});
    }
  }, [state.saveSeed]);

  useEffect(() => {
    globalThis.localStorage?.setItem(`combine-notes:${state.saveSeed}`, JSON.stringify(notesByProspect));
  }, [notesByProspect, state.saveSeed]);

  const draftClass = useMemo(
    (): DraftProspectLite[] =>
      (getDraftClass() as any[]).map((row, i) => ({
        id: row.id ?? row.prospectId ?? row["Player ID"] ?? `DC_${i + 1}`,
        name: row.name ?? row["Name"] ?? "Unknown",
        pos: String(row.pos ?? row["POS"] ?? "UNK").toUpperCase(),
        school: row.school ?? row.college ?? row["School"] ?? row["College"] ?? "Unknown School",
        age: String(row.age ?? row["Age"] ?? "—"),
      })),
    [],
  );

  const draftById = useMemo(() => new Map(draftClass.map((row) => [row.id, row])), [draftClass]);

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
  const remaining = Math.max(0, scouting.allocation.poolHours - used);
  const currentDay = Math.min(scouting.combine.day, 4);
  const interviewsRemaining = Math.max(0, scouting.interviews.interviewsRemaining ?? COMBINE_DEFAULT_INTERVIEW_TOKENS);

  const allProspects = Object.keys(scouting.scoutProfiles)
    .map((id, index) => {
      const draft = draftById.get(id);
      const profile = scouting.scoutProfiles[id];
      const metrics = scouting.combine.resultsByProspectId[id];
      if (!draft || !profile) return null;
      return {
        id,
        draft,
        profile,
        metrics,
        dayBucket: getDayBucketForPos(draft.pos),
        interviewCount: scouting.interviews.history[id]?.length ?? 0,
        order: index,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const dayProspects = allProspects
    .filter((prospect) => prospect.dayBucket === currentDay)
    .sort((a, b) => a.order - b.order);

  const shortlist = allProspects
    .filter((prospect) => prospect.interviewCount >= 1)
    .sort((a, b) => {
      const aReveal = Math.max(a.profile.clarity.CHAR ?? 0, a.profile.clarity.FIT ?? 0);
      const bReveal = Math.max(b.profile.clarity.CHAR ?? 0, b.profile.clarity.FIT ?? 0);
      return bReveal - aReveal;
    });

  const interviewedToday = scouting.combine.recapByDay[scouting.combine.day]?.interviewedProspectIds ?? [];

  const bestAutoSuggest = dayProspects
    .filter((prospect) => !interviewedToday.includes(prospect.id))
    .sort((a, b) => {
      const aNeed = 100 - Math.max(a.profile.clarity.CHAR ?? 0, a.profile.clarity.FIT ?? 0);
      const bNeed = 100 - Math.max(b.profile.clarity.CHAR ?? 0, b.profile.clarity.FIT ?? 0);
      return bNeed - aNeed;
    })[0];

  const urgencyText = interviewsRemaining <= 0 ? "OUT" : interviewsRemaining <= 1 ? "CRITICAL" : interviewsRemaining <= 3 ? "LOW" : "STABLE";
  const urgencyTone = interviewsRemaining <= 0 ? "text-rose-200" : interviewsRemaining <= 1 ? "text-rose-300" : interviewsRemaining <= 3 ? "text-amber-200" : "text-emerald-200";
  const bucketLabel = DAY_BUCKETS[currentDay].label;
  const interviewsEnabled = currentDay === 4;
  const formatRange = (trueScore: number, revealPct: number) => {
    const [low, high] = getDeterministicRevealRange({ trueScore, revealPct });
    return low === high ? `${low}` : `${low}–${high}`;
  };

  return (
    <div className="space-y-3 p-3 pb-24 sm:p-4">
      <div className="sticky top-[52px] z-20 rounded-lg border border-white/10 bg-black/70 p-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold tracking-wide sm:text-base">COMBINE — DAY {currentDay} / 4</div>
          <div className="text-right text-xs font-semibold text-amber-200">INTERVIEWS REMAINING: {interviewsRemaining}</div>
        </div>
        <div className="mt-1 text-xs opacity-70">Current bucket: {bucketLabel}</div>
        <div className="mt-3 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`min-h-11 rounded border px-4 text-sm ${activeTab === tab.id ? "border-sky-400 bg-sky-500/10 text-sky-200" : "border-white/15 bg-black/20"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "ALL" ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-center text-sm sm:text-base">
            <div className="font-semibold text-amber-200">{interviewsRemaining} INTERVIEWS REMAINING TODAY</div>
            <div className="mt-1 text-xs opacity-80">Select from today&apos;s {bucketLabel} bucket. Interviews reveal partial Character and IQ grades.</div>
          </div>

          {dayProspects.map(({ id, draft, profile, metrics }) => {
            const charReveal = profile.clarity.CHAR ?? 0;
            const iqReveal = profile.clarity.FIT ?? 0;
            const alreadyInterviewedToday = interviewedToday.includes(id);
            const addInterviewDisabled = !interviewsEnabled || interviewsRemaining <= 0 || alreadyInterviewedToday;
            const medicalTier = profile.revealed.medicalTier ?? "UNKNOWN";
            const medicalShort = profile.notes.medical ?? "No firm flags yet; confidence still moving.";
            const alreadyFocusedToday = recap.focusedProspectIds.includes(id);
            const focusDisabled = !focusEnabled || remaining < COMBINE_FOCUS_HOURS_COST || alreadyFocusedToday;

            return (
              <div key={id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-white/15 px-2 py-1 text-xs">{getPositionLabel(draft.pos)}</span>
                      <button type="button" className="truncate text-left font-semibold text-sky-300 hover:underline" onClick={() => openProspectProfile(id)}>
                        {draft.name}
                      </button>
                    </div>
                    <div className="text-xs opacity-75">{draft.school} · Age {draft.age}</div>
                  </div>
                  <div className="text-xs opacity-70">Current range: {profile.estLow}-{profile.estHigh}</div>
                </div>

                <div className="mt-3 rounded border border-white/10 bg-black/20 p-2 text-xs">
                  <div className="font-semibold">Drill Metrics</div>
                  <div className="mt-1 flex flex-wrap gap-3 opacity-85">
                    <span>40: {metrics?.forty ?? "—"}</span>
                    <span>Vert: {metrics?.vert ?? "—"}</span>
                    <span>RAS: {metrics?.ras ?? "—"}</span>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sky-200">Expand full set</summary>
                    <div className="mt-2 flex flex-wrap gap-3 opacity-80">
                      <span>Shuttle: {metrics?.shuttle ?? "—"}</span>
                      <span>Bench: {metrics?.bench ?? "—"}</span>
                    </div>
                  </details>
                </div>

                <div className="mt-2 rounded border border-white/10 bg-black/20 p-2 text-xs">
                  <div className={`inline-block rounded border px-2 py-1 ${medicalToneByTier[medicalTier] ?? "text-white/80 border-white/20"}`}>MEDICAL {medicalTier}</div>
                  <div className="mt-1 opacity-80">{medicalShort}</div>
                </div>

                <div className="mt-2 space-y-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs"><span>Character reveal</span><span>{charReveal}%</span></div>
                    <div className="h-2 w-full overflow-hidden rounded bg-white/15"><div className={`h-full ${barTone(charReveal)}`} style={{ width: `${charReveal}%` }} /></div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs"><span>IQ reveal</span><span>{iqReveal}%</span></div>
                    <div className="h-2 w-full overflow-hidden rounded bg-white/15"><div className={`h-full ${barTone(iqReveal)}`} style={{ width: `${iqReveal}%` }} /></div>
                  </div>
                </div>
                <button
                  className={`rounded border px-3 py-2 ${focusDisabled ? "cursor-not-allowed border-white/10 text-white/40" : "border-sky-500 text-sky-200"}`}
                  disabled={focusDisabled}
                  onClick={() => dispatch({ type: "SCOUT_COMBINE_FOCUS", payload: { prospectId: id } })}
                >
                  {alreadyFocusedToday ? "Focused" : `Focus (-${COMBINE_FOCUS_HOURS_COST})`}
                </button>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`min-h-11 rounded border px-3 text-xs sm:text-sm ${addInterviewDisabled ? "cursor-not-allowed border-white/10 text-white/40" : "border-amber-500 text-amber-200"}`}
                    disabled={addInterviewDisabled}
                    onClick={() => dispatch({ type: "SCOUT_COMBINE_INTERVIEW", payload: { prospectId: id, category: iqReveal <= charReveal ? "IQ" : "LEADERSHIP" } })}
                  >
                    {alreadyInterviewedToday ? "INTERVIEWED TODAY" : !interviewsEnabled ? "DAY 4 ONLY" : "[ADD INTERVIEW]"}
                  </button>
                  <button type="button" className="min-h-11 rounded border border-sky-500 px-3 text-xs text-sky-200 sm:text-sm" onClick={() => openProspectProfile(id)}>
                    [VIEW PROFILE]
                  </button>
                </div>
              </div>
            );
          })}
          {!dayProspects.length ? <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm opacity-70">No prospects in this day bucket.</div> : null}
        </div>
      ) : null}

      {activeTab === "SHORTLIST" ? (
        <div className="space-y-2">
          {shortlist.map((prospect) => {
            const combinedReveal = Math.max(prospect.profile.clarity.CHAR ?? 0, prospect.profile.clarity.FIT ?? 0);
            const reveal = scouting.interviews.modelARevealByProspectId?.[prospect.id] ?? { characterRevealPct: 0, intelligenceRevealPct: 0 };
            const trueCharacterScore = scouting.trueProfiles[prospect.id]?.trueAttributes?.character ?? 50;
            const trueIntelligenceScore = scouting.trueProfiles[prospect.id]?.trueAttributes?.intelligence ?? 50;
            const charRange = formatRange(trueCharacterScore, reveal.characterRevealPct);
            const iqRange = formatRange(trueIntelligenceScore, reveal.intelligenceRevealPct);
            return (
              <div key={prospect.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    <button type="button" className="text-sky-300 hover:underline" onClick={() => openProspectProfile(prospect.id)}>{prospect.draft.name}</button>{" "}
                    <span className="opacity-70">{getPositionLabel(prospect.draft.pos)}</span>
                  </div>
                  <div className="text-xs opacity-70">Interviews: {prospect.interviewCount}</div>
                  <div className="mt-1 text-xs opacity-80">
                    <div className="mb-1">Character Reveal: {reveal.characterRevealPct}%</div>
                    <div className="h-1.5 w-full overflow-hidden rounded bg-white/10"><div className="h-full bg-emerald-400" style={{ width: `${reveal.characterRevealPct}%` }} /></div>
                  </div>
                  <div className="mt-1 text-xs opacity-80">
                    <div className="mb-1">Football IQ Reveal: {reveal.intelligenceRevealPct}%</div>
                    <div className="h-1.5 w-full overflow-hidden rounded bg-white/10"><div className="h-full bg-sky-400" style={{ width: `${reveal.intelligenceRevealPct}%` }} /></div>
                  </div>
                  <div className="mt-1 text-xs opacity-70">
                    Character: {charRange} • Football IQ: {iqRange} • Leadership: {prospect.profile.revealed.leadershipTag ?? "—"}
                  </div>
                  <div className="text-xs text-sky-200">Reveal {combinedReveal}%</div>
                </div>
              </div>
            );
          })}
          {!shortlist.length ? <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm opacity-70">No interviewed prospects yet.</div> : null}
        </div>
      ) : null}

      {activeTab === "NOTES" ? (
        <div className="space-y-3">
          {allProspects.map((prospect) => (
            <div key={prospect.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="mb-2 text-sm font-semibold">{prospect.draft.name} <span className="text-xs opacity-70">({getPositionLabel(prospect.draft.pos)})</span></div>
              <textarea
                className="min-h-24 w-full rounded border border-white/15 bg-black/30 p-2 text-sm outline-none focus:border-sky-400"
                placeholder="Add combine note…"
                value={notesByProspect[prospect.id]?.notes ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setNotesByProspect((prev) => ({ ...prev, [prospect.id]: { notes: value } }));
                }}
              />
              <div className="mt-1 text-xs opacity-60">Saved for this save file and persists while switching combine days/tabs.</div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-black/85 p-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className={`min-h-11 rounded border px-4 text-sm ${!interviewsEnabled || interviewsRemaining <= 0 || !bestAutoSuggest ? "cursor-not-allowed border-white/10 text-white/40" : "border-violet-400 text-violet-200"}`}
            disabled={!interviewsEnabled || interviewsRemaining <= 0 || !bestAutoSuggest}
            onClick={() => {
              if (!bestAutoSuggest) return;
              const category = (bestAutoSuggest.profile.clarity.FIT ?? 0) <= (bestAutoSuggest.profile.clarity.CHAR ?? 0) ? "IQ" : "LEADERSHIP";
              dispatch({ type: "SCOUT_COMBINE_INTERVIEW", payload: { prospectId: bestAutoSuggest.id, category } });
            }}
          >
            AUTO SUGGEST
          </button>
          <div className={`text-sm font-semibold ${urgencyTone}`}>Token urgency: {urgencyText} ({interviewsRemaining} left)</div>
        </div>
      </div>
      {modal}
    </div>
  );
}
