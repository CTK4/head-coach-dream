import { useEffect, useMemo, useState } from "react";
import { useGame, type InterviewResult } from "@/context/GameContext";
import { getOwnerByTeam, getTeamById } from "@/data/leagueDb";
import {
  computeInterviewResults,
  getInterviewProfile,
  selectInterviewQuestions,
  type InterviewQuestion,
} from "@/data/interviewQuestions";
import { getFlavorLine, type OfferTier } from "@/engine/interviewFlavor";
import { parsePersonalityTags } from "@/engine/personalityTags";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function resolveOfferTier(result: InterviewResult, profile: ReturnType<typeof getInterviewProfile>): OfferTier {
  const threshold = average([
    profile.offerThreshold.ownerAlignScore,
    profile.offerThreshold.gmTrustScore,
    profile.offerThreshold.schemeFitScore,
    profile.offerThreshold.mediaScore,
  ]);
  const score = average([
    result.ownerAlignScore,
    result.gmTrustScore,
    result.schemeFitScore,
    result.mediaScore,
  ]) + result.autonomyDelta * 0.2 + result.leashDelta * 0.1;
  const normalized = threshold > 0 ? score / threshold : 0;

  if (normalized >= 1.45) return "PREMIUM";
  if (normalized >= 1.25) return "STANDARD";
  if (normalized >= 1.05) return "CONDITIONAL";
  return "REJECT";
}

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
  const ownerTags = useMemo(() => {
    const owner = getOwnerByTeam(teamId);
    return parsePersonalityTags(owner?.Column1);
  }, [teamId]);
  const questions = useMemo<InterviewQuestion[]>(() => selectInterviewQuestions(teamId, 4, saveSeed), [teamId, saveSeed]);
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [finalResult, setFinalResult] = useState<{ result: InterviewResult; tier: OfferTier; answers: Record<string, number> } | null>(null);

  const question = questions[currentQ];
  if (!question) return null;

  const handleAnswer = (delta: Record<string, number>) => {
    const newScores = { ...scores };
    for (const [axis, val] of Object.entries(delta)) {
      newScores[axis] = (newScores[axis] ?? 0) + val;
    }
    setScores(newScores);

    if (currentQ + 1 >= questions.length) {
      const result = computeInterviewResults(newScores, profile);
      const tier = resolveOfferTier(result, profile);
      setFinalResult({ result, tier, answers: newScores });
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  if (finalResult) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Interview Complete</h2>
              <Badge className="w-fit" variant="secondary">{finalResult.tier}</Badge>
              <p className="text-sm text-muted-foreground">
                {getFlavorLine({ ownerTags, theme: "END", phase: "END", tier: finalResult.tier })}
              </p>
              <Button onClick={() => onComplete(finalResult.answers, finalResult.result)}>Return to Interviews</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-4">← Back to Interviews</Button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{team?.name ?? teamId} Interview</h2>
          <p className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-lg font-medium mb-6 leading-relaxed">{question.prompt}</p>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground mb-2">THEME · {question.cluster.toUpperCase()}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {getFlavorLine({ ownerTags, theme: question.cluster, phase: "DURING" })}
            </p>
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
