import { cn } from "@/lib/utils";

interface FilterPillProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function FilterPill({ active, children, onClick, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[44px] rounded px-3 text-xs font-medium transition-colors",
        active
          ? "bg-blue-500 text-white"
          : "bg-surface-2 text-slate-300 hover:bg-surface-3 hover:text-slate-100",
        className,
      )}
    >
      {children}
    </button>
  );
}
