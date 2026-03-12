import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Ajv from "ajv";
import YAML from "yaml";
import { startServer } from "../src/server";

const PORT = 8791;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const openapiRaw = await readFile(new URL("../openapi.yaml", import.meta.url), "utf8");
const openapi = YAML.parse(openapiRaw);
const ajv = new Ajv({ strict: false, allErrors: true });

const saveMetadataSchema = openapi.components.schemas.SaveMetadata;
const saveSnapshotSchema = openapi.components.schemas.SaveSnapshotResponse;
const saveStateSchema = openapi.components.schemas.SaveState;
const metadataListSchema = openapi.components.schemas.MetadataListResponse;
const paginationSchema = openapi.components.schemas.Pagination;
const errorEnvelopeSchema = openapi.components.schemas.ErrorEnvelope;
const healthSchema = openapi.components.schemas.HealthResponse;

const validateSaveMetadata = ajv.compile(saveMetadataSchema);
const validateSaveSnapshot = ajv.compile({
  ...saveSnapshotSchema,
  properties: {
    ...saveSnapshotSchema.properties,
    metadata: saveMetadataSchema,
    state: saveStateSchema,
  },
});
const validateMetadataList = ajv.compile({
  ...metadataListSchema,
  properties: {
    ...metadataListSchema.properties,
    saves: { type: "array", items: saveMetadataSchema },
    pagination: paginationSchema,
  },
});
const validateErrorEnvelope = ajv.compile(errorEnvelopeSchema);
const validateHealth = ajv.compile(healthSchema);

let tempDir = "";
let server: ReturnType<typeof startServer>;

const assertValid = (valid: boolean | PromiseLike<unknown>, errors: unknown) => {
  expect(valid).toBe(true);
  if (!valid) {
    throw new Error(JSON.stringify(errors));
  }
};

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

function assertVersionHeaders(response: Response) {
  expect(response.headers.get("x-api-version")).toBe("v1");
  expect(response.headers.get("x-contract-version") ?? "").toMatch(/^\d{4}-\d{2}-\d{2}$/);
}

beforeAll(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "api-contract-"));
  process.env.API_DB_PATH = join(tempDir, "saves.json");
  process.env.API_DISABLE_LISTEN = "1";
  server = startServer(PORT);
});

afterAll(async () => {
  server.close();
  await rm(tempDir, { recursive: true, force: true });
});

describe("API contract tests", () => {
  it("validates contract example fixtures", async () => {
    const healthExample = JSON.parse(
      await readFile(new URL("./contract/fixtures/health-response.json", import.meta.url), "utf8"),
    );
    assertValid(validateHealth(healthExample), validateHealth.errors);

    const notFoundExample = JSON.parse(
      await readFile(new URL("./contract/fixtures/not-found-error.json", import.meta.url), "utf8"),
    );
    assertValid(validateErrorEnvelope(notFoundExample), validateErrorEnvelope.errors);
  });

  it("validates runtime responses against OpenAPI schema", async () => {
    const createBody = JSON.parse(
      await readFile(new URL("./contract/fixtures/create-snapshot-request.json", import.meta.url), "utf8"),
    );
    createBody.saveId = `career-contract-${Date.now()}`;

    const createRes = await api("/api/v1/saves/snapshots", {
      method: "POST",
      body: JSON.stringify(createBody),
    });

    expect(createRes.response.status).toBe(201);
    assertVersionHeaders(createRes.response);
    assertValid(validateSaveSnapshot(createRes.body), validateSaveSnapshot.errors);

    const metadataRes = await api("/api/v1/saves/metadata?limit=1&cursor=0");
    expect(metadataRes.response.status).toBe(200);
    assertVersionHeaders(metadataRes.response);
    assertValid(validateMetadataList(metadataRes.body), validateMetadataList.errors);
  });

  it("enforces backward compatibility envelope/pagination/timestamps/version headers", async () => {
    const missingRes = await api("/api/v1/saves/non-existent/snapshot");
    expect(missingRes.response.status).toBe(404);
    assertVersionHeaders(missingRes.response);
    assertValid(validateErrorEnvelope(missingRes.body), validateErrorEnvelope.errors);
    expect(typeof missingRes.body.error).toBe("string");

    const metadataRes = await api("/api/v1/saves/metadata?limit=5&cursor=0");
    expect(metadataRes.response.status).toBe(200);
    assertVersionHeaders(metadataRes.response);
    assertValid(validateMetadataList(metadataRes.body), validateMetadataList.errors);

    for (const save of metadataRes.body.saves) {
      assertValid(validateSaveMetadata(save), validateSaveMetadata.errors);
      expect(Number.isInteger(save.updatedAt)).toBe(true);
      expect(Number.isInteger(save.lastPlayed)).toBe(true);
    }
  });
});
