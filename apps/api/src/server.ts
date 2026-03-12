import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";

export type SaveMetadata = {
  saveId: string;
  coachName: string;
  teamName: string;
  season: number;
  week: number;
  record: { wins: number; losses: number };
  updatedAt: number;
  lastPlayed: number;
  careerStage: string;
  version: number;
};

type SaveSnapshot = {
  saveId: string;
  metadata: SaveMetadata;
  state: Record<string, unknown>;
};

type MutationRecord = {
  operationId: string;
  saveId: string;
  sequence: number;
  method: string;
  path: string;
  requestHash: string;
  status: number;
  responseBody: string;
  createdAt: number;
};

const PORT = Number(process.env.PORT ?? 8787);
const DB_PATH = resolve(process.cwd(), process.env.API_DB_PATH ?? "apps/api/data/saves.json");
const API_VERSION = "v1";
const CONTRACT_VERSION = "2026-03-12";

function json(body: unknown, status = 200): ResponseTuple {
  return [
    status,
    {
      "content-type": "application/json",
      "x-api-version": API_VERSION,
      "x-contract-version": CONTRACT_VERSION,
    },
    JSON.stringify(body),
  ];
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): ResponseTuple {
  return [status, { "content-type": "application/json", ...headers }, JSON.stringify(body)];
}

