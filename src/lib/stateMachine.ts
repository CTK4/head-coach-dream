export type CareerStage =
  | "OFFSEASON_HUB"
  | "SEASON_AWARDS"
  | "ASSISTANT_HIRING"
  | "STAFF_CONSTRUCTION"
  | "ROSTER_REVIEW"
  | "RESIGN"
  | "COMBINE"
  | "TAMPERING"
  | "FREE_AGENCY"
  | "PRE_DRAFT"
  | "DRAFT"
  | "TRAINING_CAMP"
  | "PRESEASON"
  | "CUTDOWNS"
  | "REGULAR_SEASON";

export enum PhaseKeyEnum {
  PHASE_2_RETENTION = "PHASE_2_RETENTION",
  PHASE_3_COMBINE = "PHASE_3_COMBINE",
  PHASE_4_FREE_AGENCY = "PHASE_4_FREE_AGENCY",
  DRAFT = "DRAFT",
  REGULAR_SEASON_WEEK = "REGULAR_SEASON_WEEK",
  UNKNOWN = "UNKNOWN",
}

export type PhaseKey = `${PhaseKeyEnum}`;

export enum OffseasonStepEnum {
  RESIGNING = "RESIGNING",
  COMBINE = "COMBINE",
  TAMPERING = "TAMPERING",
  FREE_AGENCY = "FREE_AGENCY",
  PRE_DRAFT = "PRE_DRAFT",
  DRAFT = "DRAFT",
  TRAINING_CAMP = "TRAINING_CAMP",
  PRESEASON = "PRESEASON",
  CUT_DOWNS = "CUT_DOWNS",
}

export type OffseasonStepId = `${OffseasonStepEnum}`;

export type StateMachineConfig = {
  enableTamperingStep: boolean;
};

function upper(v: unknown): string {
  return typeof v === "string" ? v.toUpperCase() : "";
}

export class StateMachine {
  static getPhaseKey(state: any): PhaseKey {
    const raw = state?.phase ?? state?.careerStage ?? state?.seasonPhase ?? state?.hubPhase ?? "UNKNOWN";
    const p = upper(raw);

    if (p.includes("RETENTION") || p.includes("RESIGN") || p.includes("PHASE_2_RETENTION")) return PhaseKeyEnum.PHASE_2_RETENTION;
    if (p.includes("COMBINE")) return PhaseKeyEnum.PHASE_3_COMBINE;
    if (p.includes("FREE_AGENCY") || p.includes("TAMPERING")) return PhaseKeyEnum.PHASE_4_FREE_AGENCY;
    if (p.includes("DRAFT")) return PhaseKeyEnum.DRAFT;
    if (p.includes("REGULAR") || p.includes("WEEK")) return PhaseKeyEnum.REGULAR_SEASON_WEEK;
    return PhaseKeyEnum.UNKNOWN;
  }

  static getOffseasonSequence(config: StateMachineConfig): OffseasonStepId[] {
    const base: OffseasonStepId[] = [
      OffseasonStepEnum.RESIGNING,
      OffseasonStepEnum.COMBINE,
      ...(config.enableTamperingStep ? [OffseasonStepEnum.TAMPERING] : []),
      OffseasonStepEnum.FREE_AGENCY,
      OffseasonStepEnum.PRE_DRAFT,
      OffseasonStepEnum.DRAFT,
      OffseasonStepEnum.TRAINING_CAMP,
      OffseasonStepEnum.PRESEASON,
      OffseasonStepEnum.CUT_DOWNS,
    ];
    return base;
  }

  static nextOffseasonStepId(current: OffseasonStepId, config: StateMachineConfig): OffseasonStepId | null {
    if (!config.enableTamperingStep && (current === OffseasonStepEnum.COMBINE || current === OffseasonStepEnum.TAMPERING)) {
      return OffseasonStepEnum.FREE_AGENCY;
    }
    const steps = StateMachine.getOffseasonSequence(config);
    const idx = steps.findIndex((s) => s === current);
    if (idx < 0) return steps[0] ?? null;
    return steps[idx + 1] ?? null;
  }

  static assertValidOffseasonTransition(from: OffseasonStepId, to: OffseasonStepId, config: StateMachineConfig): void {
    const expected = StateMachine.nextOffseasonStepId(from, config);
    if (expected === null) {
      throw new Error(`No valid offseason transition exists after '${from}'.`);
    }
    if (to !== expected) {
      throw new Error(`Invalid offseason transition from '${from}' to '${to}'. Expected '${expected}'.`);
    }
  }

  static advanceOffseasonStep(from: OffseasonStepId, config: StateMachineConfig): OffseasonStepId {
    const to = StateMachine.nextOffseasonStepId(from, config);
    if (!to) {
      throw new Error(`Cannot advance offseason step from '${from}' because it is terminal.`);
    }
    StateMachine.assertValidOffseasonTransition(from, to, config);
    return to;
  }

  static careerStageForOffseasonStep(step: OffseasonStepId, currentStage: CareerStage): CareerStage {
    switch (step) {
      case OffseasonStepEnum.FREE_AGENCY:
        return "FREE_AGENCY";
      case OffseasonStepEnum.TRAINING_CAMP:
        return "TRAINING_CAMP";
      case OffseasonStepEnum.PRESEASON:
        return "PRESEASON";
      case OffseasonStepEnum.CUT_DOWNS:
        return "OFFSEASON_HUB";
      default:
        return currentStage;
    }
  }
}
