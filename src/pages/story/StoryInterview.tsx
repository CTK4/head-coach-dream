import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/context/GameContext";
import { ROUTES } from "@/routes/appRoutes";
import { getTeamConfig } from "@/engine/interviewHiring/bankLoader";
import { scoreInterview } from "@/engine/interviewHiring/engine";
import type { OfferItem, SelectedQuestion as EngineSelectedQuestion } from "@/engine/interviewHiring/types";
import { selectInterviewQuestions, type InterviewQuestion } from "@/engine/interviews/interviewSelector";

const STORY_TEAM_IDS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BIRMINGHAM_VULCANS"] as const;
type StoryTeamId = (typeof STORY_TEAM_IDS)[number];

type StoryOffer = {
  teamId: StoryTeamId;
  teamName: string;
  city: string;
  gmName: string;
  strategyTag: string;
  years: number;
  salary: number;
  autonomy: number;
  patience: number;
};

type OfferDecision = "ACCEPTED" | "DECLINED";

type InterviewOutcome = {
  band: "HIRED" | "BORDERLINE" | "REJECTED";
  hireScore: number;
  gatePass: boolean;
  gateReasons: string[];
};

const OFFER_TEMPLATE: Record<StoryTeamId, StoryOffer> = {
  MILWAUKEE_NORTHSHORE: {
    teamId: "MILWAUKEE_NORTHSHORE",
    teamName: "Milwaukee Northshore",
    city: "Milwaukee, WI",
    gmName: "Owen Hartley",
    strategyTag: "steady_build",
    years: 4,
    salary: 6_000_000,
    autonomy: 68,
    patience: 64,
  },
  ATLANTA_APEX: {
    teamId: "ATLANTA_APEX",
    teamName: "Atlanta",
    city: "Atlanta, GA",
    gmName: "Tyler Redhut",
    strategyTag: "win_now",
    years: 3,
    salary: 8_000_000,
    autonomy: 58,
    patience: 45,
  },
  BIRMINGHAM_VULCANS: {
    teamId: "BIRMINGHAM_VULCANS",
    teamName: "Birmingham",
    city: "Birmingham, AL",
    gmName: "Devin Porter",
    strategyTag: "youth_movement",
    years: 5,
    salary: 5_000_000,
    autonomy: 80,
    patience: 78,
  },
};

function toOfferItem(offer: StoryOffer): OfferItem {
  return {
    teamId: offer.teamId,
    years: offer.years,
    salary: offer.salary,
    autonomy: offer.autonomy,
    patience: offer.patience,
    mediaNarrativeKey: `offer.${offer.strategyTag}`,
    base: {
      years: offer.years,
      salary: offer.salary,
      autonomy: offer.autonomy,
    },
  };
}

function asEngineQuestionSource(questions: InterviewQuestion[]): EngineSelectedQuestion[] {
  return questions.map((question, index) => ({
    source: index < 3 ? "contextual" : "team_pool",
    question,
  }));
}

