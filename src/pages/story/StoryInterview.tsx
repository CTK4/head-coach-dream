import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTeamConfig } from "@/engine/interviewHiring/bankLoader";
import type { InterviewQuestion, OfferItem, QuestionOption } from "@/engine/interviewHiring/types";
import { useGame } from "@/context/GameContext";

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

type SelectedQuestion = InterviewQuestion & { source: "team_pool" | "contextual" };

type OfferDecision = "ACCEPTED" | "DECLINED";

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

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function chooseThreeDeterministic(teamId: StoryTeamId): SelectedQuestion[] {
  const cfg = getTeamConfig(teamId);
  const teamQuestions = (cfg.team_pool.questions ?? []).map((q) => ({ ...q, source: "team_pool" as const }));
  const contextualQuestions = (cfg.contextual_pool.questions ?? []).map((q) => ({ ...q, source: "contextual" as const }));
  const combined = [...teamQuestions, ...contextualQuestions];

  const uniqueById = new Map<string, SelectedQuestion>();
  for (const q of combined) {
    uniqueById.set(q.question_id, q);
  }

  return [...uniqueById.values()]
    .sort((a, b) => hashString(`${teamId}|STORY_MODE|${a.question_id}`) - hashString(`${teamId}|STORY_MODE|${b.question_id}`))
    .slice(0, 3);
}

function loadQuestionPack(): Record<StoryTeamId, SelectedQuestion[]> {
  if (typeof window === "undefined") {
    return {
      MILWAUKEE_NORTHSHORE: chooseThreeDeterministic("MILWAUKEE_NORTHSHORE"),
      ATLANTA_APEX: chooseThreeDeterministic("ATLANTA_APEX"),
      BIRMINGHAM_VULCANS: chooseThreeDeterministic("BIRMINGHAM_VULCANS"),
    };
  }

  const key = "story_mode_question_pack_v1";
  const cached = sessionStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as Record<StoryTeamId, SelectedQuestion[]>;
      if (parsed.MILWAUKEE_NORTHSHORE?.length === 3 && parsed.ATLANTA_APEX?.length === 3 && parsed.BIRMINGHAM_VULCANS?.length === 3) {
        return parsed;
      }
    } catch {
      // ignore and regenerate
    }
  }

  const next: Record<StoryTeamId, SelectedQuestion[]> = {
    MILWAUKEE_NORTHSHORE: chooseThreeDeterministic("MILWAUKEE_NORTHSHORE"),
    ATLANTA_APEX: chooseThreeDeterministic("ATLANTA_APEX"),
    BIRMINGHAM_VULCANS: chooseThreeDeterministic("BIRMINGHAM_VULCANS"),
  };
  sessionStorage.setItem(key, JSON.stringify(next));
  return next;
}

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

const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log("[story-mode]", ...args);
};

