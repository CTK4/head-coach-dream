import { useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { X } from "lucide-react";

const ICONS: Record<string, string> = {
  CAP_CHANGE: "💰",
  ROSTER_CHANGE: "🧾",
  DRAFT_SELECTION: "📣",
  INJURY_ALERT: "🩺",
  HOT_SEAT: "🔥",
  MILESTONE: "🏁",
  TRADE_COMPLETE: "🤝",
  FA_SIGNED: "✍️",
};

export default function FeedbackToast() {
  const { state, dispatch } = useGame();
  const visible = state.feedbackQueue.slice(0, 3);

  useEffect(() => {
    const timers = visible
      .filter((e) => e.severity !== "CRITICAL")
      .map((e) =>
        window.setTimeout(() => {
          dispatch({ type: "DISMISS_FEEDBACK", payload: { id: e.id } });
        }, e.severity === "WARNING" ? 6000 : 4000)
      );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [visible, dispatch]);

  return (
    <div className="fixed z-50 bottom-20 md:bottom-4 left-1/2 md:left-auto md:right-4 -translate-x-1/2 md:translate-x-0 space-y-2 w-[min(92vw,420px)]">
      {visible.map((event) => (
        <div key={event.id} className={`rounded-md border bg-background/95 p-3 shadow-lg animate-in slide-in-from-bottom-4 ${event.severity === "CRITICAL" ? "border-l-4 border-l-red-500" : "border-border"}`}>
          <div className="flex items-start gap-2">
            <span>{ICONS[event.category] ?? "🔔"}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.body}</p>
            </div>
            <button onClick={() => dispatch({ type: "DISMISS_FEEDBACK", payload: { id: event.id } })} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
