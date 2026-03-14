import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGame } from "@/context/GameContext";
import { ROUTES } from "@/routes/appRoutes";
import { getTeamConfig } from "@/engine/interviewHiring/bankLoader";
import { scoreInterview, deriveInterviewOutcome } from "@/engine/interviewHiring/engine";
import type { InterviewOutcome as EngineInterviewOutcome } from "@/engine/interviewHiring/types";
import { getFlavorLine } from "@/engine/interviewFlavor";
import { interviewProfiles } from "@/data/interviewProfiles";
import { selectInterviewQuestions, type InterviewQuestion } from "@/engine/interviews/interviewSelector";
import type { SelectedQuestion as EngineSelectedQuestion } from "@/engine/interviewHiring/types";

const STORY_TEAM_IDS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "OMAHA_STAMPEDE"] as const;
type StoryTeamId = (typeof STORY_TEAM_IDS)[number];
const INTERVIEW_BANK_TEAM_BY_STORY_TEAM: Record<StoryTeamId, string> = {
  MILWAUKEE_NORTHSHORE: "MILWAUKEE_NORTHSHORE",
  ATLANTA_APEX: "ATLANTA_APEX",
  // Interview question bank still keys this franchise under the legacy Birmingham config.
  OMAHA_STAMPEDE: "BIRMINGHAM_VULCANS",
};

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

type OfferItem = {
  teamId: StoryTeamId;
  years: number;
  salary: number;
  autonomy: number;
  patience: number;
  mediaNarrativeKey: string;
  base: { years: number; salary: number; autonomy: number };
};

type LocalInterviewOutcome = {
  band: "HIRED" | "BORDERLINE" | "REJECTED";
  hireScore: number;
  gatePass: boolean;
  gateReasons: string[];
  full?: EngineInterviewOutcome;
};

const TEAM_META: Record<StoryTeamId, { teamName: string; city: string; gmName: string; strategyTag: string; theme: string }> = {
  MILWAUKEE_NORTHSHORE: { teamName: "Milwaukee Northshore", city: "Milwaukee, WI", gmName: "Owen Hartley", strategyTag: "steady_build", theme: "CULTURE" },
  ATLANTA_APEX: { teamName: "Atlanta Apex", city: "Atlanta, GA", gmName: "Tyler Redhut", strategyTag: "win_now", theme: "MEDIA" },
  OMAHA_STAMPEDE: { teamName: "Omaha Stampede", city: "Omaha, NE", gmName: "Devin Porter", strategyTag: "youth_movement", theme: "ROSTER" },
};

function offerFromOutcome(teamId: StoryTeamId, outcome: EngineInterviewOutcome): StoryOffer {
  const meta = TEAM_META[teamId];
  const salaryByBand: Record<string, number> = { PREMIUM: 10_000_000, HIGH: 8_000_000, MID: 6_000_000, LOW: 4_000_000 };
  const yearsByBand: Record<string, number> = { PREMIUM: 6, HIGH: 5, MID: 4, LOW: 3 };
  return {
    teamId,
    teamName: meta.teamName,
    city: meta.city,
    gmName: meta.gmName,
    strategyTag: meta.strategyTag,
    years: yearsByBand[outcome.salaryBand] ?? 3,
    salary: salaryByBand[outcome.salaryBand] ?? 4_000_000,
    autonomy: outcome.autonomyGrant,
    patience: Math.min(100, 50 + outcome.leashLength * 8),
  };
}

function toOfferItem(offer: StoryOffer): OfferItem {
  return {
    teamId: offer.teamId,
    years: offer.years,
    salary: offer.salary,
    autonomy: offer.autonomy,
    patience: offer.patience,
    mediaNarrativeKey: `offer.${offer.strategyTag}`,
    base: { years: offer.years, salary: offer.salary, autonomy: offer.autonomy },
  };
}

function asEngineQuestionSource(questions: InterviewQuestion[]): EngineSelectedQuestion[] {
  return questions.map((question) => ({
    source: question.sourceBucket === "contextual" ? "contextual" : "team_pool",
    question,
  }));
}

function ownerTagsForTeam(teamId: StoryTeamId): string[] {
  const interviewBankTeamId = INTERVIEW_BANK_TEAM_BY_STORY_TEAM[teamId];
  return interviewProfiles[interviewBankTeamId]?.ownerPersonalityTags ?? [];
}

