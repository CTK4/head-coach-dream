import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UtilityIcon } from "@/components/franchise-hub/UtilityIcon";
import { DEV_TRAIT_LABELS, getPositionLabel, safeLabel } from "@/lib/displayLabels";

export type PlayerStatusIconName =
  | "Calendar"
  | "Cold"
  | "Fatigued"
  | "High_Motor"
  | "Hot"
  | "IQ"
  | "Injured_Reserved"
  | "Issue"
  | "Lazy"
  | "Messages"
  | "Rested"
  | "Settings"
  | "Tag";

export type PlayerStatusIcon = {
  name: PlayerStatusIconName;
  label: string;
  kind?: "ISSUE";
  details?: string[];
};

type PlayerAny = any;

function normalizeNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function upper(v: unknown): string {
  return typeof v === "string" ? v.toUpperCase() : "";
}

export function getPlayerStatusIcons(p: PlayerAny): PlayerStatusIcon[] {
  const icons: PlayerStatusIcon[] = [];

  const stamina = normalizeNumber(p.stamina);
  const condition = normalizeNumber(p.condition);
  const fatigue = normalizeNumber(p.fatigue) ?? (stamina !== null ? 100 - stamina : null) ?? (condition !== null ? 100 - condition : null);

  const injuryStatus = upper(p.injuryStatus ?? p.injury_state ?? p.healthStatus);
  const injuryName = typeof p.injury === "string" ? p.injury : typeof p.injuryName === "string" ? p.injuryName : null;

  const isIR =
    injuryStatus.includes("IR") ||
    injuryStatus.includes("INJURED_RESERVE") ||
    Boolean(p.onIr) ||
    Boolean(p.ir) ||
    Boolean(p.injuredReserve);

  const isInjured =
    isIR ||
    Boolean(p.injured) ||
    Boolean(p.injury) ||
    (injuryStatus.length > 0 && injuryStatus !== "HEALTHY" && injuryStatus !== "OK");

  const morale = normalizeNumber(p.morale);
  const roleSatisfaction = normalizeNumber(p.roleSatisfaction ?? p.role);
  const hasIssue =
    Boolean(p.moraleIssue) ||
    Boolean(p.hasIssue) ||
    (morale !== null && morale < 40) ||
    (roleSatisfaction !== null && roleSatisfaction < 40) ||
    injuryStatus.includes("QUESTIONABLE") ||
    injuryStatus.includes("DOUBTFUL") ||
    injuryStatus.includes("OUT");

  const motor = normalizeNumber(p.motor) ?? (typeof p.highMotor === "boolean" ? (p.highMotor ? 95 : null) : null);
  const iq = normalizeNumber(p.iq) ?? normalizeNumber(p.awareness);

  const personality = upper(p.trait ?? p.personality ?? p.workEthic ?? "");
  const isLazy = personality.includes("LAZY");

  const trend = upper(p.trend ?? p.form ?? "");

  const issueDetails: string[] = [];

  if (isIR) {
    icons.push({ name: "Injured_Reserved", label: "Injured Reserve" });
    issueDetails.push("Status: Injured Reserve");
  } else if (isInjured) {
    icons.push({ name: "Issue", label: "Injured / Limited", kind: "ISSUE" });
    issueDetails.push(`Status: ${injuryStatus || "Injured"}`);
  }

  if (injuryName) issueDetails.push(`Injury: ${injuryName}`);
  if (morale !== null) issueDetails.push(`Morale: ${morale}`);
  if (roleSatisfaction !== null) issueDetails.push(`Role Satisfaction: ${roleSatisfaction}`);

  if (fatigue !== null) {
    if (fatigue >= 40) icons.push({ name: "Fatigued", label: "Fatigued" });
    else if (fatigue <= 10) icons.push({ name: "Rested", label: "Rested" });
  }

  if (hasIssue) {
    icons.push({
      name: "Issue",
      label: "Issue",
      kind: "ISSUE",
      details: issueDetails.length ? issueDetails : ["This player has an issue flagged by the game model."],
    });
  }

  if (motor !== null && motor >= 85) icons.push({ name: "High_Motor", label: "High Motor" });
  if (iq !== null && iq >= 85) icons.push({ name: "IQ", label: "High IQ" });

  if (isLazy) icons.push({ name: "Lazy", label: "Lazy" });
  if (trend === "HOT") icons.push({ name: "Hot", label: "Hot Streak" });
  if (trend === "COLD") icons.push({ name: "Cold", label: "Cold Streak" });

  const seen = new Set<string>();
  return icons.filter((x) => (seen.has(x.name) ? false : (seen.add(x.name), true)));
}

export function StatusLegend() {
  const items: Array<{ name: PlayerStatusIconName; label: string }> = [
    { name: "Injured_Reserved", label: "IR" },
    { name: "Issue", label: "Issue" },
    { name: "Fatigued", label: "Fatigued" },
    { name: "Rested", label: "Rested" },
    { name: "High_Motor", label: "High Motor" },
    { name: "IQ", label: "High IQ" },
    { name: "Hot", label: "Hot" },
    { name: "Cold", label: "Cold" },
    { name: "Lazy", label: "Lazy" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200/70">
      {items.map((it) => (
        <span key={it.name} className="inline-flex items-center gap-2 rounded-md border border-slate-300/15 bg-slate-950/20 px-2 py-1">
          <UtilityIcon name={it.name} className="h-4 w-4" alt={it.label} />
          <span>{it.label}</span>
        </span>
      ))}
    </div>
  );
}

export function PlayerStatusIcons({ player, className = "" }: { player: PlayerAny; className?: string }) {
  const icons = useMemo(() => getPlayerStatusIcons(player), [player]);
  const [issueOpen, setIssueOpen] = useState(false);

  const issue = icons.find((x) => x.kind === "ISSUE") ?? null;

  if (!icons.length) return null;

  return (
    <>
      <div className={`flex items-center gap-1 ${className}`} aria-label="Player status icons">
        {icons.map((ic) => {
          const clickable = ic.kind === "ISSUE";
          return (
            <button
              key={ic.name}
              type="button"
              className={clickable ? "hover:opacity-90 active:scale-[0.98]" : "pointer-events-none"}
              onClick={clickable ? () => setIssueOpen(true) : undefined}
              title={ic.label}
              aria-label={ic.label}
            >
              <UtilityIcon name={ic.name} className="h-4 w-4" alt={ic.label} />
            </button>
          );
        })}
      </div>

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="border-slate-300/15 bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtilityIcon name="Issue" className="h-5 w-5" />
              Player Issue
            </DialogTitle>
            <DialogDescription className="text-slate-200/70">Details for {player?.name ?? "Player"}.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-300/15 bg-slate-950/30 p-3">
              <div className="text-sm font-semibold text-slate-100">{player?.name ?? "Player"}</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {player?.pos ? <Badge variant="outline">{getPositionLabel(String(player.pos))}</Badge> : null}
                {player?.devTrait ? <Badge variant="outline">{DEV_TRAIT_LABELS[String(player.devTrait)] ?? safeLabel(String(player.devTrait))}</Badge> : null}
                {player?.age ? <Badge variant="outline">Age {String(player.age)}</Badge> : null}
              </div>
            </div>

            <div className="rounded-lg border border-slate-300/15 bg-slate-950/20 p-3">
              <div className="text-sm font-semibold text-slate-100">Why this is flagged</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200/80">
                {(issue?.details?.length ? issue.details : ["This player has an issue flagged by the game model."]).map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
