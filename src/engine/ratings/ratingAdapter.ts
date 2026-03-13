const CANONICAL_RATING_KEYS: Record<string, string[]> = {
  Football_IQ: ["Football_IQ", "footballIQ", "footballIq"],
  Vision: ["Vision", "vision"],
  Awareness: ["Awareness", "awareness"],
  Focus: ["Focus", "focus"],
  Poise: ["Poise", "poise", "poiseUnderPressure"],
  Pocket_Presence: ["Pocket_Presence", "pocketPresence"],
  Release: ["Release", "release", "anticipation"],
  Arm_Strength: ["Arm_Strength", "armStrength"],
  Accuracy_Mid: ["Accuracy_Mid", "accuracyMid"],
  Decision_Speed: ["Decision_Speed", "decisionSpeed"],
  Route_Running: ["Route_Running", "routeRunning"],
  Speed: ["Speed", "speed"],
  Acceleration: ["Acceleration", "acceleration"],
  Agility: ["Agility", "agility", "changeOfDirection", "cod"],
  Hands: ["Hands", "hands", "catching"],
  Jumping: ["Jumping", "jumping", "vertical"],
  Strength: ["Strength", "strength"],
  Body_Control: ["Body_Control", "bodyControl", "body_control", "balance", "coordination"],
  Height_Inches: ["Height_Inches", "heightIn"],
  Weight_Lbs: ["Weight_Lbs", "weight", "mass"],
  Man_Coverage: ["Man_Coverage", "manCoverage"],
  Zone_Coverage: ["Zone_Coverage", "zoneCoverage"],
  Ball_Skills: ["Ball_Skills", "ballSkills"],
  Tackling: ["Tackling", "tackling"],
};

export function getCanonicalRating(player: unknown, canonicalName: keyof typeof CANONICAL_RATING_KEYS, fallback = 70): number {
  const obj = player as Record<string, unknown> | null | undefined;
  if (!obj) return fallback;
  for (const key of CANONICAL_RATING_KEYS[canonicalName]) {
    const value = Number(obj[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return fallback;
}
