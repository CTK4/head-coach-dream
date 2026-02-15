import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { getInterviewQuestions, type InterviewQuestion } from "@/data/interviewQuestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const InterviewSession = ({
  teamId,
  onComplete,
  onBack,
}: {
  teamId: string;
  onComplete: (answers: Record<string, number>) => void;
  onBack: () => void;
}) => {
  const team = getTeamById(teamId);
  const [questions] = useState<InterviewQuestion[]>(() => getInterviewQuestions(4));
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  const question = questions[currentQ];
  if (!question) return null;

  const handleAnswer = (delta: Record<string, number>) => {
    const newScores = { ...scores };
    for (const [axis, val] of Object.entries(delta)) {
      newScores[axis] = (newScores[axis] ?? 0) + val;
    }
    setScores(newScores);

    if (currentQ + 1 >= questions.length) {
      onComplete(newScores);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">← Back to Interviews</Button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{team?.name ?? teamId} Interview</h2>
          <p className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</p>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-lg font-medium mb-6 leading-relaxed">{question.prompt}</p>
            <div className="space-y-3">
              {question.answers.map((ans) => (
                <Card
                  key={ans.key}
                  className="cursor-pointer transition-all hover:border-primary hover:bg-secondary/50"
                  onClick={() => handleAnswer(ans.delta)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Badge variant="outline" className="shrink-0 mt-0.5">{ans.key}</Badge>
                      <p className="text-sm">{ans.text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Interviews = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [activeInterview, setActiveInterview] = useState<string | null>(null);

  const handleComplete = (teamId: string, answers: Record<string, number>) => {
    dispatch({ type: "COMPLETE_INTERVIEW", payload: { teamId, answers } });
    setActiveInterview(null);

    // Check if all completed
    const newCompleted = state.interviews.completedCount + 1;
    if (newCompleted >= 3) {
      setTimeout(() => {
        dispatch({ type: "GENERATE_OFFERS" });
        navigate("/offers");
      }, 500);
    }
  };

  if (activeInterview) {
    return (
      <InterviewSession
        teamId={activeInterview}
        onComplete={(answers) => handleComplete(activeInterview, answers)}
        onBack={() => setActiveInterview(null)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Team Interviews</h1>
        <p className="text-muted-foreground text-center mb-8">
          Complete all three interviews to receive offers ({state.interviews.completedCount}/3)
        </p>
        <div className="grid gap-4">
          {state.interviews.items.map((item) => {
            const team = getTeamById(item.teamId);
            return (
              <Card
                key={item.teamId}
                className={`cursor-pointer transition-all ${item.completed ? "border-primary/50 opacity-80" : "hover:border-primary hover:shadow-lg hover:shadow-primary/10"}`}
                onClick={() => !item.completed && setActiveInterview(item.teamId)}
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-semibold text-lg">{team?.name ?? item.teamId}</h3>
                    <p className="text-sm text-muted-foreground">{team?.region}</p>
                  </div>
                  {item.completed ? (
                    <Badge className="bg-primary text-primary-foreground">✓ Done</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Interviews;
