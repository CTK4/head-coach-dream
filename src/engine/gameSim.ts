import { applyTime, applyTwoMinuteGate, betweenPlaysRunoff, chooseSnapWithLeft, initClock, nextQuarter, type ClockState } from "@/engine/clock";
import { clamp, mulberry32, tri } from "@/engine/rand";

export type PlayType = "RUN" | "SHORT_PASS" | "DEEP_PASS" | "PLAY_ACTION" | "SPIKE" | "KNEEL" | "PUNT" | "FG";
export type Possession = "HOME" | "AWAY";

export type DriveLogEntry = {
  drive: number;
  play: number;
  quarter: 1 | 2 | 3 | 4 | "OT";
  clockSec: number;
  possession: Possession;
  down: 1 | 2 | 3 | 4;
  distance: number;
  ballOn: number;
  playType: PlayType;
  result: string;
  homeScore: number;
  awayScore: number;
};

export type GameSim = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  possession: Possession;
  ballOn: number;
  down: 1 | 2 | 3 | 4;
  distance: number;
  clock: ClockState;
  lastResult?: string;
  seed: number;
  weekType?: "PRESEASON" | "REGULAR_SEASON";
  weekNumber?: number;
  driveNumber: number;
  playNumberInDrive: number;
  driveLog: DriveLogEntry[];
};

export type PlayResolution = { sim: GameSim; ended: boolean };

export type FourthDownRecommendation = {
  best: PlayType;
  ranked: { playType: PlayType; score: number }[];
  breakevenGoRate: number;
};

function otherSide(p: Possession): Possession {
  return p === "HOME" ? "AWAY" : "HOME";
}

function scoreRef(sim: GameSim): { get: () => number; set: (v: number) => void } {
  return sim.possession === "HOME"
    ? { get: () => sim.homeScore, set: (v) => (sim.homeScore = v) }
    : { get: () => sim.awayScore, set: (v) => (sim.awayScore = v) };
}

function scriptMode(sim: GameSim): "SLOW" | "NORMAL" | "FAST" | "HURRY_UP" | "MILK_CLOCK" | "EXTREME_HURRY" {
  const q = sim.clock.quarter;
  const t = sim.clock.timeRemainingSec;
  const diff = sim.homeScore - sim.awayScore;
  const myDiff = sim.possession === "HOME" ? diff : -diff;

  if (q === 4 && myDiff > 0 && myDiff <= 8) return "MILK_CLOCK";
  if (q === 4 && myDiff < 0 && myDiff >= -14) return t <= 90 ? "EXTREME_HURRY" : "HURRY_UP";
  if (q === 4 && myDiff <= -15) return t <= 120 ? "EXTREME_HURRY" : "HURRY_UP";
  if (q === 2 && t <= 120 && myDiff < 0) return "HURRY_UP";
  return "NORMAL";
}

function isClockStoppedResult(tag: "IN_BOUNDS" | "OOB" | "INCOMPLETE" | "SCORE" | "CHANGE") {
  if (tag === "IN_BOUNDS") return { running: true, restart: "READY" as const };
  return { running: false, restart: "SNAP" as const };
}

function adminTime(rng: () => number, kind: "ROUTINE" | "FIRST_DOWN" | "CHANGE" | "PUNT_SETUP" | "FG_SETUP" | "KICKOFF_SETUP"): number {
  const t = (a: number, b: number, c: number) => Math.round(tri(rng, a, b, c));
  switch (kind) {
    case "ROUTINE":
      return t(3, 5, 8);
    case "FIRST_DOWN":
      return t(6, 9, 14);
    case "CHANGE":
      return t(10, 16, 26);
    case "PUNT_SETUP":
      return t(10, 16, 26);
    case "FG_SETUP":
      return t(12, 18, 30);
    case "KICKOFF_SETUP":
      return t(18, 25, 40);
  }
}

function liveTime(rng: () => number, outcome: string): number {
  const t = (a: number, b: number, c: number) => Math.round(tri(rng, a, b, c));
  switch (outcome) {
    case "RUN_IN_BOUNDS":
      return t(26, 34, 44);
    case "RUN_OOB":
      return t(18, 26, 38);
    case "SHORT_IN_BOUNDS":
      return t(18, 27, 40);
    case "SHORT_OOB":
      return t(8, 16, 28);
    case "DEEP_IN_BOUNDS":
      return t(14, 22, 40);
    case "INCOMPLETE":
      return t(4, 7, 11);
    case "SACK":
      return t(14, 23, 34);
    case "SPIKE":
      return t(2, 3, 5);
    case "PUNT_FAIR":
      return t(4, 7, 11);
    case "PUNT_RETURN":
      return t(6, 12, 22);
    case "FG":
      return t(3, 5, 8);
    case "KICKOFF_TB":
      return t(2, 4, 6);
    case "KICKOFF_RET":
      return t(6, 12, 20);
    default:
      return t(16, 24, 36);
  }
}

