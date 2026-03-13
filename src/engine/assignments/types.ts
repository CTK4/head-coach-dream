export type OffensePersonnel = "10" | "11" | "12" | "21" | "22";

export type OffenseEligibleRole = "QB" | "RB" | "X" | "Z" | "H" | "Y";

export type OLineRole = "LT" | "LG" | "C" | "RG" | "RT";

export type DefensePackage = "NICKEL" | "ODD_34" | "BEAR";

export type DefenseRole =
  | "CB1"
  | "CB2"
  | "NB"
  | "FS"
  | "SS"
  | "LB1"
  | "LB2"
  | "EDGE_L"
  | "EDGE_R"
  | "DT1"
  | "DT2"
  | "OLB_L"
  | "OLB_R"
  | "DE_L"
  | "DE_R"
  | "NT";

export type BlockerRole = "LT" | "LG" | "C" | "RG" | "RT" | "RB" | "Y" | "H";

export type RushMatchup = {
  rusherRole: DefenseRole;
  blockerRoles: BlockerRole[];
  note?: string;
};

export type CoverageFamily =
  | "Cover0"
  | "Cover1"
  | "Cover2"
  | "Cover3"
  | "Cover4"
  | "Cover6"
  | "2Man"
  | "Drop8"
  | "FireZone"
  | "SimCreeper"
  | "Bracket"
  | "RedMatch"
  | "GoalLine";

export type Shell = "MOFC" | "MOFO";

export type ProtectionBaseType =
  | "quick"
  | "half-slide"
  | "max"
  | "play-action"
  | "screen"
  | "zone-run"
  | "wide-zone"
  | "gap"
  | "draw"
  | "option"
  | "boot";

export type SlideDirection = "none" | "field" | "pressure" | "run-action" | "callside";

export type ConceptTemplateId =
  | "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | "R9" | "R10" | "R11" | "R12" | "R13"
  | "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8" | "P9" | "P10" | "P11" | "P12" | "P13" | "P14" | "P15" | "P16"
  | "PA1" | "PA2" | "PA3" | "PA4" | "PA5"
  | "S1" | "S2" | "S3" | "S4" | "S5" | "S6";

export type DefenseTemplateId =
  | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8"
  | "D9" | "D10" | "D11" | "D12" | "D13" | "D14" | "D15" | "D16";

export type ProtectionAssignments = {
  protectorsCount: number;
  chipRoles: OffenseEligibleRole[];
  baseType: ProtectionBaseType;
  slideDirection: SlideDirection;
};

export type OffenseResolvedAssignments = {
  personnel: OffensePersonnel;
  eligibleRoleAssignments: Record<OffenseEligibleRole, string>;
  olAssignments: Record<OLineRole, string>;
  playConceptReads: {
    primaryReadRole: OffenseEligibleRole;
    progressionRoles: OffenseEligibleRole[];
  };
  protectionAssignments: ProtectionAssignments;
};

export type DefenseResolvedAssignments = {
  coverageFamily: CoverageFamily;
  shell: Shell;
  responsibleDefenderByRole: Partial<Record<Exclude<OffenseEligibleRole, "QB">, string>>;
  rushAssignments: {
    rushersCount: number;
    matchups: RushMatchup[];
  };
  runFits: {
    front: string;
    boxCount: number;
    forceDefender: string;
    cutbackDefender?: string;
    primaryFitDefenders: string[];
  };
};

export type PlayAssignmentLog = {
  offenseRolesAtSnap: Record<OffenseEligibleRole | OLineRole, string>;
  defenseRolesAtSnap: Partial<Record<DefenseRole, string>>;
  targetRole?: OffenseEligibleRole;
  targetPlayerId?: string;
  defenderId?: string;
  coverageFamily: CoverageFamily;
  shell: Shell;
  rushersCount: number;
  rushMatchups: Array<{ rusherId: string; blockerIds: string[]; note?: string }>;
  runFront?: string;
  boxCount?: number;
  forceDefender?: string;
  cutbackDefender?: string;
  primaryFitDefenders?: string[];
  progressionIndexUsed?: number;
  notes?: string[];
  primaryReadRole?: OffenseEligibleRole;
  progressionRoles?: OffenseEligibleRole[];
  responsibleDefenderByRole?: Partial<Record<Exclude<OffenseEligibleRole, "QB">, string>>;
};
