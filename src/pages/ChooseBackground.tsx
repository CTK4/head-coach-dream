import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import { ARCHETYPES, type Archetype } from "@/data/archetypes";
import { getArchetypeTraits } from "@/data/archetypeTraits";
import { applyArchetypeDeltas, enforceArchetypeReputationCaps } from "@/engine/reputation";
import { cn } from "@/lib/utils";

const ChooseBackground = () => {
  const { dispatch } = useGame();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isTouchDevice = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches,
    [],
  );

  const handleSelect = (archetype: Archetype) => {
    const traits = getArchetypeTraits(archetype.id);
    const seededReputation = traits
      ? applyArchetypeDeltas(archetype.reputationProfile, traits.startingDeltas)
      : archetype.reputationProfile;

    dispatch({
      type: "SET_COACH",
      payload: {
        archetypeId: archetype.id,
        repBaseline: archetype.repStart,
        autonomy: archetype.autonomyStart,
        ownerTrustBaseline: archetype.ownerTrustBaseline,
        gmRelationship: archetype.gmRelationshipStart,
        coordDeferenceLevel: archetype.coordDeferenceLevel,
        mediaExpectation: archetype.mediaExpectation,
        lockerRoomCred: archetype.lockerRoomCred,
        volatility: archetype.volatility,
        reputation: enforceArchetypeReputationCaps(seededReputation, { archetypeId: archetype.id, tenureYear: 1 }),
      },
    });
    dispatch({ type: "SET_PHASE", payload: "INTERVIEWS" });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Choose Your Background</h1>
        <p className="text-muted-foreground text-center mb-8">This shapes your coaching identity and reputation</p>
        <div className="grid gap-4">
          {ARCHETYPES.map((archetype) => {
            const isExpanded = expandedId === archetype.id;
            return (
              <Card
                key={archetype.id}
                tabIndex={0}
                className={cn(
                  "transition-all",
                  isTouchDevice ? "cursor-default" : "cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/10",
                  isExpanded && "border-primary shadow-lg shadow-primary/10",
                )}
                onMouseEnter={() => !isTouchDevice && setExpandedId(archetype.id)}
                onMouseLeave={() => !isTouchDevice && setExpandedId((cur) => (cur === archetype.id ? null : cur))}
                onFocus={() => setExpandedId(archetype.id)}
                onBlur={() => !isTouchDevice && setExpandedId((cur) => (cur === archetype.id ? null : cur))}
                onClick={() => {
                  if (isTouchDevice) {
                    setExpandedId((cur) => (cur === archetype.id ? null : archetype.id));
                    return;
                  }
                  handleSelect(archetype);
                }}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg">{archetype.label}</h3>
                    {isExpanded ? <Badge variant="secondary">Currently selected</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{archetype.desc}</p>

                  <div className={cn("overflow-hidden transition-[max-height] duration-200 ease-in-out", isExpanded ? "max-h-96" : "max-h-0")}>
                    <div className="pt-2 space-y-3">
                      <div>
                        <p className="text-xs tracking-wide font-semibold text-muted-foreground mb-1">STRENGTHS</p>
                        <ul className="text-sm space-y-1">
                          {archetype.pathSummary.perks.map((perk) => <li key={perk}>• {perk}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs tracking-wide font-semibold text-muted-foreground mb-1">CHALLENGES</p>
                        <ul className="text-sm space-y-1">
                          {archetype.pathSummary.downsides.map((downside) => <li key={downside}>• {downside}</li>)}
                        </ul>
                      </div>

                      {isTouchDevice ? (
                        <div className="pt-1">
                          <Button
                            data-test="background-continue"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelect(archetype);
                            }}
                            className="w-full"
                          >
                            Select
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChooseBackground;