function quarterAdvanceIfNeeded(sim: GameSim): GameSim {
  let s = sim;
  while (s.clock.timeRemainingSec === 0) {
    if (s.clock.quarter === 4) break;
    s = { ...s, clock: nextQuarter(s.clock) };
  }
  return s;
}

function newDrive(sim: GameSim, possession: Possession): GameSim {
  return { ...sim, possession, driveNumber: sim.driveNumber + 1, playNumberInDrive: 0 };
}

function setNewSeries(sim: GameSim, ballOn: number): GameSim {
  return { ...sim, ballOn: clamp(ballOn, 1, 99), down: 1, distance: 10 };
}

function pushLog(sim: GameSim, playType: PlayType, result: string): GameSim {
  const entry: DriveLogEntry = {
    drive: sim.driveNumber,
    play: sim.playNumberInDrive + 1,
    quarter: sim.clock.quarter,
    clockSec: sim.clock.timeRemainingSec,
    possession: sim.possession,
    down: sim.down,
    distance: sim.distance,
    ballOn: sim.ballOn,
    playType,
    result,
    homeScore: sim.homeScore,
    awayScore: sim.awayScore,
  };
  return { ...sim, playNumberInDrive: sim.playNumberInDrive + 1, driveLog: [entry, ...sim.driveLog].slice(0, 80) };
}

function kickoffAfterScore(sim: GameSim, rng: () => number): GameSim {
  const admin = adminTime(rng, "KICKOFF_SETUP");
  let clock = applyTime(sim.clock, admin);
  const tb = rng() < 0.72;
  clock = applyTime(clock, liveTime(rng, tb ? "KICKOFF_TB" : "KICKOFF_RET"));
  const next = setNewSeries(newDrive({ ...sim, clock }, otherSide(sim.possession)), 25);
  return { ...next, clock: { ...next.clock, clockRunning: false, restartMode: "SNAP", playClockLen: 40 } };
}

function turnover(sim: GameSim, rng: () => number): GameSim {
  const admin = adminTime(rng, "CHANGE");
  const next = setNewSeries(newDrive(sim, otherSide(sim.possession)), 25);
  return { ...next, clock: applyTime({ ...sim.clock, clockRunning: false, restartMode: "SNAP", playClockLen: 40 }, admin) };
}

function punt(sim: GameSim, rng: () => number): GameSim {
  let clock = applyTime(sim.clock, adminTime(rng, "PUNT_SETUP"));
  const returned = rng() < 0.55;
  clock = applyTime(clock, liveTime(rng, returned ? "PUNT_RETURN" : "PUNT_FAIR"));
  return turnover({ ...sim, clock, lastResult: "Punt." }, rng);
}

function fgMakeProb(ballOn: number): number {
  const distFromGoal = 100 - ballOn;
  const kickYards = distFromGoal + 17;
  return clamp(0.92 - Math.max(0, kickYards - 52) * 0.03, 0.08, 0.95);
}

function fgAttempt(sim: GameSim, rng: () => number): GameSim {
  let clock = applyTime(sim.clock, adminTime(rng, "FG_SETUP"));
  clock = applyTime(clock, liveTime(rng, "FG"));
  const makeProb = fgMakeProb(sim.ballOn);
  const kickYards = 100 - sim.ballOn + 17;

  if (rng() < makeProb) {
    const off = scoreRef(sim);
    off.set(off.get() + 3);
    return kickoffAfterScore({ ...sim, clock, lastResult: `FG is GOOD (${kickYards}y)!` }, rng);
  }
  return turnover({ ...sim, clock, lastResult: `FG missed (${kickYards}y).` }, rng);
}