export default function StoryInterview() {
  const { dispatch, state } = useGame();
  const navigate = useNavigate();

  const [stage, setStage] = useState<"INTRO" | "QUESTION" | "RESULT" | "SELECT">("INTRO");
  const [currentInterviewIndex, setCurrentInterviewIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answersByTeam, setAnswersByTeam] = useState<Partial<Record<StoryTeamId, Record<string, string>>>>({});
  const [receivedOffers, setReceivedOffers] = useState<Partial<Record<StoryTeamId, StoryOffer>>>({});
  const [decisionsByTeam, setDecisionsByTeam] = useState<Partial<Record<StoryTeamId, OfferDecision>>>({});
  const [outcomesByTeam, setOutcomesByTeam] = useState<Partial<Record<StoryTeamId, InterviewOutcome>>>({});
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<StoryTeamId | null>(null);

  const activeTeamId = STORY_TEAM_IDS[Math.min(currentInterviewIndex, STORY_TEAM_IDS.length - 1)];
  const activeOffer = OFFER_TEMPLATE[activeTeamId];

  const interviewPackResult = useMemo(() => {
    try {
      const selected = selectInterviewQuestions({
        leagueSeed: Number(state.saveSeed ?? 1),
        teamId: activeTeamId,
        saveSlotId: 1,
        weekIndex: Number(state.week ?? 1),
        interviewIndex: currentInterviewIndex,
      });
      if (selected.questions.length !== 6) {
        return {
          questions: [] as InterviewQuestion[],
          error: `Story interview question selection returned ${selected.questions.length} questions for ${activeOffer.teamName}.`,
        };
      }
      return { questions: selected.questions, error: null as string | null };
    } catch (error) {
      return {
        questions: [] as InterviewQuestion[],
        error: error instanceof Error ? error.message : "Story interview setup failed.",
      };
    }
  }, [activeTeamId, activeOffer.teamName, currentInterviewIndex, state.saveSeed, state.week]);

  const currentQuestion = interviewPackResult.questions[currentQuestionIndex];
  const gmName = useMemo(() => {
    try {
      const cfg = getTeamConfig(activeTeamId);
      if (cfg.team.gm && typeof cfg.team.gm === "object") {
        return String((cfg.team.gm as { name?: string }).name ?? activeOffer.gmName);
      }
      return activeOffer.gmName;
    } catch {
      return activeOffer.gmName;
    }
  }, [activeOffer.gmName, activeTeamId]);

  if (interviewPackResult.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>Story Mode failed to load</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Required interview data is missing or invalid for this franchise.</p>
            <p className="text-xs text-muted-foreground">{interviewPackResult.error}</p>
            <Button onClick={() => navigate(ROUTES.saveMode)}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const goToNextInterview = () => {
    const nextInterview = currentInterviewIndex + 1;
    if (nextInterview >= STORY_TEAM_IDS.length) {
      setStage("SELECT");
      return;
    }
    setCurrentInterviewIndex(nextInterview);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setStage("INTRO");
  };

  const finalizeInterview = (finalAnswers: Record<string, string>) => {
    try {
      const config = getTeamConfig(activeTeamId);
      const engineQuestions = asEngineQuestionSource(interviewPackResult.questions);
      const score = scoreInterview(config, engineQuestions, finalAnswers, Number(state.saveSeed ?? 1) ^ currentInterviewIndex);
      const outcome: InterviewOutcome = {
        band: score.band,
        hireScore: score.hireScore,
        gatePass: score.gatePass,
        gateReasons: score.gateReasons,
      };
      setOutcomesByTeam((prev) => ({ ...prev, [activeTeamId]: outcome }));
      setAnswersByTeam((prev) => ({ ...prev, [activeTeamId]: finalAnswers }));
      if (score.band === "HIRED") {
        setReceivedOffers((prev) => ({ ...prev, [activeTeamId]: activeOffer }));
      }
      setStage("RESULT");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to score interview.";
      setOutcomesByTeam((prev) => ({
        ...prev,
        [activeTeamId]: { band: "REJECTED", hireScore: 0, gatePass: false, gateReasons: [message] },
      }));
      setStage("RESULT");
    }
  };

  const onAnswer = (choiceId: string) => {
    if (!currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.question_id]: choiceId };
    setAnswers(nextAnswers);
    if (currentQuestionIndex >= 5) {
      setTimeout(() => {
        finalizeInterview(nextAnswers);
      }, 0);
      return;
    }
    setCurrentQuestionIndex((index) => index + 1);
  };

  const onConfirmSelection = () => {
    if (!selectedFranchiseId) return;
    const selectedOffer = receivedOffers[selectedFranchiseId];
    if (!selectedOffer) return;

    dispatch({
      type: "INIT_NEW_GAME_FROM_STORY",
      payload: {
        offer: toOfferItem(selectedOffer),
        teamName: selectedOffer.teamName,
        gmName: selectedOffer.gmName,
      },
    });
    navigate(ROUTES.onboarding);
  };

  if (stage === "SELECT") {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-black">Choose Your Franchise</h2>
        {STORY_TEAM_IDS.map((teamId) => {
          const offer = receivedOffers[teamId];
          const outcome = outcomesByTeam[teamId];
          return (
            <Card key={teamId} className={selectedFranchiseId === teamId ? "border-primary" : ""}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="font-bold">{OFFER_TEMPLATE[teamId].teamName}</div>
                  {offer ? (
                    <div className="text-sm text-muted-foreground">
                      {offer.city} · {offer.years} years · ${(offer.salary / 1_000_000).toFixed(1)}M/yr · Autonomy {offer.autonomy} · Patience {offer.patience}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No offer received{outcome?.gateReasons?.length ? ` (${outcome.gateReasons[0]})` : ""}
                    </div>
                  )}
                </div>
                <Button
                  variant={selectedFranchiseId === teamId ? "default" : "outline"}
                  disabled={!offer}
                  onClick={() => setSelectedFranchiseId(teamId)}
                >
                  {selectedFranchiseId === teamId ? "Selected" : "Select"}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-end">
          <Button disabled={!selectedFranchiseId} onClick={onConfirmSelection}>Confirm Selection</Button>
        </div>
      </div>
    );
  }

  if (stage === "RESULT") {
    const result = outcomesByTeam[activeTeamId];
    const offer = receivedOffers[activeTeamId];
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>{activeOffer.teamName} Interview Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Band: {result?.band ?? "REJECTED"} · Hire Score: {result?.hireScore?.toFixed(1) ?? "0.0"}
            </p>
            {offer ? (
              <p>{offer.years} years · ${(offer.salary / 1_000_000).toFixed(1)}M/year · Autonomy {offer.autonomy} · Patience {offer.patience}</p>
            ) : (
              <p>No offer from {activeOffer.teamName}.</p>
            )}
            {result?.gateReasons?.length ? (
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {result.gateReasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
            ) : null}
            <div className="flex gap-2">
              <Button onClick={() => { setDecisionsByTeam((prev) => ({ ...prev, [activeTeamId]: offer ? "ACCEPTED" : "DECLINED" })); goToNextInterview(); }}>
                {currentInterviewIndex === STORY_TEAM_IDS.length - 1 ? "Review Offers" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{activeOffer.teamName} · {activeOffer.city}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stage === "INTRO" ? (
            <>
              <p className="text-sm text-muted-foreground">GM: {gmName}</p>
              <p>Interview {currentInterviewIndex + 1} of 3. You will answer 6 questions.</p>
              <Button onClick={() => setStage("QUESTION")}>Begin Interview</Button>
            </>
          ) : null}

          {stage === "QUESTION" && currentQuestion ? (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Question {currentQuestionIndex + 1} / 6</Badge>
                <Badge variant="secondary">{currentQuestionIndex < 3 ? "Contextual" : "Team"}</Badge>
              </div>
              <div className="text-lg font-semibold">{currentQuestion.prompt}</div>
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option.choice_id}
                    variant="outline"
                    className="h-auto w-full justify-start whitespace-normal text-left"
                    onClick={() => onAnswer(option.choice_id)}
                  >
                    <span className="mr-2 font-bold">{option.choice_id}.</span>
                    <span>{option.text}</span>
                  </Button>
                ))}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
