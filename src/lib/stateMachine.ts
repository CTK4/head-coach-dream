import type { CareerStage } from "@/types/careerStage";

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
    // Read from a canonical `phase` field first, then fall back to legacy
    // property names from older save shapes. Legacy shapes are migrated to
    // a single `phase` field by migrateSaveSchema at load time; these
    // fallbacks exist only as a safety net during that migration window.
    const raw = state?.phase ?? state?.careerStage ?? state?.seasonPhase ?? state?.hubPhase ?? "UNKNOWN";
    const p = upper(raw);

    if (p.includes("RETENTION") || p.includes("RESIGN") || p.includes("PHASE_2_RETENTION")) return PhaseKeyEnum.PHASE_2_RETENTION;
    if (p.includes("COMBINE"))                                                               return PhaseKeyEnum.PHASE_3_COMBINE;
    if (p.includes("FREE_AGENCY") || p.includes("TAMPERING"))                               return PhaseKeyEnum.PHASE_4_FREE_AGENCY;
    if (p.includes("DRAFT"))                                                                 return PhaseKeyEnum.DRAFT;
    if (p.includes("REGULAR") || p.includes("WEEK"))                                        return PhaseKeyEnum.REGULAR_SEASON_WEEK;
    return PhaseKeyEnum.UNKNOWN;
  }

  /**
   * Returns the canonical offseason step sequence for the given config.
   * When `enableTamperingStep` is true, TAMPERING is spliced between COMBINE
   * and FREE_AGENCY so that `nextOffseasonStepId` can resolve it from the
   * sequence directly — no special-case guards needed at call sites.
   */
  static getOffseasonSequence(config: StateMachineConfig): OffseasonStepId[] {
    const steps: OffseasonStepId[] = [
      OffseasonStepEnum.RESIGNING,
      OffseasonStepEnum.COMBINE,
    ];

    if (config.enableTamperingStep) {
      steps.push(OffseasonStepEnum.TAMPERING);
    }

    steps.push(
      OffseasonStepEnum.FREE_AGENCY,
      OffseasonStepEnum.PRE_DRAFT,
      OffseasonStepEnum.DRAFT,
      OffseasonStepEnum.TRAINING_CAMP,
      OffseasonStepEnum.PRESEASON,
      OffseasonStepEnum.CUT_DOWNS,
    );

    return steps;
  }

  static nextOffseasonStepId(current: OffseasonStepId, config: StateMachineConfig): OffseasonStepId | null {
    const steps = StateMachine.getOffseasonSequence(config);
    const idx = steps.findIndex((s) => s === current);
    if (idx >= 0) return steps[idx + 1] ?? null;
    // Current step not in active sequence (e.g. TAMPERING when disabled).
    // Find position in canonical sequence and return next step present in active sequence.
    const canonical = StateMachine.getOffseasonSequence({ ...config, enableTamperingStep: true });
    const canonicalIdx = canonical.findIndex((s) => s === current);
    if (canonicalIdx < 0) return steps[0] ?? null;
    const subsequent = canonical.slice(canonicalIdx + 1);
    return subsequent.find((s) => (steps as string[]).includes(s)) ?? null;
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
      case OffseasonStepEnum.RESIGNING:
        return "RESIGN";
      case OffseasonStepEnum.COMBINE:
        return "COMBINE";
      case OffseasonStepEnum.TAMPERING:
        return "TAMPERING";
      case OffseasonStepEnum.FREE_AGENCY:
        return "FREE_AGENCY";
      case OffseasonStepEnum.PRE_DRAFT:
        return "PRE_DRAFT";
      case OffseasonStepEnum.DRAFT:
        return "DRAFT";
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
