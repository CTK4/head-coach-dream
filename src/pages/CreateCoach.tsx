import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CreateCoach = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState(state.coach.name);
  const [age, setAge] = useState(state.coach.age);
  const [hometown, setHometown] = useState(state.coach.hometown);

  const handleContinue = () => {
    if (!name.trim()) return;
    dispatch({ type: "SET_COACH", payload: { name: name.trim(), age, hometown: hometown.trim() } });
    dispatch({ type: "SET_PHASE", payload: "BACKGROUND" });
    navigate("/background");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Your Coach</CardTitle>
          <p className="text-sm text-muted-foreground text-center">Build your coaching identity</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Coach Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min={28} max={70} value={age} onChange={(e) => setAge(Number(e.target.value))} className="bg-secondary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hometown">Hometown</Label>
            <Input id="hometown" placeholder="City, State" value={hometown} onChange={(e) => setHometown(e.target.value)} className="bg-secondary" />
          </div>
          <Button onClick={handleContinue} disabled={!name.trim()} className="w-full mt-4">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCoach;
