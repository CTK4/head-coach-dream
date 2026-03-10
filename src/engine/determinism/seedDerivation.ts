import { hashSeed } from "@/engine/rng";

const CAREER_SEED_SALT = 0x85ebca6b;
const SCOUTING_BOARD_SEED_SALT = 0x9e3779b9;

function normalizeSeed(seed: number): number {
  return Number(seed ?? 1) >>> 0;
}

function channelToNumber(channel: string | number): number {
  return typeof channel === "number" ? channel : hashSeed(channel);
}

export function deriveSaveSeed(seed: number): number {
  return normalizeSeed(seed);
}

export function deriveCareerSeed(saveSeed: number): number {
  return (normalizeSeed(saveSeed) ^ CAREER_SEED_SALT) >>> 0;
}

export function deriveWeeklySeed(saveSeed: number, season: number, week: number, channel: string | number): number {
  const baseSeed = normalizeSeed(saveSeed);
  const channelValue = channelToNumber(channel);
  return (baseSeed ^ Number(season) ^ (Number(week) << 8) ^ (channelValue << 16)) >>> 0;
}

export function deriveScoutingBoardSeed(saveSeed: number): number {
  return (normalizeSeed(saveSeed) ^ SCOUTING_BOARD_SEED_SALT) >>> 0;
}

export function deriveSubsystemSeed(saveSeed: number, namespace: string, context: string | number): number {
  return (normalizeSeed(saveSeed) ^ hashSeed(namespace, context)) >>> 0;
}
