import type { OffenseSchemeId } from "../schemeDisplay";

export type OffensePlaybookContent = {
  identity: string;
  formations: string[];
  concepts: string[];
  situations: string[];
  coachingPoints: string[];
};

export const OFFENSE_PLAYBOOK_CONTENT: Record<OffenseSchemeId, OffensePlaybookContent> = {
  AIR_RAID: {
    identity: "High-volume quick game that isolates leverage defenders and creates efficient throws in space.",
    formations: ["2x2 Gun Spread", "3x1 Trips Open", "Empty Doubles"],
    concepts: ["Mesh", "Y-Cross", "Stick", "Four Verticals", "Shallow Cross"],
    situations: ["Tempo 2-minute script", "3rd-and-medium spacing menu", "Red-zone pick/rub package"],
    coachingPoints: ["Keep drops synced to route depth", "Tag answers vs pressure pre-snap", "Prioritize YAC over contested targets"],
  },
  SHANAHAN_WIDE_ZONE: {
    identity: "Outside-zone run family with heavy motion and hard play-action to stress second-level fits.",
    formations: ["21 Pony", "12 Condensed", "11 Orbit Motion"],
    concepts: ["Wide Zone", "Split Zone", "Boot Flood", "Drift", "Keeper"],
    situations: ["1st-down run/pass marry", "Naked keeper off scripted motion", "Shot plays after successful stretch series"],
    coachingPoints: ["Sell same picture pre-snap", "Track helmet placement on zone tracks", "Build explosive passes off run tendency"],
  },
  VERTICAL_PASSING: {
    identity: "Downfield shot structure that attacks deep thirds and intermediate voids with layered stems.",
    formations: ["2x2 Pro Gun", "3x1 Trips", "Max-Pro 12"],
    concepts: ["Dagger", "Post-Dig", "Yankee", "Sail", "Scissors"],
    situations: ["1st-and-10 explosives", "2nd-and-short takeaways", "Field-position backed-up launch calls"],
    coachingPoints: ["Set launch point with protection", "Use cadence/tempo to earn one-on-ones", "Teach QB hitch timing to route breaks"],
  },
  PRO_STYLE_BALANCED: {
    identity: "Multiple personnel offense balancing downhill run game with timing-based dropback concepts.",
    formations: ["21 I-Right/Left", "12 Ace", "11 Gun Tight"],
    concepts: ["Duo", "Power", "Curl-Flat", "Levels", "Play-Action Cross"],
    situations: ["Early-down tendency breakers", "4-minute closeout package", "Short-yardage under-center menu"],
    coachingPoints: ["Sequence calls by defensive response", "Keep personnel flexible without substitution tells", "Create constraint plays weekly"],
  },
  POWER_GAP: {
    identity: "Physical gap-scheme core built on pullers, double teams, and play-action complements.",
    formations: ["12 Tight", "21 Offset I", "22 Heavy"],
    concepts: ["Power", "Counter", "GT Counter", "Dart", "Power Pass"],
    situations: ["Short yardage identity calls", "4-minute clock management", "Heavy red-zone package"],
    coachingPoints: ["Define puller aiming points", "Win vertical displacement on doubles", "Marry PA protection to run look"],
  },
  ERHARDT_PERKINS: {
    identity: "Concept-language system using flexible tags so personnel can execute multiple route combinations.",
    formations: ["11 Spread", "12 Flex", "20 Empty"],
    concepts: ["Ghost", "Drive", "Choice", "Levels", "Screen family"],
    situations: ["Weekly game-plan install flexibility", "No-huddle terminology compression", "Third-down option route package"],
    coachingPoints: ["Coach concept rules over memorized trees", "Rep universal tags across groups", "Pair backfield actions with same concept shell"],
  },
  RUN_AND_SHOOT: {
    identity: "Receiver option-route offense that reads leverage post-snap and attacks grass quickly.",
    formations: ["10 Doubles", "10 Trips", "Empty Spread"],
    concepts: ["Choice", "Switch", "Go", "Streak-Read", "Middle Read"],
    situations: ["3rd-and-long isolation menu", "Middle-of-field open checks", "Two-minute hurry-up progression"],
    coachingPoints: ["QB and WR must share coverage language", "Stress spacing integrity", "Use motion to identify coverage shell"],
  },
  SPREAD_RPO: {
    identity: "Conflict-defender offense blending inside run tracks with fast glance, stick, and bubble access throws.",
    formations: ["11 2x2", "11 Trips", "20 Split Gun"],
    concepts: ["Inside Zone Glance", "Power Read", "Bubble/Now", "Stick RPO", "Counter RPO"],
    situations: ["Box-count checks on early downs", "Fast tempo after explosives", "Boundary access throws vs pressure"],
    coachingPoints: ["Define read key every call", "Maintain OL run demeanor on pass tags", "Teach QB footwork for give/keep/throw timing"],
  },
  WEST_COAST: {
    identity: "Rhythm and timing pass game designed to create catch-and-run opportunities underneath.",
    formations: ["11 Pro", "21 Strong", "12 Slot"],
    concepts: ["Slant-Flat", "Spacing", "Drive", "Sprint Out", "All-Hitch"],
    situations: ["Scripted openers", "3rd-and-short high percentage throws", "Red-zone spacing package"],
    coachingPoints: ["Ball out on final step", "Detail route landmarks", "Use backs/TEs as primary answers vs pressure"],
  },
  AIR_CORYELL: {
    identity: "Numbered route-tree attack pushing vertical stems and intermediate timing windows.",
    formations: ["11 Slot", "12 Max-Pro", "20 Gun Split"],
    concepts: ["Digit route tree", "989", "Mills", "Post-Curl", "Deep Comeback"],
    situations: ["Play-action shot menu", "2nd-and-short explosives", "Backed-up field-flip calls"],
    coachingPoints: ["Coach precise depth and break angle", "Protect with six/seven-man plans", "Stack complementary routes for same shell"],
  },
  MODERN_TRIPLE_OPTION: {
    identity: "Gun-based option structure layering dive, keep, and pitch with modern RPO complements.",
    formations: ["Pistol Flexbone", "Gun Slot", "Unbalanced Option"],
    concepts: ["Inside Veer", "Midline", "Speed Option", "Arc Read", "Pop Pass"],
    situations: ["Numbers-based perimeter checks", "Goal-line option package", "Short-yardage QB run answers"],
    coachingPoints: ["Rep mesh mechanics daily", "Identify force and pitch key pre-snap", "Tag simple pass constraints to punish overplay"],
  },
  CHIP_KELLY_RPO: {
    identity: "High-tempo spread menu that pairs packaged runs with immediate perimeter and glance answers.",
    formations: ["11 Fast 2x2", "11 Trips Tempo", "20 Empty Tempo"],
    concepts: ["Inside Zone/Bubble", "Buck Sweep", "Snag", "H-Option", "Tempo Screens"],
    situations: ["No-huddle drive segments", "Freeze tempo at line for checks", "Explosive response calls after first downs"],
    coachingPoints: ["Operate on simple repeated tags", "Condition pace without busts", "Use formation variation with minimal new teaching"],
  },
  TWO_TE_POWER_I: {
    identity: "Heavy personnel downhill offense using extra gaps and max-protection vertical shots.",
    formations: ["22 Power I", "13 Heavy Wing", "12 Tight I"],
    concepts: ["Iso", "Power O", "Lead Toss", "Counter Trey", "Max-Pro Post"],
    situations: ["Short-yardage/goal-line core", "Four-minute bleed package", "Hard play-action on loaded boxes"],
    coachingPoints: ["Own point of attack with TE surfaces", "Coach FB track and insert timing", "Select deep shots off same protection picture"],
  },
  MOTION_BASED_MISDIRECTION: {
    identity: "Pre-snap shifts and motion creating eye conflict before misdirection runs and split-flow passes.",
    formations: ["11 Jet Orbit", "12 Shift to Empty", "21 Return Motion"],
    concepts: ["Jet Sweep", "Orbit Return", "Counter Bash", "Leak", "Slice Boot"],
    situations: ["Use motion to ID coverage", "Chunk-play changeups", "Red-zone misdirection package"],
    coachingPoints: ["Motion timing must hit snap landmarks", "Avoid procedural penalties with clear cadence rules", "Pair each motion with constraint counter"],
  },
  POWER_SPREAD: {
    identity: "Spread spacing married to physical gap runs and QB-involved downhill complements.",
    formations: ["11 Tight Spread", "10 Wide Box", "20 Pistol Spread"],
    concepts: ["QB Power", "Counter Read", "Duo RPO", "Y-Cross", "Play-Action Post"],
    situations: ["Early-down physical statements", "3rd-and-medium QB run threats", "Red-zone spread power menu"],
    coachingPoints: ["Set numbers with formation spacing", "Teach QB run reads with ball security emphasis", "Use same look for run and shot complements"],
  },
};
