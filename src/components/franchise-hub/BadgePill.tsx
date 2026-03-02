import { hubTheme } from "@/components/franchise-hub/theme";

type BadgePillProps = {
  count: number;
  className?: string;
};

export function BadgePill({ count, className }: BadgePillProps) {
  return (
    <span className={`${hubTheme.metallicPill} ${className ?? ""}`.trim()}>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 fill-current">
        <path d="M8 2.1 9.5 5l3.2.5-2.3 2.2.6 3.2L8 9.5 5 11l.6-3.2L3.3 5.5 6.5 5z" />
      </svg>
      {count}
    </span>
  );
}
