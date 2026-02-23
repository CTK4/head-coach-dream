import type { CoachReputation } from "@/engine/reputation";

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
  reputationProfile: CoachReputation;
  pathSummary: {
    perks: string[];
    downsides: string[];
  };
};

export const ARCHETYPES: Archetype[] = [
  {
    id: "oc_promoted",
    label: "OC → HC",
    desc: "Playcaller elevated based on offensive success.",
    repStart: 56,
    autonomyStart: 65,
    ownerTrustBaseline: 52,
    gmRelationshipStart: 50,
    coordDeferenceLevel: 46,
    mediaExpectation: 74,
    lockerRoomCred: 70,
    reputationProfile: {
      leaguePrestige: 68,
      offCred: 85,
      defCred: 40,
      leadershipTrust: 62,
      mediaRep: 74,
      playerRespect: 70,
      ownerPatienceMult: 0.95,
      autonomyLevel: 65,
      riskTolerancePerception: 60,
      innovationPerception: 75,
      volatilityExpectation: "MED_HIGH",
    },
    pathSummary: {
      perks: [
        "Offensive system installs quickly — players buy in faster",
        "OC candidates actively seek you out",
        "Early offensive results build owner confidence",
      ],
      downsides: [
        "Defensive coordinators expect more autonomy — hard to override",
        "Defensive credibility is capped early and takes years to earn",
      ],
    },
  },
  {
    id: "dc_promoted",
    label: "DC → HC",
    desc: "Culture, discipline, toughness leader.",
    repStart: 55,
    autonomyStart: 60,
    ownerTrustBaseline: 53,
    gmRelationshipStart: 52,
    coordDeferenceLevel: 45,
    mediaExpectation: 60,
    lockerRoomCred: 75,
    reputationProfile: {
      leaguePrestige: 66,
      offCred: 45,
      defCred: 88,
      leadershipTrust: 72,
      mediaRep: 60,
      playerRespect: 75,
      ownerPatienceMult: 1.05,
      autonomyLevel: 60,
      riskTolerancePerception: 45,
      innovationPerception: 50,
      volatilityExpectation: "LOW_MED",
    },
    pathSummary: {
      perks: [
        "Defense is scheme-ready from day one",
        "Veteran defensive players respect your background immediately",
        "Elite DC candidates are easier to hire",
      ],
      downsides: [
        "Offensive coordinators push back on play-calling involvement",
        "Offensive credibility is capped early — takes time to earn trust",
      ],
    },
  },
  {
    id: "college_hc",
    label: "College HC → Pro HC",
    desc: "Program builder entering the pros.",
    repStart: 60,
    autonomyStart: 72,
    ownerTrustBaseline: 55,
    gmRelationshipStart: 47,
    coordDeferenceLevel: 50,
    mediaExpectation: 68,
    lockerRoomCred: 60,
    reputationProfile: {
      leaguePrestige: 58,
      offCred: 65,
      defCred: 65,
      leadershipTrust: 78,
      mediaRep: 68,
      playerRespect: 60,
      ownerPatienceMult: 1.1,
      autonomyLevel: 72,
      riskTolerancePerception: 70,
      innovationPerception: 68,
      volatilityExpectation: "HIGH",
    },
    pathSummary: {
      perks: [
        "Best developer in the league — young players grow faster under you",
        "Recruiting pipeline brings in draft prospects with familiarity",
        "Scheme is fully established from day one",
      ],
      downsides: [
        "Veteran players are skeptical — locker room credibility takes time",
        "Scheme translation penalty in year one as the roster adjusts",
      ],
    },
  },
  {
    id: "stc_promoted",
    label: "Special Teams → HC",
    desc: "Detail-oriented organizational culture candidate.",
    repStart: 51,
    autonomyStart: 55,
    ownerTrustBaseline: 50,
    gmRelationshipStart: 54,
    coordDeferenceLevel: 55,
    mediaExpectation: 48,
    lockerRoomCred: 68,
    reputationProfile: {
      leaguePrestige: 55,
      offCred: 50,
      defCred: 50,
      leadershipTrust: 82,
      mediaRep: 48,
      playerRespect: 68,
      ownerPatienceMult: 1.0,
      autonomyLevel: 55,
      riskTolerancePerception: 40,
      innovationPerception: 45,
      volatilityExpectation: "LOW",
    },
    pathSummary: {
      perks: [
        "Hidden player value — your scouting finds gems others miss",
        "Elite special teams unit from the start",
        "Underdog narrative drives media interest and fan support",
      ],
      downsides: [
        "Legitimacy gap — coordinators and players question your authority early",
        "League prestige starts lower and climbs slowly",
      ],
    },
  },
  {
    id: "assistant_grinder",
    label: "Assistant → HC",
    desc: "Fast-riser, not previously a primary coordinator.",
    repStart: 52,
    autonomyStart: 48,
    ownerTrustBaseline: 48,
    gmRelationshipStart: 49,
    coordDeferenceLevel: 60,
    mediaExpectation: 50,
    lockerRoomCred: 60,
    reputationProfile: {
      leaguePrestige: 52,
      offCred: 55,
      defCred: 55,
      leadershipTrust: 65,
      mediaRep: 50,
      playerRespect: 60,
      ownerPatienceMult: 0.9,
      autonomyLevel: 48,
      riskTolerancePerception: 65,
      innovationPerception: 72,
      volatilityExpectation: "VERY_HIGH",
    },
    pathSummary: {
      perks: [
        "Deep GM relationships — trades and extensions go smoother",
        "Strong staff network makes coordinator hiring easier",
        "Owner gives you more time to prove yourself",
      ],
      downsides: [
        "No established scheme identity — press and fans question your vision",
        "Fanbase and media growth is slower without a signature style",
      ],
    },
  },
  {
    id: "young_guru",
    label: "Young Guru → HC",
    desc: "Innovator hired for offensive revolution.",
    repStart: 60,
    autonomyStart: 75,
    ownerTrustBaseline: 52,
    gmRelationshipStart: 50,
    coordDeferenceLevel: 42,
    mediaExpectation: 85,
    lockerRoomCred: 72,
    reputationProfile: {
      leaguePrestige: 72,
      offCred: 90,
      defCred: 42,
      leadershipTrust: 60,
      mediaRep: 85,
      playerRespect: 72,
      ownerPatienceMult: 0.92,
      autonomyLevel: 75,
      riskTolerancePerception: 85,
      innovationPerception: 95,
      volatilityExpectation: "EXTREME",
    },
    pathSummary: {
      perks: [
        "Innovation perception is high — media and fans are excited early",
        "Young players are energized by your style",
        "Scheme creates matchup problems that offset talent gaps",
      ],
      downsides: [
        "Veterans are skeptical — older players need to see results first",
        "Older assistants resist your staff culture; chemistry takes time",
      ],
    },
  },
];
