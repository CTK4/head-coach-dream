/**
 * Playbook DSL — minimal builder utilities for describing play definitions.
 *
 * Provides typed factory functions so play authors use a concise, validated
 * notation instead of hand-writing raw ExpandedPlay JSON.
 */

import type { ExpandedPlay } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Player role helpers
// ─────────────────────────────────────────────────────────────────────────────

export type PlayerRole =
  | "QB" | "RB" | "FB"
  | "WR1" | "WR2" | "WR3"
  | "TE1" | "TE2"
  | "LT" | "LG" | "C" | "RG" | "RT"
  | "SLOT";

export type RouteKind = "route" | "run" | "block";
export type RouteStyle = "solid" | "dash";

export interface PointDef {
  x: number;
  y: number;
}

export interface RouteDef {
  role: PlayerRole;
  points: PointDef[];
  kind: RouteKind;
  style?: RouteStyle;
}

export interface PlayerDef {
  role: PlayerRole;
  x: number;
  y: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder: point helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Shorthand for a coordinate pair. */
export function pt(x: number, y: number): PointDef {
  return { x, y };
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder: player placement
// ─────────────────────────────────────────────────────────────────────────────

/** Place a player at a field position. */
export function player(role: PlayerRole, x: number, y: number): PlayerDef {
  return { role, x, y };
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder: route definitions
// ─────────────────────────────────────────────────────────────────────────────

/** Define a pass route or run path for a player. */
export function route(
  role: PlayerRole,
  points: PointDef[],
  kind: RouteKind = "route",
  style: RouteStyle = "solid",
): RouteDef {
  if (points.length < 2) {
    throw new Error(`Route for ${role} needs at least 2 points (start + at least one destination).`);
  }
  return { role, points, kind, style };
}

/** Convenience: a straight vertical stem + break at the end (out, dig, post, etc.) */
export function breakRoute(
  role: PlayerRole,
  startX: number,
  startY: number,
  stemLength: number,
  breakX: number,
  breakY: number,
): RouteDef {
  return route(role, [pt(startX, startY), pt(startX, startY + stemLength), pt(breakX, breakY)]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder: play definition factory
// ─────────────────────────────────────────────────────────────────────────────

export type PlayTypeDSL = ExpandedPlay["type"];

/**
 * Define a complete play using the DSL.
 * Validates that routes reference valid player roles.
 */
export function definePlay(opts: {
  playId: string;
  name: string;
  type: PlayTypeDSL;
  family: string;
  players: PlayerDef[];
  routes: RouteDef[];
  tags?: string[];
}): ExpandedPlay {
  const playerRoles = new Set(opts.players.map((p) => p.role));
  for (const r of opts.routes) {
    if (!playerRoles.has(r.role)) {
      throw new Error(
        `Route references role "${r.role}" but that player is not in the formation. ` +
          `Available roles: ${[...playerRoles].join(", ")}`,
      );
    }
  }
  return {
    playId: opts.playId,
    name: opts.name,
    type: opts.type,
    family: opts.family,
    diagram: {
      players: opts.players.map(({ role, x, y }) => ({ role, x, y })),
      paths: opts.routes.map(({ role, points, kind, style }) => ({
        role,
        points,
        style: style ?? "solid",
        kind,
      })),
    },
    tags: opts.tags ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Formation presets (reusable starting positions)
// ─────────────────────────────────────────────────────────────────────────────

/** Standard 11-personnel (1RB, 1TE, 3WR) shotgun formation. */
export function shotgunTriple11(): PlayerDef[] {
  return [
    player("QB",  50, 35),
    player("RB",  58, 35),
    player("LT",  38, 50),
    player("LG",  43, 50),
    player("C",   50, 50),
    player("RG",  57, 50),
    player("RT",  62, 50),
    player("TE1", 67, 50),
    player("WR1", 10, 48),
    player("WR2", 90, 48),
    player("SLOT",20, 45),
  ];
}

/** Standard I-formation (2RB, 1TE, 2WR). */
export function iFormationPro(): PlayerDef[] {
  return [
    player("QB",  50, 45),
    player("FB",  50, 38),
    player("RB",  50, 30),
    player("LT",  38, 50),
    player("LG",  43, 50),
    player("C",   50, 50),
    player("RG",  57, 50),
    player("RT",  62, 50),
    player("TE1", 67, 50),
    player("WR1", 10, 48),
    player("WR2", 90, 48),
  ];
}
