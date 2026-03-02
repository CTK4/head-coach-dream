import type { PlayerIntel } from "@/engine/scoutingCapacity";
import type { ProspectScoutProfile } from "@/engine/scouting/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type ProspectRecord = Record<string, unknown>;
type CombineSummary = ProspectRecord & { grades?: { forty?: string } };

function firstValue(record: ProspectRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return undefined;
}

const fmt = (value: unknown) => (value === undefined || value === null || String(value).trim() === "" ? null : String(value));

export function ProspectProfileModal({
  open,
  onClose,
  prospect,
  intel,
  scoutingProfile,
  combine,
}: {
  open: boolean;
  onClose: () => void;
  prospect: ProspectRecord | null;
  intel?: PlayerIntel;
  scoutingProfile?: ProspectScoutProfile;
  combine?: CombineSummary;
}) {
  const isMobile = useIsMobile();

  if (!open || !prospect) return null;
  const source = { ...(combine ?? {}), ...prospect } as ProspectRecord;
  const name = fmt(firstValue(source, ["name", "Name", "fullName"])) ?? "Unknown Prospect";
  const pos = fmt(firstValue(source, ["pos", "POS"]));
  const college = fmt(firstValue(source, ["college", "College", "school", "School"]));
  const age = fmt(firstValue(source, ["age", "Age"]));
  const height = fmt(firstValue(source, ["height", "Hgt", "heightIn"]));
  const weight = fmt(firstValue(source, ["weight", "Wgt", "weightLb"]));

  const med = intel?.revealed?.medicalTier;
  const chr = intel?.revealed?.characterTier;
  const combined =
    med && chr
      ? med === "BLACK" || chr === "BLACK" || med === "RED" || chr === "RED"
        ? "HIGH"
        : med === "ORANGE" || chr === "ORANGE"
          ? "MED"
          : med === "YELLOW" || chr === "YELLOW"
            ? "LOW-MED"
            : "LOW"
      : null;

  const blurbs = [
    fmt(firstValue(source, ["blurb", "summary", "description"])),
    scoutingProfile?.notes?.film,
    scoutingProfile?.notes?.athletic,
    scoutingProfile?.notes?.character,
    scoutingProfile?.notes?.medical,
  ].filter((value): value is string => Boolean(value));

  const bioRows = [
    { label: "College", value: college },
    { label: "Age", value: age },
    { label: "Height", value: height },
    { label: "Weight", value: weight },
    { label: "Archetype", value: fmt(firstValue(source, ["archetype", "DraftTier"])) },
  ].filter((row) => Boolean(row.value));

  const combineRows = [
    { label: "40", value: fmt(firstValue(source, ["forty", "40"])) },
    { label: "Vert", value: fmt(firstValue(source, ["vert", "Vert"])) },
    { label: "Bench", value: fmt(firstValue(source, ["bench", "Bench"])) },
    { label: "Shuttle", value: fmt(firstValue(source, ["shuttle", "Shuttle"])) },
    { label: "3 Cone", value: fmt(firstValue(source, ["threeCone", "ThreeCone"])) },
    { label: "Broad", value: fmt(firstValue(source, ["broad", "Broad"])) },
    { label: "RAS", value: fmt(firstValue(source, ["ras", "grade"])) },
  ].filter((row) => Boolean(row.value));

  const ratingsRows = Object.entries(source)
    .filter(([key, value]) => {
      if (value === undefined || value === null || String(value).trim() === "") return false;
      return ["Awareness", "Poise", "Focus", "Leadership", "Competitiveness", "Confidence", "Work_Ethic", "Coachability", "Football_IQ", "Instincts", "Maturity", "Motor", "Speed", "Acceleration", "Agility", "Strength", "Jumping", "Stamina", "Accuracy", "Arm_Strength", "Touch", "Mechanics", "Pocket_Presence", "Release", "Vision", "Balance", "Elusiveness", "Hands", "Pass_Protection", "Footwork", "Route_Running", "YAC_Ability", "Body_Control"].includes(key);
    })
    .map(([key, value]) => ({ label: key.replace(/_/g, " "), value: String(value) }));

  const intelRows = [
    scoutingProfile ? { label: "Scout Band", value: `${scoutingProfile.estLow}-${scoutingProfile.estHigh}` } : null,
    scoutingProfile ? { label: "Scout Confidence", value: `${scoutingProfile.confidence}%` } : null,
    scoutingProfile ? { label: "TALENT", value: `${scoutingProfile.clarity.TALENT}%` } : null,
    scoutingProfile ? { label: "MED", value: `${scoutingProfile.clarity.MED}%` } : null,
    scoutingProfile ? { label: "CHAR", value: `${scoutingProfile.clarity.CHAR}%` } : null,
    scoutingProfile ? { label: "FIT", value: `${scoutingProfile.clarity.FIT}%` } : null,
    med ? { label: "Medical Tier", value: med } : null,
    chr ? { label: "Character Tier", value: chr } : null,
    combined ? { label: "Risk", value: combined } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  const modalBody = (
      <div className="w-full overflow-auto bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold">{name}</div>
            <div className="text-sm opacity-80">{[pos, college].filter(Boolean).join(" · ")}</div>
          </div>
          <button className="min-h-11 rounded border border-slate-600 px-3 py-1" onClick={onClose}>Close</button>
        </div>

        {blurbs.length ? (
          <div className="mt-4 space-y-1">
            <div className="text-xs uppercase tracking-wide text-slate-400">Blurbs</div>
            {blurbs.map((blurb, idx) => <p key={`${blurb}-${idx}`} className="text-sm text-slate-200">{blurb}</p>)}
          </div>
        ) : null}

        {bioRows.length ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Bio</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {bioRows.map((row) => <div key={row.label}><span className="text-slate-400">{row.label}:</span> <span>{row.value}</span></div>)}
            </div>
          </div>
        ) : null}

        {combineRows.length ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Combine / Stats</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {combineRows.map((row) => <div key={row.label}><span className="text-slate-400">{row.label}:</span> <span>{row.value}</span></div>)}
            </div>
          </div>
        ) : null}

        {intelRows.length ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Ratings / Intel</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {intelRows.map((row) => <div key={row.label}><span className="text-slate-400">{row.label}:</span> <span>{row.value}</span></div>)}
            </div>
          </div>
        ) : null}

        {ratingsRows.length ? (
          <div className="mt-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Trait Ratings</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {ratingsRows.map((row) => <div key={row.label}><span className="text-slate-400">{row.label}:</span> <span>{row.value}</span></div>)}
            </div>
          </div>
        ) : null}
      </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-2xl border-slate-700 bg-slate-900 p-0">
          {modalBody}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-slate-700 bg-slate-900 p-0 text-slate-100">
        {modalBody}
      </DialogContent>
    </Dialog>
  );
}
