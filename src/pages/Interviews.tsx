import { useEffect, useMemo, useState } from "react";
import { useGame, type InterviewResult } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import {
  computeInterviewResults,
  getInterviewProfile,
  selectInterviewQuestions,
  type InterviewQuestion,
} from "@/data/interviewQuestions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const InterviewSession = ({
  teamId,
  saveSeed,
  onComplete,
  onBack,
}: {
  teamId: string;
  saveSeed: number;
  onComplete: (answers: Record<string, number>, result: InterviewResult) => void;
  onBack: () => void;
}) => {
  const team = getTeamById(teamId);
  const profile = getInterviewProfile(teamId);
  const questions = useMemo<InterviewQuestion[]>(() => selectInterviewQuestions(teamId, 4, saveSeed), [teamId, saveSeed]);
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
      onComplete(newScores, computeInterviewResults(newScores, profile));
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
  const [activeInterview, setActiveInterview] = useState<string | null>(null);

  const handleComplete = (teamId: string, answers: Record<string, number>, result: InterviewResult) => {
    dispatch({ type: "COMPLETE_INTERVIEW", payload: { teamId, answers, result } });
    setActiveInterview(null);
  };

  useEffect(() => {
    if (state.interviews.completedCount === 3 && state.offers.length === 0) {
      dispatch({ type: "GENERATE_OFFERS" });
    }
  }, [dispatch, state.interviews.completedCount, state.offers.length]);

  if (activeInterview) {
    return (
      <InterviewSession
        key={activeInterview}
        teamId={activeInterview}
        saveSeed={state.saveSeed}
        onComplete={(answers, result) => handleComplete(activeInterview, answers, result)}
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
        <p className="text-xs text-muted-foreground text-center mb-4">
          Debug: completedCount={state.interviews.completedCount}
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
                    <p className="text-xs text-muted-foreground">debug completed={String(item.completed)}</p>
                  </div>
                  {item.completed ? (
                    <div className="text-right">
                      <Badge className="bg-primary text-primary-foreground">✓ Done</Badge>
                      {item.result && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Owner {item.result.ownerAlignScore >= 1 ? "Strong" : "Weak"} · GM {item.result.gmTrustScore >= 1 ? "Strong" : "Weak"}
                        </p>
                      )}
                    </div>
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
