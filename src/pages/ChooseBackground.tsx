import { useGame } from "@/context/GameContext";
import { ARCHETYPES, type Archetype } from "@/data/archetypes";
import { getArchetypeTraits } from "@/data/archetypeTraits";
import { Card, CardContent } from "@/components/ui/card";
import { applyArchetypeDeltas, enforceArchetypeReputationCaps } from "@/engine/reputation";

const ChooseBackground = () => {
  const { dispatch } = useGame();

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
          {ARCHETYPES.map((archetype) => (
            <Card
              key={archetype.id}
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
              onClick={() => handleSelect(archetype)}
            >
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg">{archetype.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{archetype.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseBackground;