function advanceDown(sim: GameSim, gained: number): GameSim {
  if (sim.ballOn >= 99) {
    const off = scoreRef(sim);
    off.set(off.get() + 7);
    const reset = setNewSeries(sim, 25);
    return { ...reset, lastResult: "TOUCHDOWN!" };
  }

  if (gained >= sim.distance) {
    return { ...sim, down: 1, distance: 10, lastResult: `${sim.lastResult ?? ""} First down!`.trim() };
  }

  const down = (sim.down + 1) as 2 | 3 | 4;
  const distance = Math.max(1, sim.distance - gained);

  if (down > 4) {
    return turnover({ ...sim, lastResult: `${sim.lastResult ?? ""} Turnover on downs.`.trim() }, mulberry32(sim.seed + 999));
  }

  return { ...sim, down, distance };
}

function resolveNormalPlay(sim: GameSim, rng: () => number, playType: PlayType) {
  if (playType === "SPIKE") {
    const live = liveTime(rng, "SPIKE");
    return { sim: { ...sim, lastResult: "Spike." }, tag: "INCOMPLETE" as const, live, admin: adminTime(rng, "ROUTINE") };
  }

  const isPass = playType !== "RUN" && playType !== "KNEEL";
  const kneel = playType === "KNEEL";

  const baseMean: Record<string, number> = { RUN: 3.9, SHORT_PASS: 5.8, DEEP_PASS: 11.2, PLAY_ACTION: 7.1, KNEEL: -1 };
  const baseVol: Record<string, number> = { RUN: 3.2, SHORT_PASS: 6, DEEP_PASS: 13.5, PLAY_ACTION: 8.2, KNEEL: 0.5 };

  const y = clamp(Math.round((baseMean[playType] ?? 5) + (rng() - 0.5) * 2 * (baseVol[playType] ?? 5)), -12, 60);

  if (kneel) {
    const next = advanceDown({ ...sim, ballOn: clamp(sim.ballOn + y, 1, 99), lastResult: "Kneel." }, y);
    return { sim: next, tag: "IN_BOUNDS" as const, live: liveTime(rng, "RUN_IN_BOUNDS"), admin: adminTime(rng, "ROUTINE") };
  }

  if (isPass) {
    const sackProb = clamp(0.06 + Math.max(0, sim.distance - 7) * 0.01, 0.04, 0.18);
    const incProb = clamp(playType === "DEEP_PASS" ? 0.48 : 0.33, 0.18, 0.62);

    if (rng() < sackProb) {
      const nextBallOn = clamp(sim.ballOn - Math.round(tri(rng, 4, 7, 12)), 1, 99);
      const next = advanceDown({ ...sim, ballOn: nextBallOn, lastResult: "Sack." }, -(sim.ballOn - nextBallOn));
      return { sim: next, tag: "IN_BOUNDS" as const, live: liveTime(rng, "SACK"), admin: adminTime(rng, "ROUTINE") };
    }

    if (rng() < incProb) {
      return {
        sim: { ...sim, lastResult: "Incomplete." },
        tag: "INCOMPLETE" as const,
        live: liveTime(rng, "INCOMPLETE"),
        admin: adminTime(rng, "ROUTINE"),
      };
    }

    const oob = rng() < clamp(playType === "DEEP_PASS" ? 0.18 : 0.14, 0, 0.35);
    const next = advanceDown(
      { ...sim, ballOn: clamp(sim.ballOn + y, 1, 99), lastResult: `${playType.replace("_", " ")} complete for ${y}y${oob ? " (OOB)" : ""}.` },
      y
    );
    return {
      sim: next,
      tag: oob ? ("OOB" as const) : ("IN_BOUNDS" as const),
      live: liveTime(rng, oob ? "SHORT_OOB" : playType === "DEEP_PASS" ? "DEEP_IN_BOUNDS" : "SHORT_IN_BOUNDS"),
      admin: adminTime(rng, y >= sim.distance ? "FIRST_DOWN" : "ROUTINE"),
    };
  }

  const oob = rng() < 0.06;
  const next = advanceDown({ ...sim, ballOn: clamp(sim.ballOn + y, 1, 99), lastResult: `Run for ${y}y${oob ? " (OOB)" : ""}.` }, y);
  return {
    sim: next,
    tag: oob ? ("OOB" as const) : ("IN_BOUNDS" as const),
    live: liveTime(rng, oob ? "RUN_OOB" : "RUN_IN_BOUNDS"),
    admin: adminTime(rng, y >= sim.distance ? "FIRST_DOWN" : "ROUTINE"),
  };
}

