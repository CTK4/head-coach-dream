import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type PlayerNameLinkProps = {
  playerId: string;
  name: string;
  pos?: string;
  className?: string;
  linkClassName?: string;
  namespace?: "hub" | "roster" | "contracts" | "free-agency" | "re-sign" | "trades";
};

const ROUTE_BASE_BY_NAMESPACE: Record<NonNullable<PlayerNameLinkProps["namespace"]>, string> = {
  hub: "/hub/player",
  roster: "/roster/player",
  contracts: "/contracts/player",
  "free-agency": "/free-agency/player",
  "re-sign": "/re-sign/player",
  trades: "/trades/player",
};

export function PlayerNameLink({
  playerId,
  name,
  pos,
  className,
  linkClassName,
  namespace = "hub",
}: PlayerNameLinkProps) {
  const to = `${ROUTE_BASE_BY_NAMESPACE[namespace]}/${playerId}`;

  return (
    <span className={cn("min-w-0", className)}>
      <Link to={to} className={cn("truncate font-semibold hover:underline", linkClassName)}>
        {name}
      </Link>
      {pos ? <span className="text-muted-foreground"> ({pos})</span> : null}
    </span>
  );
}
