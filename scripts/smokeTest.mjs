#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("..", import.meta.url)));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadJson(relativePath) {
  const raw = await readFile(join(root, relativePath), "utf8");
  return JSON.parse(raw);
}

async function run() {
  const leagueDb = await loadJson("src/data/leagueDB.json");
  const teams = leagueDb.Teams ?? [];
  const players = leagueDb.Players ?? [];
  const contracts = leagueDb.Contracts ?? [];

  assert(Array.isArray(teams) && teams.length > 0, "No teams found in leagueDB.json");
  assert(Array.isArray(players) && players.length > 0, "No players found in leagueDB.json");
  assert(Array.isArray(contracts) && contracts.length > 0, "No contracts found in leagueDB.json");

  const teamIds = new Set(teams.map((team) => String(team.teamId)));
  const contractIds = new Set(contracts.map((contract) => String(contract.contractId)));

  const badTeamRefs = players.filter((player) => {
    const teamId = String(player.teamId ?? "");
    if (!teamId || teamId === "FREE_AGENT") return false;
    return !teamIds.has(teamId);
  });

  const badContractRefs = players.filter((player) => {
    const contractId = String(player.contractId ?? "");
    if (!contractId) return false;
    return !contractIds.has(contractId);
  });

  assert(badTeamRefs.length === 0, `Players with invalid teamId references: ${badTeamRefs.length}`);
  assert(badContractRefs.length === 0, `Players with invalid contractId references: ${badContractRefs.length}`);

  const interviewQuestions = await loadJson("src/data/ugf_interview_bank_150.json");
  assert(Array.isArray(interviewQuestions.questions) && interviewQuestions.questions.length > 0, "Interview bank has no questions");

  console.log("[smoke] OK: league data and interview bank wiring look valid");
}

run().catch((error) => {
  console.error("[smoke] FAIL", error.message);
  process.exitCode = 1;
});
