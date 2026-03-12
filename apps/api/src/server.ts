import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

type SaveMetadata = {
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

type SaveDb = {
  snapshots: Record<string, SaveSnapshot>;
  sequenceBySaveId: Record<string, number>;
  operationsById: Record<string, MutationRecord>;
};

type ResponseTuple = [number, Record<string, string>, string];

type MutationContext = {
  operationId: string;
  sequence: number;
  saveId: string;
  method: string;
  path: string;
  requestHash: string;
};

const PORT = Number(process.env.PORT ?? 8787);
function getDbPath() {
  return resolve(process.cwd(), process.env.API_DB_PATH ?? "data/saves.json");
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

function hashRequest(method: string, path: string, bodyRaw: string) {
  const canonicalBody = bodyRaw.trim() ? JSON.stringify(JSON.parse(bodyRaw)) : "{}";
  return `${method}::${path}::${canonicalBody}`;
}

function parseMutationContext(req: IncomingMessage, pathname: string, bodyRaw: string, derivedSaveId?: string): MutationContext | null {
  const operationIdHeader = req.headers["x-operation-id"];
  const sequenceHeader = req.headers["x-sequence-number"];
  const operationId = typeof operationIdHeader === "string" ? operationIdHeader.trim() : "";
  const sequence = Number(sequenceHeader);
  if (!operationId || !Number.isSafeInteger(sequence) || sequence < 1) {
    return null;
  }

  const saveIdHeader = req.headers["x-save-id"];
  const saveId = derivedSaveId
    ?? (typeof saveIdHeader === "string" && saveIdHeader.trim() ? saveIdHeader.trim() : "");

  if (!saveId) return null;

  return {
    operationId,
    sequence,
    saveId,
    method: req.method ?? "GET",
    path: pathname,
    requestHash: hashRequest(req.method ?? "GET", pathname, bodyRaw || "{}"),
  };
}

function conflictResponse(code: string, expectedSequence: number, actualSequence: number) {
  return json({ error: code, expectedSequence, actualSequence }, 409);
}

function validateAndReplayIfNeeded(db: SaveDb, mutation: MutationContext): ResponseTuple | null {
  const previous = db.operationsById[mutation.operationId];
  if (previous) {
    if (previous.requestHash !== mutation.requestHash || previous.saveId !== mutation.saveId || previous.sequence !== mutation.sequence) {
      return json({ error: "operation_id_conflict" }, 409);
    }
    return [
      previous.status,
      {
        "content-type": "application/json",
        "x-operation-id": previous.operationId,
        "x-sequence-number": String(previous.sequence),
        "x-idempotent-replay": "true",
      },
      previous.responseBody,
    ];
  }

  const current = db.sequenceBySaveId[mutation.saveId] ?? 0;
  const expected = current + 1;
  if (mutation.sequence !== expected) {
    return conflictResponse("sequence_conflict", expected, mutation.sequence);
  }
  return null;
}

function recordMutation(db: SaveDb, mutation: MutationContext, response: ResponseTuple) {
  const [status, , body] = response;
  db.sequenceBySaveId[mutation.saveId] = mutation.sequence;
  db.operationsById[mutation.operationId] = {
    operationId: mutation.operationId,
    saveId: mutation.saveId,
    sequence: mutation.sequence,
    method: mutation.method,
    path: mutation.path,
    requestHash: mutation.requestHash,
    status,
    responseBody: body,
    createdAt: Date.now(),
  };
}

async function handle(req: IncomingMessage, bodyRaw: string): Promise<ResponseTuple> {
  const method = req.method ?? "GET";
  const pathname = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`).pathname;
  const db = await loadDb();

  if (method === "GET" && pathname === "/api/v1/health") {
    return json({ status: "ok" });
  }

  if (method === "GET" && pathname === "/api/v1/saves/metadata") {
    return json({ saves: Object.values(db.snapshots).map((entry) => entry.metadata) });
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
      return response;
    }
  }

  return json({ error: "not found" }, 404);
}

export function createApiServer() {
  return createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", async () => {
      try {
        const bodyRaw = Buffer.concat(chunks).toString("utf8");
        const [status, headers, body] = await handle(req, bodyRaw);
        res.writeHead(status, headers);
        res.end(body);
      } catch (error) {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: error instanceof Error ? error.message : "unknown error" }));
      }
    });
  });
}

if (process.env.START_API_SERVICE === "1") {
  createApiServer().listen(PORT, () => {
    console.log(`[api] listening on http://localhost:${PORT}`);
  });
}
