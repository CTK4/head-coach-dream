import { useMemo, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { createInterviewSeed, generateInterview, scoreInterview } from "@/engine/interviewHiring/engine";
import { getTeamConfig, loadInterviewBank } from "@/engine/interviewHiring/bankLoader";

const defaults = {
  leagueSeed: 12345,
  teamHash: 67890,
  saveSlotId: 1,
  weekIndex: 1,
  interviewIndex: 0,
};

const getNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function InterviewRunner() {
  const { teamId } = useParams();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const parsed = {
    leagueSeed: getNumber(params.get("leagueSeed"), defaults.leagueSeed),
    teamHash: getNumber(params.get("teamHash"), defaults.teamHash),
    saveSlotId: getNumber(params.get("saveSlotId"), defaults.saveSlotId),
    weekIndex: getNumber(params.get("weekIndex"), defaults.weekIndex),
    interviewIndex: getNumber(params.get("interviewIndex"), defaults.interviewIndex),
  };

  const availableTeamIds = loadInterviewBank().systems.map((s) => s.team.team_id);
  const unknownTeam = !teamId || !availableTeamIds.includes(teamId);

  const model = useMemo(() => {
    if (!teamId || unknownTeam) return null;
    try {
      const config = getTeamConfig(teamId);
      const seed = createInterviewSeed(
        parsed.leagueSeed,
        parsed.teamHash,
        parsed.saveSlotId,
        parsed.weekIndex,
        parsed.interviewIndex,
      );
      const session = generateInterview(config, seed);
      return { config, seed, session, error: null as string | null };
    } catch (error) {
      return { config: null, seed: 0, session: null, error: error instanceof Error ? error.message : String(error) };
    }
  }, [teamId, unknownTeam, parsed.interviewIndex, parsed.leagueSeed, parsed.saveSlotId, parsed.teamHash, parsed.weekIndex]);

  if (!teamId) return <div className="p-6">Missing teamId route parameter.</div>;

  if (unknownTeam) {
    return <div className="p-6">Unknown team: {teamId}. Available: {availableTeamIds.join(", ")}</div>;
  }

  if (!model) return null;

  if (model.error || !model.config || !model.session) {
    return <div className="p-6">Unable to start interview: {model.error}</div>;
  }

  const { config, session, seed } = model;
  const done = step >= session.questions.length;
  const result = done ? scoreInterview(config, session.questions, answers, seed) : null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Interview Runner: {config.team.team_name}</h1>
      <p className="text-sm text-muted-foreground">Seed: {seed}</p>

      {!done ? (
        <div className="border rounded p-4 space-y-4">
          <p className="text-sm">Question {step + 1} / {session.questions.length}</p>
          <p className="font-medium">{session.questions[step].question.asker ?? "Context"}: {session.questions[step].question.prompt}</p>
          <div className="space-y-2">
            {session.questions[step].question.options.map((opt) => (
              <button
                key={opt.choice_id}
                className="block w-full text-left border rounded p-2 hover:bg-muted"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [session.questions[step].question.question_id]: opt.choice_id }));
                  setStep((s) => s + 1);
                }}
              >
                <strong>{opt.choice_id}.</strong> {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="border rounded p-4 space-y-3">
          <h2 className="text-xl font-semibold">Result: {result?.band}</h2>
          <p>Hire Score: {result?.hireScore.toFixed(2)} (base {result?.hireScoreBase.toFixed(2)}, chemistry {result?.chemistryDelta})</p>
          <p>Gates: {result?.gatePass ? "PASS" : "FAIL"}</p>
          {!!result?.gateReasons.length && <ul className="list-disc pl-6">{result.gateReasons.map((r) => <li key={r}>{r}</li>)}</ul>}
          <p>Flags: {result?.flags.join(", ") || "None"}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(result?.metrics ?? {}).map(([k, v]) => <div key={k}>{k}: {v.toFixed(2)}</div>)}
          </div>
          <button
            className="border rounded px-3 py-1"
            onClick={() => {
              setAnswers({});
              setStep(0);
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
