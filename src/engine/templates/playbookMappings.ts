import type { ConceptTemplateId, DefenseTemplateId } from "@/engine/assignments/types";

export type PlayTypeHint = "RUN" | "PASS" | "PLAY_ACTION" | "SCREEN" | "RPO";

type MappingSource = "explicit" | "inferred";

function normalizeName(name: string): string {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const OFFENSE_EXPLICIT_NAME_TO_TEMPLATE: Record<string, ConceptTemplateId> = {
  "inside zone": "R1",
  "outside zone": "R2",
  "power": "R3",
  "quick game": "P12",
  "dropback": "P5",
  "play action": "PA1",
  "screen": "S1",
  "rpo read": "R7",
  "mesh": "P11",
  "y cross": "P16",
  "quick slant flat": "P12",
  "gap run": "R4",
};

const DEFENSE_EXPLICIT_NAME_TO_TEMPLATE: Record<string, DefenseTemplateId> = {
  "cover 2": "D4",
  "cover 3": "D5",
  "quarters": "D8",
  "man": "D1",
  "cover 1": "D1",
  "cover 1 man free": "D1",
  "man press": "D1",
  "sim": "D13",
  "blitz": "D12",
  "light box": "D5",
  "normal box": "D5",
  "heavy box": "D16",
  "spy qb": "D2",
  "bracket star": "D14",
  "prevent": "D11",
};

function includesAny(normalizedName: string, keywords: string[]): boolean {
  return keywords.some((keyword) => normalizedName.includes(keyword));
}

export function inferOffenseTemplateIdFromName(name: string, playTypeHint?: PlayTypeHint): ConceptTemplateId {
  const n = normalizeName(name);

  if (includesAny(n, ["inside zone", " iz ", "zone inside"])) return "R1";
  if (includesAny(n, ["outside zone", " oz ", "stretch", "wide zone"])) return "R2";
  if (includesAny(n, ["power"])) return "R3";
  if (includesAny(n, ["counter", "trey"])) return "R4";
  if (includesAny(n, ["split zone"])) return "R5";
  if (includesAny(n, ["draw"])) return "R6";
  if (includesAny(n, ["read", "veer", "bash", "power read"])) return "R7";
  if (includesAny(n, ["speed option", "option"])) return "R8";
  if (includesAny(n, ["duo"])) return "R9";
  if (includesAny(n, ["trap"])) return "R10";
  if (includesAny(n, ["qb sneak", "qb keep", "qb run", "qb power", "qb iso", "qb draw"])) return "R11";
  if (includesAny(n, ["jet", "orbit", "sweep", "reverse"])) return "R12";
  if (includesAny(n, ["pin pull", "pin-pull", "toss", "crack toss"])) return "R13";

  if (includesAny(n, ["verts", "989", "all go", "go"])) return "P1";
  if (includesAny(n, ["mills", "post dig", "dig post"])) return "P2";
  if (includesAny(n, ["yankee", "post cross", "deep over shot"])) return "P3";
  if (includesAny(n, ["dagger"])) return "P4";
  if (includesAny(n, ["levels"])) return "P5";
  if (includesAny(n, ["comeback", "fade stop"])) return "P6";
  if (includesAny(n, ["scissors", "divide", "double post", "post wheel", "slot fade", "deep corner"])) return "P7";
  if (includesAny(n, ["sail", "flood", "bench", "3 level"])) return "P8";
  if (includesAny(n, ["smash", "china", "stick nod"])) return "P9";
  if (includesAny(n, ["drive", "shallow"])) return "P10";
  if (includesAny(n, ["mesh"])) return "P11";
  if (includesAny(n, ["curl flat", "stick", "quick out", "speed out", "all hitches", "slant flat"])) return "P12";
  if (includesAny(n, ["choice", "option", "pivot", "texas"])) return "P13";
  if (includesAny(n, ["seam", "bender", "wheel seam"])) return "P14";
  if (includesAny(n, ["wheel"])) return "P15";
  if (includesAny(n, ["cross", "deep over", "cross country"])) return "P16";

  if (includesAny(n, ["boot", "boot flood"])) return "PA3";
  if (includesAny(n, ["leak"])) return "PA4";
  if (includesAny(n, ["pop"])) return "PA5";
  if (includesAny(n, ["cross", "over", "yankee"])) return "PA2";
  if (n.includes("pa") || n.includes("play action")) return "PA1";

  if (includesAny(n, ["rb screen", "slip"])) return "S1";
  if (includesAny(n, ["middle screen"])) return "S2";
  if (includesAny(n, ["tunnel", "jailbreak"])) return "S3";
  if (includesAny(n, ["bubble", "now", "choice screen"])) return "S4";
  if (includesAny(n, ["swing"])) return "S5";
  if (includesAny(n, ["te screen", "te delay"])) return "S6";

  if (playTypeHint === "RUN") return "R1";
  if (playTypeHint === "SCREEN") return "S1";
  if (playTypeHint === "PLAY_ACTION") return "PA1";
  return "P12";
}

export function inferDefenseTemplateIdFromName(name: string, tagsHint: string[] = []): DefenseTemplateId {
  const n = normalizeName(name);
  const tags = tagsHint.map((t) => normalizeName(t));
  const inTags = (k: string) => tags.some((t) => t.includes(k));

  if (includesAny(n, ["cover 1", "man free", "man press"])) return "D1";
  if (includesAny(n, ["zero", "cover 0"])) return "D2";
  if (includesAny(n, ["robber", "rat"])) return "D2";
  if (includesAny(n, ["2 man", "two man"])) return "D9";
  if (includesAny(n, ["tampa", "tampa 2"])) return "D4";
  if (includesAny(n, ["cover 2"])) return "D4";
  if (includesAny(n, ["cloud", "trap"])) return "D7";
  if (includesAny(n, ["buzz", "invert"])) return "D6";
  if (includesAny(n, ["cover 3", "c3", "sky"])) return "D5";
  if (includesAny(n, ["quarters", "cover 4", "match"])) return "D8";
  if (includesAny(n, ["cover 6", "c6", "split field", "poach", "solo", "stubbie", "box"])) return "D9";
  if (includesAny(n, ["drop 8", "drop-8"])) return "D10";
  if (includesAny(n, ["sim", "creeper"]) || inTags("sim") || inTags("creeper")) return "D11";
  if (includesAny(n, ["fire zone", "fire", "zone blitz"])) return "D6";
  if (includesAny(n, ["bracket", "double"])) return "D12";
  if (includesAny(n, ["red", "clamp", "goal line"])) {
    if (includesAny(n, ["goal", "46", "bear", "heavy"])) return "D14";
    return "D13";
  }

  return "D5";
}

function resolveOffenseByName(name: string, playTypeHint?: PlayTypeHint): { id: ConceptTemplateId; source: MappingSource } {
  const normalized = normalizeName(name);
  const explicit = OFFENSE_EXPLICIT_NAME_TO_TEMPLATE[normalized];
  if (explicit) return { id: explicit, source: "explicit" };
  return { id: inferOffenseTemplateIdFromName(name, playTypeHint), source: "inferred" };
}

function resolveDefenseByName(name: string, tagsHint?: string[]): { id: DefenseTemplateId; source: MappingSource } {
  const normalized = normalizeName(name);
  const explicit = DEFENSE_EXPLICIT_NAME_TO_TEMPLATE[normalized];
  if (explicit) return { id: explicit, source: "explicit" };
  return { id: inferDefenseTemplateIdFromName(name, tagsHint), source: "inferred" };
}

function assertResolved<T extends string>(id: T | undefined, kind: string, name: string): T {
  if (id) return id;
  if (import.meta.env?.DEV) throw new Error(`[assignments] Unresolved ${kind} template for: ${name}`);
  throw new Error(`[assignments] Unresolved ${kind} template in production fallback path for: ${name}`);
}

export function mapOffensePlayNameToTemplateId(name: string, playTypeHint?: PlayTypeHint): ConceptTemplateId {
  const resolved = resolveOffenseByName(name, playTypeHint);
  return assertResolved(resolved.id, "offense", name);
}

export function mapDefenseCallNameToTemplateId(name: string, tagsHint?: string[]): DefenseTemplateId {
  const resolved = resolveDefenseByName(name, tagsHint);
  return assertResolved(resolved.id, "defense", name);
}

export function resolveOffenseTemplateMapping(name: string, playTypeHint?: PlayTypeHint): { templateId: ConceptTemplateId; source: MappingSource } {
  const resolved = resolveOffenseByName(name, playTypeHint);
  return { templateId: assertResolved(resolved.id, "offense", name), source: resolved.source };
}

export function resolveDefenseTemplateMapping(name: string, tagsHint?: string[]): { templateId: DefenseTemplateId; source: MappingSource } {
  const resolved = resolveDefenseByName(name, tagsHint);
  return { templateId: assertResolved(resolved.id, "defense", name), source: resolved.source };
}
