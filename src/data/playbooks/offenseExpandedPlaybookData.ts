import type { ExpandedPlay } from "@/engine/playbooks/types";

type RawPlay = Omit<ExpandedPlay, "diagram"> & {
  diagram?: ExpandedPlay["diagram"];
  routes?: Array<{ role: string; points: Array<{ x: number; y: number }>; style?: "solid" | "dash" }>;
  assignments?: Array<{ role: string; points: Array<{ x: number; y: number }>; kind: "run" | "block"; style?: "solid" | "dash" }>;
};

const AIR_RAID_PLAYS: RawPlay[] = [
  {
    playId: "air-raid-mesh",
    name: "Mesh",
    type: "PASS",
    family: "Quick Game",
    tags: ["3rd Down", "Man Beater"],
    diagram: {
      players: [
        { role: "QB", x: 50, y: 82 },
        { role: "RB", x: 58, y: 84 },
        { role: "X", x: 10, y: 64 },
        { role: "H", x: 26, y: 68 },
        { role: "Y", x: 74, y: 68 },
        { role: "Z", x: 90, y: 64 },
      ],
      paths: [
        { role: "H", kind: "route", style: "solid", points: [{ x: 26, y: 68 }, { x: 48, y: 58 }, { x: 72, y: 58 }] },
        { role: "Y", kind: "route", style: "solid", points: [{ x: 74, y: 68 }, { x: 52, y: 62 }, { x: 28, y: 62 }] },
        { role: "X", kind: "route", style: "solid", points: [{ x: 10, y: 64 }, { x: 16, y: 44 }, { x: 32, y: 40 }] },
        { role: "Z", kind: "route", style: "solid", points: [{ x: 90, y: 64 }, { x: 84, y: 44 }, { x: 68, y: 40 }] },
        { role: "RB", kind: "block", style: "dash", points: [{ x: 58, y: 84 }, { x: 58, y: 76 }] },
      ],
    },
  },
  {
    playId: "air-raid-y-cross",
    name: "Y-Cross",
    type: "PASS",
    family: "Dropback",
    tags: ["Explosive", "Middle Field Open"],
    routes: [
      { role: "Y", style: "solid", points: [{ x: 70, y: 66 }, { x: 58, y: 56 }, { x: 42, y: 40 }, { x: 20, y: 30 }] },
      { role: "X", style: "solid", points: [{ x: 10, y: 64 }, { x: 10, y: 28 }] },
      { role: "Z", style: "solid", points: [{ x: 90, y: 64 }, { x: 90, y: 28 }] },
    ],
    assignments: [
      { role: "RB", kind: "run", style: "dash", points: [{ x: 58, y: 84 }, { x: 70, y: 78 }, { x: 80, y: 70 }] },
      { role: "LT", kind: "block", style: "solid", points: [{ x: 38, y: 72 }, { x: 38, y: 62 }] },
      { role: "RT", kind: "block", style: "solid", points: [{ x: 62, y: 72 }, { x: 62, y: 62 }] },
    ],
  },
  {
    playId: "air-raid-inside-zone",
    name: "Inside Zone",
    type: "RUN",
    family: "Run Game",
    tags: ["Base Run"],
    diagram: {
      players: [
        { role: "QB", x: 50, y: 82 },
        { role: "RB", x: 56, y: 84 },
      ],
      paths: [
        { role: "RB", kind: "run", style: "solid", points: [{ x: 56, y: 84 }, { x: 52, y: 70 }, { x: 48, y: 52 }] },
        { role: "C", kind: "block", style: "solid", points: [{ x: 50, y: 72 }, { x: 50, y: 62 }] },
        { role: "LG", kind: "block", style: "solid", points: [{ x: 44, y: 72 }, { x: 42, y: 62 }] },
        { role: "RG", kind: "block", style: "solid", points: [{ x: 56, y: 72 }, { x: 58, y: 62 }] },
      ],
    },
  },
];

const GENERIC_PLAYS: RawPlay[] = [
  {
    playId: "core-quick-game",
    name: "Quick Slant/Flat",
    type: "PASS",
    family: "Quick Game",
    diagram: {
      players: [{ role: "QB", x: 50, y: 82 }],
      paths: [
        { role: "X", kind: "route", style: "solid", points: [{ x: 12, y: 64 }, { x: 24, y: 52 }] },
        { role: "Z", kind: "route", style: "solid", points: [{ x: 88, y: 64 }, { x: 74, y: 58 }] },
      ],
    },
  },
  {
    playId: "core-gap-run",
    name: "Gap Run",
    type: "RUN",
    family: "Run Game",
    diagram: {
      players: [{ role: "RB", x: 56, y: 84 }],
      paths: [
        { role: "RB", kind: "run", style: "solid", points: [{ x: 56, y: 84 }, { x: 64, y: 72 }, { x: 70, y: 56 }] },
        { role: "RG", kind: "block", style: "solid", points: [{ x: 56, y: 72 }, { x: 66, y: 66 }] },
      ],
    },
  },
];

export const OFFENSE_PLAYBOOK_PLAY_IDS: Record<string, string[]> = {
  AIR_RAID: AIR_RAID_PLAYS.map((play) => play.playId),
  "air-raid-playbook": AIR_RAID_PLAYS.map((play) => play.playId),
  SHANAHAN_WIDE_ZONE: GENERIC_PLAYS.map((play) => play.playId),
  VERTICAL_PASSING: GENERIC_PLAYS.map((play) => play.playId),
  PRO_STYLE_BALANCED: GENERIC_PLAYS.map((play) => play.playId),
  POWER_GAP: GENERIC_PLAYS.map((play) => play.playId),
  ERHARDT_PERKINS: GENERIC_PLAYS.map((play) => play.playId),
  RUN_AND_SHOOT: GENERIC_PLAYS.map((play) => play.playId),
  SPREAD_RPO: GENERIC_PLAYS.map((play) => play.playId),
  WEST_COAST: GENERIC_PLAYS.map((play) => play.playId),
  AIR_CORYELL: GENERIC_PLAYS.map((play) => play.playId),
  MODERN_TRIPLE_OPTION: GENERIC_PLAYS.map((play) => play.playId),
  CHIP_KELLY_RPO: GENERIC_PLAYS.map((play) => play.playId),
  TWO_TE_POWER_I: GENERIC_PLAYS.map((play) => play.playId),
  MOTION_BASED_MISDIRECTION: GENERIC_PLAYS.map((play) => play.playId),
  POWER_SPREAD: GENERIC_PLAYS.map((play) => play.playId),
};

export const OFFENSE_PLAYS_BY_ID: Record<string, RawPlay> = Object.fromEntries(
  [...AIR_RAID_PLAYS, ...GENERIC_PLAYS].map((play) => [play.playId, play]),
);

export type { RawPlay };