function applySnapLoopTime(sim: GameSim, rng: () => number): GameSim {
  const snapLeft = chooseSnapWithLeft(sim.clock, rng, scriptMode(sim));
  const runoff = betweenPlaysRunoff(sim.clock, rng, snapLeft);
  if (runoff <= 0) return sim;
  return { ...sim, clock: applyTwoMinuteGate(sim.clock, rng, runoff).clock };
}

function applyTimeWithGate(sim: GameSim, rng: () => number, seconds: number): GameSim {
  if (seconds <= 0) return sim;
  const gate = applyTwoMinuteGate(sim.clock, rng, seconds);
  return { ...sim, clock: applyTime(gate.clock, seconds - (gate.didGate ? seconds - gate.applied : 0)) };
}

function urgency(sim: GameSim): number {
  const q = sim.clock.quarter;
  const t = sim.clock.timeRemainingSec;
  const diff = sim.homeScore - sim.awayScore;
  const myDiff = sim.possession === "HOME" ? diff : -diff;
  if (q !== 4 || myDiff >= 0) return 0;
  if (t <= 90) return 1;
  if (t <= 180) return 0.6;
  return 0.3;
}

function goPlayForDistance(distance: number, u: number): PlayType {
  if (distance <= 2) return "RUN";
  if (distance <= 5) return u >= 0.6 ? "SHORT_PASS" : "RUN";
  if (distance <= 9) return "SHORT_PASS";
  return "DEEP_PASS";
}

function estimateGoSuccessProb(sim: GameSim): number {
  const d = sim.distance;
  const base = d <= 1 ? 0.72 : d <= 2 ? 0.62 : d <= 3 ? 0.55 : d <= 5 ? 0.48 : d <= 7 ? 0.4 : d <= 10 ? 0.33 : 0.26;
  const zone = sim.ballOn >= 90 ? 0.05 : sim.ballOn >= 75 ? 0.02 : 0;
  return clamp(base + zone, 0.12, 0.78);
}

function estimatePuntValue(sim: GameSim): number {
  const field = sim.ballOn;
  if (field >= 80) return -0.6;
  if (field >= 65) return -0.1;
  if (field >= 50) return 0.2;
  return 0.45;
}

function estimateGoValue(sim: GameSim): number {
  const p = estimateGoSuccessProb(sim);
  const field = sim.ballOn;
  const u = urgency(sim);
  const success = (field >= 95 ? 3.3 : field >= 85 ? 2.2 : field >= 70 ? 1.5 : field >= 55 ? 1 : 0.7) + 0.8 * u;
  const fail = (field >= 90 ? -1.2 : field >= 70 ? -0.8 : field >= 50 ? -0.5 : -0.3) - 0.4 * u;
  return p * success + (1 - p) * fail;
}

function estimateFgValue(sim: GameSim): number {
  const p = fgMakeProb(sim.ballOn);
  const u = urgency(sim);
  const kickYards = 100 - sim.ballOn + 17;
  const make = 1.15 + (kickYards <= 45 ? 0.2 : 0) + 0.6 * u;
  const miss = sim.ballOn >= 75 ? -0.9 : sim.ballOn >= 60 ? -0.6 : -0.45;
  return p * make + (1 - p) * miss;
}

export function recommendFourthDown(sim: GameSim): FourthDownRecommendation {
  const u = urgency(sim);
  const go = estimateGoValue(sim) + 0.25 * u + (sim.ballOn >= 80 ? 0.08 : 0) + (sim.distance <= 2 ? 0.05 : 0);
  const fg = estimateFgValue(sim) + (sim.ballOn >= 60 ? 0.08 : -0.06);
  const punt = estimatePuntValue(sim) + (sim.ballOn <= 55 ? 0.06 : -0.08);
  const best = fg >= go && fg >= punt ? "FG" : punt >= go && punt >= fg ? "PUNT" : goPlayForDistance(sim.distance, u);

  const success = (sim.ballOn >= 95 ? 3.3 : sim.ballOn >= 85 ? 2.2 : sim.ballOn >= 70 ? 1.5 : sim.ballOn >= 55 ? 1 : 0.7) + 0.8 * u;
  const fail = (sim.ballOn >= 90 ? -1.2 : sim.ballOn >= 70 ? -0.8 : sim.ballOn >= 50 ? -0.5 : -0.3) - 0.4 * u;
  const alt = Math.max(fg, punt);
  const breakevenGoRate = clamp((alt - fail) / (success - fail), 0, 1);

  const ranked = [
    { playType: "FG" as const, score: fg },
    { playType: "PUNT" as const, score: punt },
    { playType: "RUN" as const, score: go },
  ].sort((a, b) => b.score - a.score);

  return { best, ranked, breakevenGoRate };
}

