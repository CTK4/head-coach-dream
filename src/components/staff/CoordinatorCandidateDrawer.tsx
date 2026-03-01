import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

type CoordinatorRole = "OC" | "DC" | "STC";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: {
    name: string;
    role: CoordinatorRole;
    reputation: number;
    schemeLabel: string;
    tags: string[];
    description?: string;
    schemeIdOrRaw: string;
  } | null;
};

function roleLabel(role: CoordinatorRole): string {
  if (role === "OC") return "Offensive Coordinator";
  if (role === "DC") return "Defensive Coordinator";
  return "Special Teams Coordinator";
}

function sideLabel(role: CoordinatorRole): string {
  if (role === "OC") return "Offense";
  if (role === "DC") return "Defense";
  return "Special Teams";
}

export function CoordinatorCandidateDrawer({ open, onOpenChange, candidate }: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent data-test="coord-candidate-drawer" className="max-h-[85vh] overflow-y-auto rounded-t-2xl border-white/10 bg-slate-950 px-4 pb-6 pt-3">
        {candidate ? (
          <>
            <DrawerHeader className="px-0 pb-3">
              <DrawerTitle>{candidate.name}</DrawerTitle>
              <div className="text-sm text-muted-foreground">{roleLabel(candidate.role)} · Rep {candidate.reputation}</div>
            </DrawerHeader>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Scheme</div>
                <div className="font-medium">{candidate.schemeLabel}</div>
              </div>
              {candidate.description ? <p className="text-muted-foreground">{candidate.description}</p> : null}
              <div className="flex flex-wrap gap-2">
                {candidate.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">If hired</div>
                <div>Sets {sideLabel(candidate.role)} Scheme to {candidate.schemeLabel}</div>
                <div className="text-muted-foreground">Unlocks playbook: {candidate.schemeIdOrRaw}</div>
              </div>
            </div>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
