export type GmScoutTraits = {
  eval_bandwidth: number;
  film_process: number;
  intel_network: number;
  risk_management: number;
  analytics_orientation: number;
  urgency_bias: number;
  aggression: number;
  discipline: number;
  bias_star: number;
  bias_value: number;
  bias_trenches: number;
  bias_athleticism: number;
  bias_defense: number;
};

export const GM_TRAITS: Record<string, GmScoutTraits> = {
  // In-league GMs
  PERS_0033: { eval_bandwidth: 74, film_process: 68, intel_network: 55, risk_management: 45, analytics_orientation: 60, urgency_bias: 82, aggression: 86, discipline: 48, bias_star: 78, bias_value: 40, bias_trenches: 46, bias_athleticism: 64, bias_defense: 50 },
  PERS_0034: { eval_bandwidth: 70, film_process: 72, intel_network: 62, risk_management: 65, analytics_orientation: 74, urgency_bias: 60, aggression: 68, discipline: 70, bias_star: 62, bias_value: 58, bias_trenches: 56, bias_athleticism: 55, bias_defense: 50 },
  PERS_0035: { eval_bandwidth: 68, film_process: 74, intel_network: 58, risk_management: 72, analytics_orientation: 62, urgency_bias: 62, aggression: 52, discipline: 78, bias_star: 40, bias_value: 54, bias_trenches: 72, bias_athleticism: 44, bias_defense: 86 },
  PERS_0036: { eval_bandwidth: 78, film_process: 78, intel_network: 64, risk_management: 70, analytics_orientation: 72, urgency_bias: 52, aggression: 48, discipline: 76, bias_star: 46, bias_value: 64, bias_trenches: 58, bias_athleticism: 50, bias_defense: 54 },
  PERS_0037: { eval_bandwidth: 72, film_process: 70, intel_network: 60, risk_management: 74, analytics_orientation: 78, urgency_bias: 55, aggression: 46, discipline: 82, bias_star: 42, bias_value: 80, bias_trenches: 60, bias_athleticism: 46, bias_defense: 70 },
  PERS_0038: { eval_bandwidth: 70, film_process: 72, intel_network: 58, risk_management: 72, analytics_orientation: 66, urgency_bias: 58, aggression: 50, discipline: 78, bias_star: 40, bias_value: 60, bias_trenches: 78, bias_athleticism: 50, bias_defense: 82 },
  PERS_0039: { eval_bandwidth: 72, film_process: 70, intel_network: 62, risk_management: 70, analytics_orientation: 68, urgency_bias: 52, aggression: 54, discipline: 72, bias_star: 50, bias_value: 62, bias_trenches: 58, bias_athleticism: 52, bias_defense: 58 },
  PERS_0040: { eval_bandwidth: 70, film_process: 68, intel_network: 58, risk_management: 74, analytics_orientation: 82, urgency_bias: 58, aggression: 44, discipline: 84, bias_star: 38, bias_value: 88, bias_trenches: 56, bias_athleticism: 44, bias_defense: 58 },
  PERS_0041: { eval_bandwidth: 74, film_process: 74, intel_network: 62, risk_management: 72, analytics_orientation: 90, urgency_bias: 56, aggression: 52, discipline: 78, bias_star: 46, bias_value: 84, bias_trenches: 60, bias_athleticism: 50, bias_defense: 66 },
  PERS_0042: { eval_bandwidth: 76, film_process: 64, intel_network: 60, risk_management: 50, analytics_orientation: 62, urgency_bias: 70, aggression: 82, discipline: 50, bias_star: 90, bias_value: 40, bias_trenches: 44, bias_athleticism: 66, bias_defense: 50 },
  PERS_0043: { eval_bandwidth: 72, film_process: 72, intel_network: 62, risk_management: 70, analytics_orientation: 70, urgency_bias: 54, aggression: 56, discipline: 72, bias_star: 52, bias_value: 62, bias_trenches: 56, bias_athleticism: 52, bias_defense: 56 },
  PERS_0044: { eval_bandwidth: 72, film_process: 72, intel_network: 64, risk_management: 72, analytics_orientation: 68, urgency_bias: 52, aggression: 52, discipline: 74, bias_star: 46, bias_value: 70, bias_trenches: 60, bias_athleticism: 50, bias_defense: 60 },
  PERS_0045: { eval_bandwidth: 74, film_process: 66, intel_network: 60, risk_management: 60, analytics_orientation: 68, urgency_bias: 66, aggression: 64, discipline: 58, bias_star: 56, bias_value: 58, bias_trenches: 50, bias_athleticism: 88, bias_defense: 48 },
  PERS_0046: { eval_bandwidth: 76, film_process: 76, intel_network: 64, risk_management: 74, analytics_orientation: 80, urgency_bias: 48, aggression: 44, discipline: 80, bias_star: 38, bias_value: 78, bias_trenches: 62, bias_athleticism: 46, bias_defense: 56 },
  PERS_0047: { eval_bandwidth: 74, film_process: 68, intel_network: 56, risk_management: 50, analytics_orientation: 64, urgency_bias: 80, aggression: 84, discipline: 52, bias_star: 76, bias_value: 44, bias_trenches: 50, bias_athleticism: 62, bias_defense: 50 },
  PERS_0048: { eval_bandwidth: 78, film_process: 70, intel_network: 62, risk_management: 66, analytics_orientation: 86, urgency_bias: 62, aggression: 66, discipline: 70, bias_star: 54, bias_value: 90, bias_trenches: 56, bias_athleticism: 58, bias_defense: 54 },
  PERS_0049: { eval_bandwidth: 72, film_process: 72, intel_network: 64, risk_management: 70, analytics_orientation: 74, urgency_bias: 60, aggression: 64, discipline: 72, bias_star: 58, bias_value: 66, bias_trenches: 58, bias_athleticism: 52, bias_defense: 58 },
  PERS_0050: { eval_bandwidth: 70, film_process: 70, intel_network: 62, risk_management: 78, analytics_orientation: 66, urgency_bias: 64, aggression: 58, discipline: 84, bias_star: 40, bias_value: 62, bias_trenches: 64, bias_athleticism: 48, bias_defense: 62 },
  PERS_0051: { eval_bandwidth: 74, film_process: 64, intel_network: 58, risk_management: 58, analytics_orientation: 66, urgency_bias: 70, aggression: 66, discipline: 60, bias_star: 60, bias_value: 54, bias_trenches: 52, bias_athleticism: 92, bias_defense: 52 },
  PERS_0052: { eval_bandwidth: 76, film_process: 74, intel_network: 62, risk_management: 72, analytics_orientation: 72, urgency_bias: 50, aggression: 46, discipline: 76, bias_star: 42, bias_value: 66, bias_trenches: 58, bias_athleticism: 54, bias_defense: 54 },
  PERS_0053: { eval_bandwidth: 72, film_process: 68, intel_network: 60, risk_management: 74, analytics_orientation: 80, urgency_bias: 54, aggression: 44, discipline: 82, bias_star: 38, bias_value: 86, bias_trenches: 56, bias_athleticism: 46, bias_defense: 56 },
  PERS_0054: { eval_bandwidth: 74, film_process: 64, intel_network: 60, risk_management: 52, analytics_orientation: 62, urgency_bias: 68, aggression: 80, discipline: 52, bias_star: 88, bias_value: 40, bias_trenches: 44, bias_athleticism: 62, bias_defense: 52 },
  PERS_0055: { eval_bandwidth: 74, film_process: 66, intel_network: 60, risk_management: 52, analytics_orientation: 64, urgency_bias: 72, aggression: 86, discipline: 50, bias_star: 90, bias_value: 42, bias_trenches: 46, bias_athleticism: 64, bias_defense: 50 },
  PERS_0056: { eval_bandwidth: 74, film_process: 74, intel_network: 64, risk_management: 72, analytics_orientation: 76, urgency_bias: 54, aggression: 58, discipline: 74, bias_star: 54, bias_value: 66, bias_trenches: 60, bias_athleticism: 54, bias_defense: 56 },
  PERS_0057: { eval_bandwidth: 72, film_process: 72, intel_network: 62, risk_management: 74, analytics_orientation: 70, urgency_bias: 52, aggression: 48, discipline: 78, bias_star: 42, bias_value: 72, bias_trenches: 78, bias_athleticism: 48, bias_defense: 74 },
  PERS_0058: { eval_bandwidth: 74, film_process: 68, intel_network: 60, risk_management: 66, analytics_orientation: 84, urgency_bias: 60, aggression: 58, discipline: 72, bias_star: 48, bias_value: 82, bias_trenches: 54, bias_athleticism: 78, bias_defense: 58 },
  PERS_0059: { eval_bandwidth: 74, film_process: 72, intel_network: 60, risk_management: 74, analytics_orientation: 66, urgency_bias: 60, aggression: 54, discipline: 78, bias_star: 42, bias_value: 62, bias_trenches: 74, bias_athleticism: 48, bias_defense: 80 },
  PERS_0060: { eval_bandwidth: 72, film_process: 70, intel_network: 62, risk_management: 74, analytics_orientation: 80, urgency_bias: 56, aggression: 50, discipline: 80, bias_star: 44, bias_value: 84, bias_trenches: 58, bias_athleticism: 52, bias_defense: 60 },
  PERS_0061: { eval_bandwidth: 72, film_process: 70, intel_network: 62, risk_management: 74, analytics_orientation: 86, urgency_bias: 54, aggression: 48, discipline: 82, bias_star: 42, bias_value: 88, bias_trenches: 58, bias_athleticism: 50, bias_defense: 62 },
  PERS_0062: { eval_bandwidth: 74, film_process: 72, intel_network: 60, risk_management: 72, analytics_orientation: 70, urgency_bias: 58, aggression: 54, discipline: 76, bias_star: 44, bias_value: 64, bias_trenches: 82, bias_athleticism: 50, bias_defense: 78 },
  PERS_0063: { eval_bandwidth: 74, film_process: 72, intel_network: 62, risk_management: 78, analytics_orientation: 70, urgency_bias: 66, aggression: 60, discipline: 82, bias_star: 40, bias_value: 66, bias_trenches: 64, bias_athleticism: 52, bias_defense: 62 },
  PERS_0064: { eval_bandwidth: 72, film_process: 72, intel_network: 64, risk_management: 72, analytics_orientation: 70, urgency_bias: 48, aggression: 46, discipline: 78, bias_star: 44, bias_value: 64, bias_trenches: 58, bias_athleticism: 48, bias_defense: 56 },

  // Free-agent GMs
  PERS_0065: { eval_bandwidth: 72, film_process: 66, intel_network: 56, risk_management: 50, analytics_orientation: 64, urgency_bias: 78, aggression: 82, discipline: 52, bias_star: 74, bias_value: 44, bias_trenches: 50, bias_athleticism: 60, bias_defense: 50 },
  PERS_0066: { eval_bandwidth: 78, film_process: 70, intel_network: 62, risk_management: 74, analytics_orientation: 88, urgency_bias: 56, aggression: 44, discipline: 84, bias_star: 38, bias_value: 90, bias_trenches: 58, bias_athleticism: 50, bias_defense: 60 },
  PERS_0067: { eval_bandwidth: 74, film_process: 64, intel_network: 60, risk_management: 54, analytics_orientation: 66, urgency_bias: 68, aggression: 80, discipline: 54, bias_star: 90, bias_value: 40, bias_trenches: 44, bias_athleticism: 64, bias_defense: 52 },
  PERS_0068: { eval_bandwidth: 76, film_process: 74, intel_network: 62, risk_management: 72, analytics_orientation: 72, urgency_bias: 50, aggression: 46, discipline: 76, bias_star: 42, bias_value: 66, bias_trenches: 58, bias_athleticism: 54, bias_defense: 54 },
  PERS_0069: { eval_bandwidth: 72, film_process: 72, intel_network: 60, risk_management: 74, analytics_orientation: 66, urgency_bias: 56, aggression: 52, discipline: 78, bias_star: 42, bias_value: 62, bias_trenches: 82, bias_athleticism: 48, bias_defense: 84 },
  PERS_0070: { eval_bandwidth: 70, film_process: 66, intel_network: 60, risk_management: 62, analytics_orientation: 78, urgency_bias: 62, aggression: 56, discipline: 70, bias_star: 48, bias_value: 86, bias_trenches: 52, bias_athleticism: 56, bias_defense: 54 },
  PERS_0071: { eval_bandwidth: 72, film_process: 70, intel_network: 62, risk_management: 70, analytics_orientation: 70, urgency_bias: 52, aggression: 54, discipline: 72, bias_star: 50, bias_value: 62, bias_trenches: 58, bias_athleticism: 52, bias_defense: 58 },
  PERS_0073: { eval_bandwidth: 70, film_process: 70, intel_network: 62, risk_management: 72, analytics_orientation: 66, urgency_bias: 46, aggression: 44, discipline: 76, bias_star: 42, bias_value: 64, bias_trenches: 56, bias_athleticism: 48, bias_defense: 54 },
  PERS_0074: { eval_bandwidth: 76, film_process: 70, intel_network: 60, risk_management: 66, analytics_orientation: 88, urgency_bias: 60, aggression: 60, discipline: 70, bias_star: 50, bias_value: 84, bias_trenches: 52, bias_athleticism: 82, bias_defense: 60 },
  PERS_0075: { eval_bandwidth: 72, film_process: 72, intel_network: 64, risk_management: 72, analytics_orientation: 78, urgency_bias: 58, aggression: 64, discipline: 74, bias_star: 56, bias_value: 68, bias_trenches: 58, bias_athleticism: 54, bias_defense: 56 },
  PERS_0076: { eval_bandwidth: 76, film_process: 76, intel_network: 64, risk_management: 74, analytics_orientation: 78, urgency_bias: 48, aggression: 44, discipline: 80, bias_star: 38, bias_value: 78, bias_trenches: 62, bias_athleticism: 46, bias_defense: 56 },
  PERS_0077: { eval_bandwidth: 74, film_process: 66, intel_network: 58, risk_management: 60, analytics_orientation: 68, urgency_bias: 68, aggression: 66, discipline: 60, bias_star: 60, bias_value: 54, bias_trenches: 52, bias_athleticism: 92, bias_defense: 52 },
  PERS_0078: { eval_bandwidth: 70, film_process: 70, intel_network: 62, risk_management: 78, analytics_orientation: 66, urgency_bias: 64, aggression: 58, discipline: 84, bias_star: 40, bias_value: 62, bias_trenches: 64, bias_athleticism: 48, bias_defense: 62 },
  PERS_0079: { eval_bandwidth: 72, film_process: 70, intel_network: 62, risk_management: 74, analytics_orientation: 80, urgency_bias: 56, aggression: 50, discipline: 80, bias_star: 44, bias_value: 84, bias_trenches: 58, bias_athleticism: 52, bias_defense: 60 },
  PERS_0243: { eval_bandwidth: 74, film_process: 62, intel_network: 70, risk_management: 54, analytics_orientation: 64, urgency_bias: 78, aggression: 72, discipline: 52, bias_star: 60, bias_value: 56, bias_trenches: 46, bias_athleticism: 58, bias_defense: 52 },
  PERS_0251: { eval_bandwidth: 68, film_process: 72, intel_network: 60, risk_management: 82, analytics_orientation: 70, urgency_bias: 62, aggression: 58, discipline: 90, bias_star: 40, bias_value: 60, bias_trenches: 60, bias_athleticism: 46, bias_defense: 62 },
};

export function getGmTraits(personId?: string): GmScoutTraits {
  if (!personId) return GM_TRAITS.PERS_0043;
  return GM_TRAITS[personId] ?? GM_TRAITS.PERS_0043;
}

export function gmAccuracyScore(t: GmScoutTraits) {
  const v =
    30 +
    0.25 * t.film_process +
    0.2 * t.analytics_orientation +
    0.15 * t.intel_network +
    0.2 * t.risk_management -
    0.15 * t.urgency_bias;
  return Math.max(0, Math.min(100, Math.round(v)));
}
