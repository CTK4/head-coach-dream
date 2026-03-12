import { createServer } from "node:http";
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

type SaveDb = { snapshots: Record<string, SaveSnapshot> };

const PORT = Number(process.env.PORT ?? 8787);
const DB_PATH = resolve(process.cwd(), "apps/api/data/saves.json");

function json(body: unknown, status = 200): ResponseTuple {
  return [status, { "content-type": "application/json" }, JSON.stringify(body)];
}

type ResponseTuple = [number, Record<string, string>, string];

async function loadDb(): Promise<SaveDb> {
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<SaveDb>;
    return { snapshots: parsed.snapshots ?? {} };
  } catch {
    return { snapshots: {} };
  }
}

async function persistDb(db: SaveDb): Promise<void> {
  await mkdir(dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
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

async function handle(method: string, pathname: string, bodyRaw: string): Promise<ResponseTuple> {
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
    const snapshot: SaveSnapshot = { saveId, metadata: deriveMetadata(saveId, payload.state), state: payload.state };
    db.snapshots[saveId] = snapshot;
    await persistDb(db);
    return json(snapshot, 201);
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
      const snapshot: SaveSnapshot = { saveId, metadata: deriveMetadata(saveId, payload.state), state: payload.state };
      db.snapshots[saveId] = snapshot;
      await persistDb(db);
      return json(snapshot);
    }

    if (method === "DELETE") {
      if (!db.snapshots[saveId]) return json({ error: "save not found" }, 404);
      delete db.snapshots[saveId];
      await persistDb(db);
      return [204, {}, ""];
    }
  }

  return json({ error: "not found" }, 404);
}

createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", async () => {
    try {
      const bodyRaw = Buffer.concat(chunks).toString("utf8");
      const pathname = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`).pathname;
      const [status, headers, body] = await handle(req.method ?? "GET", pathname, bodyRaw);
      res.writeHead(status, headers);
      res.end(body);
    } catch (error) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : "unknown error" }));
    }
  });
}).listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
