import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BACKGROUNDS = [
  { key: "offensive_guru", label: "Offensive Guru", desc: "You rose through the ranks calling plays. Your offenses are creative and explosive, but you'll need to trust your DC.", icon: "🏈" },
  { key: "defensive_mastermind", label: "Defensive Mastermind", desc: "Your defenses are feared. You build from the trenches and shut teams down, but your offense needs a strong OC.", icon: "🛡️" },
  { key: "special_teams_ace", label: "Special Teams Ace", desc: "You started on special teams and know the hidden yardage game. Unconventional, but you see angles others miss.", icon: "⚡" },
  { key: "qb_whisperer", label: "QB Whisperer", desc: "You've developed multiple franchise QBs. Your ability to groom talent is unmatched, but you need pieces around them.", icon: "🎯" },
  { key: "players_coach", label: "Player's Coach", desc: "Your locker rooms are tight. Players run through walls for you, but the front office wonders about your X's and O's.", icon: "🤝" },
];

const ChooseBackground = () => {
  const { dispatch } = useGame();
  const navigate = useNavigate();

  const handleSelect = (key: string) => {
    dispatch({ type: "SET_COACH", payload: { background: key } });
    dispatch({ type: "SET_PHASE", payload: "INTERVIEWS" });
    navigate("/interviews");
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Choose Your Background</h1>
        <p className="text-muted-foreground text-center mb-8">This shapes your coaching identity and reputation</p>
        <div className="grid gap-4">
          {BACKGROUNDS.map((bg) => (
            <Card
              key={bg.key}
              className="cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
              onClick={() => handleSelect(bg.key)}
            >
              <CardContent className="flex items-start gap-4 p-5">
                <span className="text-3xl mt-1">{bg.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{bg.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{bg.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseBackground;