function decideFourthDown(sim: GameSim): PlayType {
  const rec = recommendFourthDown(sim);
  return rec.best === "RUN" || rec.best === "SHORT_PASS" || rec.best === "DEEP_PASS" || rec.best === "PLAY_ACTION"
    ? goPlayForDistance(sim.distance, urgency(sim))
    : rec.best;
}

export function initGameSim(params: {
  homeTeamId: string;
  awayTeamId: string;
  seed: number;
  weekType?: "PRESEASON" | "REGULAR_SEASON";
  weekNumber?: number;
}): GameSim {
  return {
    homeTeamId: params.homeTeamId,
    awayTeamId: params.awayTeamId,
    homeScore: 0,
    awayScore: 0,
    possession: "HOME",
    ballOn: 25,
    down: 1,
    distance: 10,
    clock: initClock(),
    seed: params.seed,
    weekType: params.weekType,
    weekNumber: params.weekNumber,
    driveNumber: 1,
    playNumberInDrive: 0,
    driveLog: [],
  };
}

export function stepPlay(sim: GameSim, playType: PlayType): PlayResolution {
  const rng = mulberry32(sim.seed);
  let s: GameSim = { ...sim, seed: sim.seed + 1 };

  s = quarterAdvanceIfNeeded(s);
  if (s.clock.timeRemainingSec === 0) return { sim: s, ended: s.clock.quarter === 4 };

  s = applySnapLoopTime(s, rng);
  if (s.clock.timeRemainingSec === 0) {
    s = quarterAdvanceIfNeeded(s);
    return { sim: s, ended: s.clock.quarter === 4 && s.clock.timeRemainingSec === 0 };
  }

  let tag: "IN_BOUNDS" | "OOB" | "INCOMPLETE" | "SCORE" | "CHANGE" = "IN_BOUNDS";
  let live = 0;
  let admin = 0;

  if (playType === "PUNT") {
    s = punt(s, rng);
    tag = "CHANGE";
  } else if (playType === "FG") {
    s = fgAttempt(s, rng);
    tag = "SCORE";
  } else {
    const resolved = resolveNormalPlay(s, rng, playType);
    s = resolved.sim;
    tag = resolved.tag;
    live = resolved.live;
    admin = resolved.admin;
  }

  if (live > 0) s = applyTimeWithGate(s, rng, live);
  if (admin > 0) s = { ...s, clock: applyTime(s.clock, admin) };

  const status = isClockStoppedResult(tag);
  s = { ...s, clock: { ...s.clock, clockRunning: status.running, restartMode: status.restart, playClockLen: 40 } };

  if (s.clock.timeRemainingSec === 0) s = quarterAdvanceIfNeeded(s);

  s = pushLog(s, playType, s.lastResult ?? "");
  return { sim: s, ended: s.clock.quarter === 4 && s.clock.timeRemainingSec === 0 };
}

export function autoPickPlay(sim: GameSim): PlayType {
  const q = sim.clock.quarter;
  const t = sim.clock.timeRemainingSec;
  const diff = sim.homeScore - sim.awayScore;
  const myDiff = sim.possession === "HOME" ? diff : -diff;

  if (sim.down === 4) return decideFourthDown(sim);
  if ((q === 2 || q === 4) && t <= 15 && myDiff < 0 && !sim.clock.clockRunning) return "SPIKE";
  if (q === 4 && myDiff > 0 && t <= 120) return "KNEEL";
  if (q === 4 && myDiff < 0 && t <= 90) return sim.distance >= 8 ? "DEEP_PASS" : "SHORT_PASS";
  if (sim.distance >= 9) return "DEEP_PASS";
  if (sim.distance <= 3) return "RUN";
  return "SHORT_PASS";
}

export function simulateFullGame(params: { homeTeamId: string; awayTeamId: string; seed: number }) {
  let sim = initGameSim({ ...params });
  sim = { ...sim, clock: { ...sim.clock, clockRunning: false, restartMode: "SNAP" } };

  let safety = 0;
  while (!(sim.clock.quarter === 4 && sim.clock.timeRemainingSec === 0)) {
    const stepped = stepPlay(sim, autoPickPlay(sim));
    sim = stepped.sim;
    safety += 1;
    if (safety > 6000) break;
  }

  return { homeScore: sim.homeScore, awayScore: sim.awayScore };
}