export default function StoryInterview() {
  const { dispatch, state } = useGame();
  const navigate = useNavigate();

  const isRehiring = state.careerStage === "REHIRING";
  const firingCount = state.careerHistory?.firings?.length ?? 0;

  const [stage, setStage] = useState<"INTRO" | "QUESTION" | "RESULT" | "SELECT">("INTRO");
  const [currentInterviewIndex, setCurrentInterviewIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answersByTeam, setAnswersByTeam] = useState<Partial<Record<StoryTeamId, Record<string, string>>>>({});
  const [receivedOffers, setReceivedOffers] = useState<Partial<Record<StoryTeamId, StoryOffer>>>({});
  const [decisionsByTeam, setDecisionsByTeam] = useState<Partial<Record<StoryTeamId, OfferDecision>>>({});
  const [outcomesByTeam, setOutcomesByTeam] = useState<Partial<Record<StoryTeamId, LocalInterviewOutcome>>>({});
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<StoryTeamId | null>(null);
  const [flavorText, setFlavorText] = useState<string>("");

  // Suppress unused variable warnings from state tracking
  void answersByTeam;
  void decisionsByTeam;

  const activeTeamId = STORY_TEAM_IDS[Math.min(currentInterviewIndex, STORY_TEAM_IDS.length - 1)];
  const activeMeta = TEAM_META[activeTeamId];

  const interviewPackResult = useMemo(() => {
    try {
      const selected = selectInterviewQuestions({
        leagueSeed: Number(state.saveSeed ?? 1),
        teamId: INTERVIEW_BANK_TEAM_BY_STORY_TEAM[activeTeamId],
        saveSlotId: 1,
        weekIndex: Number(state.week ?? 1),
        interviewIndex: currentInterviewIndex,
      });
      if (selected.questions.length !== 6) {
        return {
          questions: [] as InterviewQuestion[],
          error: `Story interview question selection returned ${selected.questions.length} questions for ${activeMeta.teamName}.`,
        };
      }
      return { questions: selected.questions, error: null as string | null };
    } catch (error) {
      return {
        questions: [] as InterviewQuestion[],
        error: error instanceof Error ? error.message : "Story interview setup failed.",
      };
    }
  }, [activeTeamId, activeMeta.teamName, currentInterviewIndex, state.saveSeed, state.week]);

  const currentQuestion = interviewPackResult.questions[currentQuestionIndex];
  const gmName = useMemo(() => {
    try {
      const cfg = getTeamConfig(INTERVIEW_BANK_TEAM_BY_STORY_TEAM[activeTeamId]);
      if (cfg.team.gm && typeof cfg.team.gm === "object") {
        return String((cfg.team.gm as { name?: string }).name ?? activeMeta.gmName);
      }
      return activeMeta.gmName;
    } catch {
      return activeMeta.gmName;
    }
  }, [activeMeta.gmName, activeTeamId]);

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
    setFlavorText("");
    setStage("INTRO");
  };

  const finalizeInterview = (finalAnswers: Record<string, string>) => {
    try {
      const config = getTeamConfig(INTERVIEW_BANK_TEAM_BY_STORY_TEAM[activeTeamId]);
      const engineQuestions = asEngineQuestionSource(interviewPackResult.questions);
      const score = scoreInterview(config, engineQuestions, finalAnswers, Number(state.saveSeed ?? 1) ^ currentInterviewIndex);
      const fullOutcome = deriveInterviewOutcome(score, config);

      // Apply firing history penalty during rehiring
      if (isRehiring && firingCount > 0) {
        fullOutcome.autonomyGrant = Math.max(40, fullOutcome.autonomyGrant - firingCount * 10);
        fullOutcome.leashLength = Math.max(1, fullOutcome.leashLength - firingCount);
      }

      const outcome: LocalInterviewOutcome = {
        band: score.band,
        hireScore: score.hireScore,
        gatePass: score.gatePass,
        gateReasons: score.gateReasons,
        full: fullOutcome,
      };
      setOutcomesByTeam((prev) => ({ ...prev, [activeTeamId]: outcome }));
      setAnswersByTeam((prev) => ({ ...prev, [activeTeamId]: finalAnswers }));

      if (score.band === "HIRED") {
        const offer = offerFromOutcome(activeTeamId, fullOutcome);
        setReceivedOffers((prev) => ({ ...prev, [activeTeamId]: offer }));
      }

      // Show owner-personality-aware end flavor text
      const ownerTags = ownerTagsForTeam(activeTeamId);
      const tier = score.band === "HIRED" ? (fullOutcome.salaryBand === "PREMIUM" ? "PREMIUM" : "STANDARD") : "REJECT";
      const flavor = getFlavorLine({ ownerTags, theme: activeMeta.theme, phase: "END", tier: tier as any });
      setFlavorText(flavor);
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

    if (currentQuestionIndex < 5) {
      // Show owner voice flavor text after each answer during the interview
      const ownerTags = ownerTagsForTeam(activeTeamId);
      const flavor = getFlavorLine({ ownerTags, theme: activeMeta.theme, phase: "DURING" });
      setFlavorText(flavor);
      setCurrentQuestionIndex((index) => index + 1);
    } else {
      setTimeout(() => { finalizeInterview(nextAnswers); }, 0);
    }
  };

  const onConfirmSelection = () => {
    if (!selectedFranchiseId) return;
    const selectedOffer = receivedOffers[selectedFranchiseId];
    if (!selectedOffer) return;
    const selectedOutcome = outcomesByTeam[selectedFranchiseId];

    dispatch({
      type: "INIT_NEW_GAME_FROM_STORY",
      payload: {
        offer: toOfferItem(selectedOffer),
        teamName: selectedOffer.teamName,
        gmName: selectedOffer.gmName,
        interviewOutcome: selectedOutcome?.full,
        isRehire: isRehiring,
      },
    });
    navigate(ROUTES.onboarding, { replace: true });
  };

  if (stage === "SELECT") {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-black">{isRehiring ? "Choose Your Next Franchise" : "Choose Your Franchise"}</h2>
        {isRehiring && firingCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Your firing history has been factored into the offers. Each previous firing reduces starting autonomy by 10 and leash by 1 season.
          </p>
        )}
        {STORY_TEAM_IDS.map((teamId) => {
          const offer = receivedOffers[teamId];
          const outcome = outcomesByTeam[teamId];
          return (
            <Card key={teamId} className={selectedFranchiseId === teamId ? "border-primary" : ""}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="font-bold">{TEAM_META[teamId].teamName}</div>
                  {offer ? (
                    <div className="text-sm text-muted-foreground">
                      {TEAM_META[teamId].city} · {offer.years} years · ${(offer.salary / 1_000_000).toFixed(1)}M/yr · Autonomy {offer.autonomy} · Patience {offer.patience}
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
    const hasSystemError = Object.values(outcomesByTeam).some((teamResult) =>
      teamResult?.gateReasons?.some((reason) =>
        typeof reason === "string" && (reason.includes("Error") || reason.includes("Unable") || reason.length > 60)
      )
    );
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>{activeMeta.teamName} Interview Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Band: {result?.band ?? "REJECTED"} · Hire Score: {result?.hireScore?.toFixed(1) ?? "0.0"}
            </p>
            {flavorText && (
              <p className="text-sm italic text-muted-foreground border-l-2 pl-3">{flavorText}</p>
            )}
            {offer ? (
              <div className="space-y-1">
                <p>{offer.years} years · ${(offer.salary / 1_000_000).toFixed(1)}M/year · Autonomy {offer.autonomy} · Patience {offer.patience}</p>
                {result?.full && (
                  <p className="text-xs text-muted-foreground">
                    Owner alignment: {result.full.ownerApproval} · GM confidence: {result.full.gmApproval}
                  </p>
                )}
              </div>
            ) : (
              <p>No offer from {activeMeta.teamName}.</p>
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
            {hasSystemError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Interview scoring error</AlertTitle>
                <AlertDescription>
                  We ran into a problem scoring your interview. This isn&apos;t a rejection — try reloading the page to retake the interview.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{activeMeta.teamName} · {activeMeta.city}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stage === "INTRO" ? (
            <>
              <p className="text-sm text-muted-foreground">GM: {gmName}</p>
              {isRehiring && firingCount > 0 ? (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Rehiring interview {currentInterviewIndex + 1} of 3. Your coaching history will shape the conversation.
                </p>
              ) : (
                <p>Interview {currentInterviewIndex + 1} of 3. You will answer 6 questions.</p>
              )}
              <Button onClick={() => setStage("QUESTION")}>Begin Interview</Button>
            </>
          ) : null}

          {stage === "QUESTION" && currentQuestion ? (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Question {currentQuestionIndex + 1} / 6</Badge>
                <Badge variant="secondary">{currentQuestionIndex < 3 ? "Contextual" : "Team"}</Badge>
              </div>
              {flavorText && (
                <p className="text-xs italic text-muted-foreground border-l-2 pl-2">{flavorText}</p>
              )}
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
