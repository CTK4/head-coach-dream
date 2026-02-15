import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Offers = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const handleAccept = (offer: typeof state.offers[0]) => {
    dispatch({ type: "ACCEPT_OFFER", payload: offer });
    navigate("/coordinators");
  };

  if (state.offers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-lg">No offers yet. Complete all interviews first.</p>
            <Button onClick={() => navigate("/interviews")} className="mt-4">Back to Interviews</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Your Offers</h1>
        <p className="text-muted-foreground text-center mb-8">Choose a team to lead</p>
        <div className="grid gap-4">
          {state.offers.map((offer) => {
            const team = getTeamById(offer.teamId);
            return (
              <Card key={offer.teamId} className="hover:border-primary transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{team?.name ?? offer.teamId}</h3>
                      <p className="text-sm text-muted-foreground">{team?.region}</p>
                    </div>
                    <Badge variant="secondary">{team?.conferenceId}</Badge>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="bg-secondary rounded-lg px-4 py-2 text-center">
                      <p className="text-xs text-muted-foreground">Contract</p>
                      <p className="font-bold">{offer.years} years</p>
                    </div>
                    <div className="bg-secondary rounded-lg px-4 py-2 text-center">
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-bold">${(offer.salary / 1_000_000).toFixed(1)}M/yr</p>
                    </div>
                  </div>
                  <Button onClick={() => handleAccept(offer)} className="w-full">
                    Accept Offer
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Offers;
