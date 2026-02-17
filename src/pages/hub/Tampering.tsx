import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Tampering() {
  const { dispatch } = useGame();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Legal Negotiation Window</CardTitle>
        <Button variant="secondary" onClick={() => dispatch({ type: "ADVANCE_CAREER_STAGE" })}>
          Continue
        </Button>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2">
        <div>Early UFA contact (no signing). This will preview “interested” targets and soft offers.</div>
        <div>For now: stage screen exists + flow is correct.</div>
      </CardContent>
    </Card>
  );
}