async function loadDb(): Promise<SaveDb> {
  try {
    const raw = await readFile(getDbPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<SaveDb>;
    return {
      snapshots: parsed.snapshots ?? {},
      sequenceBySaveId: parsed.sequenceBySaveId ?? {},
      operationsById: parsed.operationsById ?? {},
    };
  } catch {
    return { snapshots: {}, sequenceBySaveId: {}, operationsById: {} };
  }
}

async function persistDb(db: SaveDb): Promise<void> {
  const dbPath = getDbPath();
  await mkdir(dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

function deriveMetadata(saveId: string, state: Record<string, unknown>): SaveMetadata {
  const now = Date.now();
  const coach = (state.coach as Record<string, unknown> | undefined) ?? {};
  const standings = Array.isArray(state.currentStandings) ? state.currentStandings : [];
  const acceptedOffer = (state.acceptedOffer as Record<string, unknown> | undefined) ?? {};
  const teamId = String(acceptedOffer.teamId ?? state.userTeamId ?? state.teamId ?? "Unassigned Team");
  const standing = standings.find((entry) => {
    if (!entry || typeof entry !== "object") return false;
    return String((entry as Record<string, unknown>).teamId ?? "") === teamId;
  }) as Record<string, unknown> | undefined;

  return {
    saveId,
    coachName: String(coach.name ?? "Unnamed Coach"),
    teamName: teamId,
    season: Number(state.season ?? 1),
    week: Number((state.hub as Record<string, unknown> | undefined)?.regularSeasonWeek ?? state.week ?? 1),
    record: {
      wins: Number(standing?.wins ?? 0),
      losses: Number(standing?.losses ?? 0),
    },
    updatedAt: now,
    lastPlayed: now,
    careerStage: String(state.careerStage ?? "PRE_SEASON"),
    version: Number(state.schemaVersion ?? 0),
  };
}

export async function handle(
  method: string,
  pathname: string,
  searchParams: URLSearchParams,
  bodyRaw: string,
): Promise<ResponseTuple> {
  const db = await loadDb();

  if (method === "GET" && pathname === "/api/v1/health") {
    return json({ status: "ok" });
  }

  if (method === "GET" && pathname === "/api/v1/saves/metadata") {
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 50), 1), 100);
    const cursor = Math.max(Number(searchParams.get("cursor") ?? 0), 0);
    const allSaves = Object.values(db.snapshots).map((entry) => entry.metadata);
    const page = allSaves.slice(cursor, cursor + limit);
    const nextOffset = cursor + limit;
    const nextCursor = nextOffset < allSaves.length ? String(nextOffset) : null;

    return json({
      saves: page,
      pagination: {
        limit,
        nextCursor,
        total: allSaves.length,
      },
    });
  }

  if (method === "POST" && pathname === "/api/v1/saves/snapshots") {
    const payload = JSON.parse(bodyRaw || "{}") as { saveId?: string; state?: Record<string, unknown> };
    if (!payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) {
      return json({ error: "state must be an object" }, 400);
    }
    const saveId = payload.saveId ?? `career-${randomUUID()}`;
    const mutation = parseMutationContext(req, pathname, bodyRaw || "{}", saveId);
    if (!mutation) return json({ error: "missing_mutation_headers" }, 400);

    const replay = validateAndReplayIfNeeded(db, mutation);
    if (replay) return replay;

    const snapshot: SaveSnapshot = { saveId, metadata: deriveMetadata(saveId, payload.state), state: payload.state };
    db.snapshots[saveId] = snapshot;
    const response = json({ ...snapshot, operationId: mutation.operationId, sequence: mutation.sequence }, 201, {
      "x-operation-id": mutation.operationId,
      "x-sequence-number": String(mutation.sequence),
    });
    recordMutation(db, mutation, response);
    await persistDb(db);
    return response;
  }

  const snapshotMatch = pathname.match(/^\/api\/v1\/saves\/([^/]+)\/snapshot$/);
  if (snapshotMatch) {
    const saveId = decodeURIComponent(snapshotMatch[1]);

    if (method === "GET") {
      const snapshot = db.snapshots[saveId];
      if (!snapshot) return json({ error: "save not found" }, 404);
      return json(snapshot);
    }

    if (method === "PUT") {
      const payload = JSON.parse(bodyRaw || "{}") as { state?: Record<string, unknown> };
      if (!payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) {
        return json({ error: "state must be an object" }, 400);
      }
      const mutation = parseMutationContext(req, pathname, bodyRaw || "{}", saveId);
      if (!mutation) return json({ error: "missing_mutation_headers" }, 400);
      const replay = validateAndReplayIfNeeded(db, mutation);
      if (replay) return replay;

      const snapshot: SaveSnapshot = { saveId, metadata: deriveMetadata(saveId, payload.state), state: payload.state };
      db.snapshots[saveId] = snapshot;
      const response = json({ ...snapshot, operationId: mutation.operationId, sequence: mutation.sequence }, 200, {
        "x-operation-id": mutation.operationId,
        "x-sequence-number": String(mutation.sequence),
      });
      recordMutation(db, mutation, response);
      await persistDb(db);
      return response;
    }

    if (method === "DELETE") {
      const mutation = parseMutationContext(req, pathname, bodyRaw || "{}", saveId);
      if (!mutation) return json({ error: "missing_mutation_headers" }, 400);
      const replay = validateAndReplayIfNeeded(db, mutation);
      if (replay) return replay;
      if (!db.snapshots[saveId]) return json({ error: "save not found" }, 404);
      delete db.snapshots[saveId];
      const response: ResponseTuple = [204, {
        "x-operation-id": mutation.operationId,
        "x-sequence-number": String(mutation.sequence),
      }, ""];
      recordMutation(db, mutation, response);
      await persistDb(db);
      return [204, { "x-api-version": API_VERSION, "x-contract-version": CONTRACT_VERSION }, ""];
    }
  }

  return json({ error: "not found" }, 404);
}

export function startServer(port = PORT) {
  return createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const bodyRaw = Buffer.concat(chunks).toString("utf8");
        const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
        const [status, headers, body] = await handle(req.method ?? "GET", url.pathname, url.searchParams, bodyRaw);
        res.writeHead(status, headers);
        res.end(body);
      } catch (error) {
        res.writeHead(500, {
          "content-type": "application/json",
          "x-api-version": API_VERSION,
          "x-contract-version": CONTRACT_VERSION,
        });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : "unknown error" }));
      }
    });
  }).listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
  });
}

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectRun && process.env.API_DISABLE_LISTEN !== "1") {
  startServer();
}