export default function StoryInterview() {
  const { dispatch } = useGame();
  const navigate = useNavigate();

  const questionPack = useMemo(loadQuestionPack, []);
  const [interviewIndex, setInterviewIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stage, setStage] = useState<"INTRO" | "QUESTION" | "OFFER" | "SELECT">("INTRO");
  const [answersByTeam, setAnswersByTeam] = useState<Record<StoryTeamId, Array<{ questionId: string; choiceId: string }>>>({
    MILWAUKEE_NORTHSHORE: [],
    ATLANTA_APEX: [],
    BIRMINGHAM_VULCANS: [],
  });
  const [offersByTeam, setOffersByTeam] = useState<Partial<Record<StoryTeamId, StoryOffer>>>({});
  const [decisionsByTeam, setDecisionsByTeam] = useState<Partial<Record<StoryTeamId, OfferDecision>>>({});
  const [selectedTeamId, setSelectedTeamId] = useState<StoryTeamId | null>(null);
  const [workingOffer, setWorkingOffer] = useState<StoryOffer>(OFFER_TEMPLATE.MILWAUKEE_NORTHSHORE);

  const teamId = STORY_TEAM_IDS[Math.min(interviewIndex, STORY_TEAM_IDS.length - 1)];
  const teamOfferTemplate = OFFER_TEMPLATE[teamId];
  const teamQuestions = questionPack[teamId] ?? [];
  const currentQuestion = teamQuestions[questionIndex];

  const teamConfig = getTeamConfig(teamId);
  const gmName = teamConfig.team.gm && typeof teamConfig.team.gm === "object" ? String((teamConfig.team.gm as any).name ?? teamOfferTemplate.gmName) : teamOfferTemplate.gmName;

  const advanceToNextInterview = () => {
    const nextInterview = interviewIndex + 1;
    if (nextInterview >= STORY_TEAM_IDS.length) {
      setStage("SELECT");
      return;
    }
    setInterviewIndex(nextInterview);
    setQuestionIndex(0);
    const nextTeamId = STORY_TEAM_IDS[nextInterview];
    setWorkingOffer(OFFER_TEMPLATE[nextTeamId]);
    setStage("INTRO");
  };

  const onAnswer = (option: QuestionOption) => {
    if (!currentQuestion) return;
    setAnswersByTeam((prev) => ({
      ...prev,
      [teamId]: [...prev[teamId], { questionId: currentQuestion.question_id, choiceId: option.choice_id }],
    }));

    if (questionIndex >= 2) {
      setStage("OFFER");
      return;
    }
    setQuestionIndex((prev) => prev + 1);
  };

  const onAccept = () => {
    setOffersByTeam((prev) => ({ ...prev, [teamId]: workingOffer }));
    setDecisionsByTeam((prev) => ({ ...prev, [teamId]: "ACCEPTED" }));
    advanceToNextInterview();
  };

  const onDecline = () => {
    setDecisionsByTeam((prev) => ({ ...prev, [teamId]: "DECLINED" }));
    advanceToNextInterview();
  };

  const selectableOffers = STORY_TEAM_IDS.map((id) => offersByTeam[id]).filter((offer): offer is StoryOffer => Boolean(offer));

  const onConfirmSelection = () => {
    if (!selectedTeamId) return;
    const selected = offersByTeam[selectedTeamId];
    if (!selected) return;

    devLog("selected question ids", Object.fromEntries(STORY_TEAM_IDS.map((id) => [id, questionPack[id].map((q) => q.question_id)])));
    devLog("story route reached", "/story/interview");

    dispatch({
      type: "INIT_NEW_GAME_FROM_STORY",
      payload: {
        offer: toOfferItem(selected),
        teamName: selected.teamName,
        gmName: selected.gmName,
      },
    });
    navigate("/onboarding");
  };

  if (stage === "SELECT") {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <h2 className="text-2xl font-black">Offers Received</h2>
        {STORY_TEAM_IDS.map((id) => {
          const offer = offersByTeam[id];
          const declined = decisionsByTeam[id] === "DECLINED";
          return (
            <Card key={id} className={declined ? "opacity-50" : selectedTeamId === id ? "border-primary" : ""}>
              <CardContent className="flex items-center justify-between p-4">
                {offer ? (
                  <div>
                    <div className="font-bold">{offer.teamName}</div>
                    <div className="text-sm text-muted-foreground">{offer.city} · {offer.years}yr / ${(offer.salary / 1_000_000).toFixed(1)}M · Autonomy {offer.autonomy} · Patience {offer.patience}</div>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold">{OFFER_TEMPLATE[id].teamName}</div>
                    <div className="text-sm text-muted-foreground">Unavailable (declined or not offered)</div>
                  </div>
                )}
                <Button variant={selectedTeamId === id ? "default" : "outline"} disabled={!offer} onClick={() => setSelectedTeamId(id)}>
                  {selectedTeamId === id ? "Selected" : "Select"}
                </Button>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-end">
          <Button disabled={!selectedTeamId || !selectableOffers.length} onClick={onConfirmSelection}>Confirm Selection</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>{teamOfferTemplate.teamName} · {teamOfferTemplate.city}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {stage === "INTRO" ? (
            <>
              <p className="text-sm text-muted-foreground">GM: {gmName}</p>
              <p>Interview {interviewIndex + 1} of 3. You are meeting with leadership to discuss vision, roster priorities, and organizational fit.</p>
              <Button onClick={() => setStage("QUESTION")}>Begin Interview</Button>
            </>
          ) : null}

          {stage === "QUESTION" && currentQuestion ? (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Question {questionIndex + 1} / 3</Badge>
                <Badge variant="secondary">{currentQuestion.source === "team_pool" ? "Team Pool" : "Contextual"}</Badge>
              </div>
              <div className="text-lg font-semibold">{currentQuestion.prompt}</div>
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <Button key={option.choice_id} variant="outline" className="h-auto w-full justify-start whitespace-normal text-left" onClick={() => onAnswer(option)}>
                    <span className="mr-2 font-bold">{option.choice_id}.</span>
                    <span>{option.text}</span>
                  </Button>
                ))}
              </div>
            </>
          ) : null}

          {stage === "OFFER" ? (
            <>
              <div className="text-sm text-muted-foreground">Offer after interview completion</div>
              <Card className="bg-muted/20">
                <CardContent className="space-y-2 p-4">
                  <div className="font-bold">{workingOffer.teamName} Offer</div>
                  <div className="text-sm">{workingOffer.years} years · ${(workingOffer.salary / 1_000_000).toFixed(1)}M / year · Autonomy {workingOffer.autonomy} · Patience {workingOffer.patience}</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setWorkingOffer((o) => ({ ...o, years: Math.max(2, o.years - 1) }))}>-1 Year</Button>
                    <Button size="sm" variant="outline" onClick={() => setWorkingOffer((o) => ({ ...o, years: Math.min(6, o.years + 1) }))}>+1 Year</Button>
                    <Button size="sm" variant="outline" onClick={() => setWorkingOffer((o) => ({ ...o, salary: Math.max(3_000_000, o.salary - 500_000) }))}>-$0.5M</Button>
                    <Button size="sm" variant="outline" onClick={() => setWorkingOffer((o) => ({ ...o, salary: o.salary + 500_000 }))}>+$0.5M</Button>
                  </div>
                </CardContent>
              </Card>
              <div className="flex gap-2">
                <Button onClick={onAccept}>Accept</Button>
                <Button variant="outline" onClick={() => setWorkingOffer(teamOfferTemplate)}>Negotiate Reset</Button>
                <Button variant="destructive" onClick={onDecline}>Decline</Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
