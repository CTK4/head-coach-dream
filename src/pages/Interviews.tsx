import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, type InterviewResult } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { evaluateInterviewSession, selectInterviewQuestions, type InterviewQuestion } from "@/data/interviewQuestions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MAX_INTERVIEW_QUESTIONS = 5;

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
  const questions = useMemo<InterviewQuestion[]>(
    () => selectInterviewQuestions(teamId, saveSeed, MAX_INTERVIEW_QUESTIONS).slice(0, MAX_INTERVIEW_QUESTIONS),
    [teamId, saveSeed]
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, number>>({});

  const question = questions[currentQ];
  if (!question) return null;

  const handleAnswer = (answerIdx: number, delta: Record<string, number>) => {
    const newScores = { ...scores };
    for (const [axis, val] of Object.entries(delta)) newScores[axis] = (newScores[axis] ?? 0) + val;

    const newAnswers = { ...answersByQuestionId, [question.id]: answerIdx };
    setScores(newScores);
    setAnswersByQuestionId(newAnswers);

    if (currentQ + 1 >= questions.length) {
      onComplete(
        newScores,
        evaluateInterviewSession({ teamId, questions, answersByQuestionId: newAnswers, axisTotals: newScores })
      );
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Interviews
        </Button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{team?.name ?? teamId} Interview</h2>
          <p className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</p>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-muted-foreground mb-2">
          Question {currentQ + 1} / {questions.length}
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-lg font-medium mb-6 leading-relaxed">{question.prompt}</p>
            <div className="space-y-3">
              {question.answers.map((ans, answerIdx) => (
                <Card
                  key={ans.key}
                  className="cursor-pointer transition-all hover:border-primary hover:bg-secondary/50"
                  onClick={() => handleAnswer(answerIdx, ans.delta)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Badge variant="outline" className="shrink-0 mt-0.5">
                        {ans.key}
                      </Badge>
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
  const [activeTeam, setActiveTeam] = useState<string | null>(null);

  const handleComplete = (teamId: string, answers: Record<string, number>, result: InterviewResult) => {
    dispatch({ type: "COMPLETE_INTERVIEW", payload: { teamId, answers, result } });
    setActiveTeam(null);
  };

  useEffect(() => {
    if (state.interviews.completedCount === 3 && state.offers.length === 0) {
      dispatch({ type: "GENERATE_OFFERS" });
      navigate("/onboarding/offers");
    }
  }, [dispatch, navigate, state.interviews.completedCount, state.offers.length]);

  if (activeTeam) {
    return (
      <InterviewSession
        key={activeTeam}
        teamId={activeTeam}
        saveSeed={state.saveSeed}
        onComplete={(answers, result) => handleComplete(activeTeam, answers, result)}
        onBack={() => setActiveTeam(null)}
      />
    );
  }

  const items = state.interviews.items;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Team Interviews</h1>
        <p className="text-muted-foreground text-center mb-8">
          Complete all three interviews to receive offers ({state.interviews.completedCount}/3)
        </p>
        <div className="space-y-4">
          {items.map((item) => {
            const team = getTeamById(item.teamId);
            return (
              <Card key={item.teamId} className="cursor-pointer" onClick={() => setActiveTeam(item.teamId)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{team?.name ?? item.teamId}</p>
                      {item.result && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Owner {item.result.interviewScore.toFixed(2)} · {item.result.offerTier}
                        </p>
                      )}
                    </div>
                    {item.completed ? <Badge>✓ Done</Badge> : <Badge variant="outline">Pending</Badge>}
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

export default Interviews;
