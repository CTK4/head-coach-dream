import type { DragEvent } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoutingReport } from "@/types/scouting";

export interface Prospect {
  id: string;
  name: string;
  pos: string;
  school?: string;
  estLow: number;
  estHigh: number;
  confidence?: number;
  height?: string;
  weight?: string;
  forty?: string;
  positionRank?: string;
}

interface ProspectRowProps {
  prospect: Prospect;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: () => void;
  isDragging: boolean;
  isDragOver?: boolean;
  report?: ScoutingReport;
  onOpenProfile?: (prospectId: string) => void;
}

const gradeClass = (grade: number) => {
  if (grade >= 90) return "bg-amber-500/20 text-amber-200 border-amber-400/30";
  if (grade >= 80) return "bg-blue-500/20 text-blue-200 border-blue-400/30";
  if (grade >= 70) return "bg-emerald-500/20 text-emerald-200 border-emerald-400/30";
  if (grade >= 60) return "bg-amber-500/20 text-amber-100 border-amber-400/30";
  return "bg-slate-500/20 text-slate-200 border-slate-400/30";
};

const rankBg = (rank: number) => {
  if (rank <= 10) return "from-amber-400/70 to-amber-700/70";
  if (rank <= 32) return "from-blue-500/70 to-blue-700/70";
  return "from-slate-500/60 to-slate-700/70";
};

export default function ProspectRow({ prospect, rank, isExpanded, onToggle, onDragStart, onDragOver, onDrop, isDragging, isDragOver, report, onOpenProfile }: ProspectRowProps) {
  const estCenter = Math.round((prospect.estLow + prospect.estHigh) / 2);
  return (
    <div className="relative">
      {isDragOver ? <div className="absolute left-0 right-0 top-0 z-10 h-0.5 bg-blue-500" /> : null}
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={cn("overflow-hidden rounded-xl border border-white/10 bg-[#13131A] transition", isDragging && "opacity-50")}
      >
        <button onClick={onToggle} className="flex min-h-[44px] w-full items-stretch text-left">
          <div className={cn("flex w-[72px] items-center justify-center bg-gradient-to-b", rankBg(rank))}>
            <span className="text-3xl font-bold text-white">{rank}</span>
          </div>
          <div className="flex-1 p-3">
            <div className="font-semibold text-[16px]">
              {onOpenProfile ? (
                <button
                  type="button"
                  className="max-w-full truncate text-left text-sky-300 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProfile(prospect.id);
                  }}
                >
                  {prospect.name}
                </button>
              ) : (
                prospect.name
              )}
            </div>
            <div className="text-xs text-slate-400">{prospect.pos} · {prospect.school ?? "Unknown School"}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className={cn("rounded border px-2 py-0.5 text-[11px]", gradeClass(estCenter))}>
                {prospect.estLow === prospect.estHigh ? prospect.estLow : `${prospect.estLow}–${prospect.estHigh}`}
              </span>
              {prospect.confidence ? <span className="text-[11px] text-slate-400">Conf {prospect.confidence}%</span> : null}
            </div>
          </div>
          <div className="flex items-center px-3 text-slate-300">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
        </button>

        <div className={cn("grid transition-all duration-200 ease-in-out", isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden border-t border-white/10">
            <div className="space-y-3 p-3 text-xs">
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Physical Attributes</div>
                <div className="text-slate-300">{prospect.height ?? "—"} · {prospect.weight ?? "—"} · 40: {prospect.forty ?? "—"} · Pos Rank: {prospect.positionRank ?? "—"}</div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Scouting Report</div>
                {report ? (
                  <div className="space-y-2">
                    <div className="text-slate-400">{report.authorLabel} · Week {report.generatedWeek}</div>
                    {report.positives.map((p) => <div key={p} className="text-emerald-200">✓ {p}</div>)}
                    {report.negatives.map((n) => <div key={n} className="text-red-200">✗ {n}</div>)}
                    {report.comparisonPlayer ? <div className="text-slate-300">{report.comparisonPlayer}</div> : null}
                    {report.draftRecommendation ? <div className="text-slate-300">{report.draftRecommendation}</div> : null}
                  </div>
                ) : (
                  <div className="text-slate-400">Complete a workout, interview, or medical review to generate a scouting report.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
