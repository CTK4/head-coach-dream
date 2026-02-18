export const hubTheme = {
  pageBackground:
    "bg-[radial-gradient(circle_at_20%_0%,rgba(42,72,133,0.4),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(210,167,84,0.12),transparent_34%),linear-gradient(180deg,#020612_0%,#050b1a_34%,#050913_100%)]",
  pageTexture:
    "before:absolute before:inset-0 before:bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] before:bg-[length:4px_4px] before:opacity-[0.05] before:pointer-events-none",
  pageVignette:
    "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.08),transparent_42%),linear-gradient(180deg,rgba(0,0,0,0.7)_0%,transparent_26%,transparent_74%,rgba(0,0,0,0.72)_100%)] after:pointer-events-none",
  frame:
    "relative overflow-hidden rounded-2xl border border-slate-300/20 bg-slate-950/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_24px_45px_rgba(0,0,0,0.45),0_18px_44px_rgba(0,0,0,0.55)]",
  metallicDivider: "h-px w-full bg-gradient-to-r from-transparent via-amber-300/60 to-transparent",
  goldText: "text-amber-300",
  hubTitle: "text-shadow-[0_1px_1px_rgba(255,255,255,0.15),0_2px_10px_rgba(0,0,0,0.65)]",
  tabBase:
    "relative flex-1 border border-slate-300/20 bg-gradient-to-b from-slate-800/70 to-slate-950/80 px-2 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-300 transition",
  tabActive:
    "bg-gradient-to-b from-blue-700/80 to-blue-950/90 text-white shadow-[0_0_12px_rgba(56,138,255,0.35)] after:absolute after:inset-x-2 after:-bottom-px after:h-px after:bg-amber-300/90",
  tabInactive: "hover:border-slate-200/35 hover:text-slate-100",
  tileCard:
    "group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-lg border border-slate-300/20 bg-slate-950/65 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.45)] transition hover:border-blue-300/45 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_22px_rgba(42,122,255,0.25)] active:scale-[0.995]",
  tileDepth:
    "before:absolute before:inset-0 before:bg-[linear-gradient(140deg,rgba(61,89,153,0.22),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.09),transparent_32%)] before:pointer-events-none",
  ctaBar:
    "rounded-md border border-blue-200/30 bg-gradient-to-b from-blue-700/70 to-blue-950/90 px-3 py-2 text-center text-sm font-semibold tracking-wide text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
  metallicPill:
    "inline-flex items-center gap-1 rounded-md border border-amber-100/35 bg-gradient-to-b from-slate-100/15 to-slate-700/25 px-2 py-1 text-xs font-semibold text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]",
  advanceBar:
    "relative overflow-hidden rounded-xl border border-blue-300/30 bg-gradient-to-b from-blue-700/45 via-blue-900/45 to-slate-950/85 px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_25px_rgba(55,122,255,0.25)]",
};
