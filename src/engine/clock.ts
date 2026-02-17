import { clamp, tri } from "@/engine/rand";

export type RestartMode = "READY" | "SNAP";
export type PlayClockLen = 25 | 40;

export type ClockState = {
  quarter: 1 | 2 | 3 | 4 | "OT";
  timeRemainingSec: number;
  clockRunning: boolean;
  restartMode: RestartMode;
  playClockLen: PlayClockLen;
  twoMinuteUsedH1: boolean;
  twoMinuteUsedH2: boolean;
  timeoutsHome: number;
  timeoutsAway: number;
};

export type SnapTimingProfile = {
  snapWithLeft40: [number, number, number];
  snapWithLeft25: [number, number, number];
};

export const SNAP_TIMING: Record<
  "SLOW" | "NORMAL" | "FAST" | "HURRY_UP" | "MILK_CLOCK" | "EXTREME_HURRY",
  SnapTimingProfile
> = {
  SLOW: { snapWithLeft40: [1, 4, 8], snapWithLeft25: [1, 3, 6] },
  NORMAL: { snapWithLeft40: [6, 12, 18], snapWithLeft25: [4, 8, 12] },
  FAST: { snapWithLeft40: [12, 18, 26], snapWithLeft25: [8, 12, 18] },
  HURRY_UP: { snapWithLeft40: [20, 28, 35], snapWithLeft25: [16, 20, 24] },
  MILK_CLOCK: { snapWithLeft40: [1, 2, 6], snapWithLeft25: [1, 2, 5] },
  EXTREME_HURRY: { snapWithLeft40: [28, 34, 39], snapWithLeft25: [21, 24, 25] },
};

export const TIMEOUTS_PER_HALF = 3;

export function initClock(): ClockState {
  return {
    quarter: 1,
    timeRemainingSec: 15 * 60,
    clockRunning: false,
    restartMode: "SNAP",
    playClockLen: 40,
    twoMinuteUsedH1: false,
    twoMinuteUsedH2: false,
    timeoutsHome: TIMEOUTS_PER_HALF,
    timeoutsAway: TIMEOUTS_PER_HALF,
  };
}

export function halfIndex(q: ClockState["quarter"]): 1 | 2 {
  return q === 1 || q === 2 ? 1 : 2;
}

export function applyTwoMinuteGate(
  clock: ClockState,
  rng: () => number,
  decrementIfNoGate: number
): { clock: ClockState; applied: number; didGate: boolean } {
  const q = clock.quarter;
  if (q !== 2 && q !== 4) return { clock, applied: decrementIfNoGate, didGate: false };
  const half = halfIndex(q);
  const already = half === 1 ? clock.twoMinuteUsedH1 : clock.twoMinuteUsedH2;
  if (already || !clock.clockRunning || clock.timeRemainingSec <= 120) {
    return { clock, applied: decrementIfNoGate, didGate: false };
  }

  const next = clock.timeRemainingSec - decrementIfNoGate;
  if (next >= 120) return { clock, applied: decrementIfNoGate, didGate: false };

  const admin = Math.round(tri(rng, 30, 45, 75));
  const gated: ClockState = {
    ...clock,
    timeRemainingSec: 120,
    clockRunning: false,
    restartMode: "SNAP",
    ...(half === 1 ? { twoMinuteUsedH1: true } : { twoMinuteUsedH2: true }),
  };
  return { clock: applyTime(gated, admin), applied: clock.timeRemainingSec - 120, didGate: true };
}

export function applyTime(clock: ClockState, seconds: number): ClockState {
  if (seconds <= 0) return clock;
  return { ...clock, timeRemainingSec: Math.max(0, clock.timeRemainingSec - seconds) };
}

export function nextQuarter(clock: ClockState): ClockState {
  if (clock.quarter === "OT") return clock;
  if (clock.quarter === 4) {
    return { ...clock, quarter: "OT", timeRemainingSec: 10 * 60, clockRunning: false, restartMode: "SNAP" };
  }

  const q = (clock.quarter + 1) as 2 | 3 | 4;
  const resetTimeouts = q === 3 ? { timeoutsHome: TIMEOUTS_PER_HALF, timeoutsAway: TIMEOUTS_PER_HALF } : {};
  return { ...clock, quarter: q, timeRemainingSec: 15 * 60, clockRunning: false, restartMode: "SNAP", ...resetTimeouts };
}

export function chooseSnapWithLeft(
  clock: ClockState,
  rng: () => number,
  mode: keyof typeof SNAP_TIMING
): number {
  const profile = SNAP_TIMING[mode];
  const [min, mid, max] = clock.playClockLen === 40 ? profile.snapWithLeft40 : profile.snapWithLeft25;
  return Math.round(clamp(tri(rng, min, mid, max), 0, clock.playClockLen));
}

export function betweenPlaysRunoff(clock: ClockState, _rng: () => number, snapWithLeft: number): number {
  if (!clock.clockRunning || clock.restartMode !== "READY") return 0;
  return Math.max(0, clock.playClockLen - snapWithLeft);
}
