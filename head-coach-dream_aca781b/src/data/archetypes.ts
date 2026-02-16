export type Archetype = {
  id: string;
  label: string;
  desc: string;
  repStart: number;
  autonomyStart: number;
  ownerTrustBaseline: number;
  gmRelationshipStart: number;
  coordDeferenceLevel: number;
  mediaExpectation: number;
  lockerRoomCred: number;
  volatility?: number;
};

export const ARCHETYPES: Archetype[] = [
  {
    id: "OC_TO_HC",
    label: "OC → HC",
    desc: "You called the offense and now take the big chair. You earn instant credibility with quarterbacks, but your defensive vision is under scrutiny.",
    repStart: 56,
    autonomyStart: 54,
    ownerTrustBaseline: 52,
    gmRelationshipStart: 50,
    coordDeferenceLevel: 46,
    mediaExpectation: 64,
    lockerRoomCred: 55,
  },
  {
    id: "DC_TO_HC",
    label: "DC → HC",
    desc: "A former defensive play-caller, you are known for discipline and toughness. Ownership expects immediate culture shifts and hard-nosed football.",
    repStart: 55,
    autonomyStart: 52,
    ownerTrustBaseline: 53,
    gmRelationshipStart: 52,
    coordDeferenceLevel: 45,
    mediaExpectation: 58,
    lockerRoomCred: 58,
  },
  {
    id: "COLLEGE_HC_TO_PRO_HC",
    label: "College HC → Pro HC",
    desc: "You built a college powerhouse and now jump to the pros. Team-building instincts are elite, but every Sunday adjustment is magnified.",
    repStart: 60,
    autonomyStart: 57,
    ownerTrustBaseline: 55,
    gmRelationshipStart: 47,
    coordDeferenceLevel: 50,
    mediaExpectation: 67,
    lockerRoomCred: 53,
  },
  {
    id: "SPECIAL_TEAMS",
    label: "Special Teams",
    desc: "You mastered hidden yardage and game management. Players respect your detail, though pundits question your offense/defense pedigree.",
    repStart: 51,
    autonomyStart: 49,
    ownerTrustBaseline: 50,
    gmRelationshipStart: 54,
    coordDeferenceLevel: 58,
    mediaExpectation: 49,
    lockerRoomCred: 57,
  },
  {
    id: "ASSISTANT_COACH",
    label: "Assistant Coach",
    desc: "Years as a trusted assistant made you a glue leader. You connect rooms well, but must prove you can own the full operation.",
    repStart: 50,
    autonomyStart: 47,
    ownerTrustBaseline: 49,
    gmRelationshipStart: 55,
    coordDeferenceLevel: 60,
    mediaExpectation: 46,
    lockerRoomCred: 54,
  },
  {
    id: "YOUNG_GURU",
    label: "Young Guru",
    desc: "The league's rising mind: creative, fearless, and modern. Expectations are sky-high, and outcomes can swing dramatically week to week.",
    repStart: 58,
    autonomyStart: 51,
    ownerTrustBaseline: 51,
    gmRelationshipStart: 49,
    coordDeferenceLevel: 44,
    mediaExpectation: 72,
    lockerRoomCred: 50,
    volatility: 70,
  },
];

