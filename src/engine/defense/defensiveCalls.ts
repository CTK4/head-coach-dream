export type DefensiveCall =
  | { kind: "SHELL"; shell: "COVER_2" | "COVER_3" | "QUARTERS" | "MAN"; press: boolean }
  | { kind: "PRESSURE"; pressure: "NONE" | "SIM" | "BLITZ"; blitzRate: 0 | 1 | 2 }
  | { kind: "RUN_FIT"; box: "LIGHT" | "NORMAL" | "HEAVY"; containEdge: boolean }
  | { kind: "SPECIAL"; tag: "SPY_QB" | "BRACKET_STAR" | "PREVENT" };

export type DefensiveCallMultiplierSet = {
  pComp: number;
  sackProb: number;
  pExpl: number;
  pInt: number;
  runStuff: number;
  runExpl: number;
  passRushWin: number;
  scrambleSuppression: number;
  debug: string[];
};

export function baseDefensiveCallMultipliers(): DefensiveCallMultiplierSet {
  return {
    pComp: 1,
    sackProb: 1,
    pExpl: 1,
    pInt: 1,
    runStuff: 1,
    runExpl: 1,
    passRushWin: 1,
    scrambleSuppression: 1,
    debug: [],
  };
}

export function applyDefensiveCallMultipliers(call: DefensiveCall | undefined): DefensiveCallMultiplierSet {
  const out = baseDefensiveCallMultipliers();
  if (!call) return out;

  if (call.kind === "SHELL") {
    if (call.shell === "MAN") {
      out.pComp *= call.press ? 0.94 : 0.98;
      out.pExpl *= call.press ? 1.14 : 1.08;
      out.debug.push(call.press ? "shell:man+press" : "shell:man");
    } else if (call.shell === "QUARTERS") {
      out.pExpl *= 0.82;
      out.pComp *= 1.02;
      out.debug.push("shell:quarters");
    } else if (call.shell === "COVER_2") {
      out.pExpl *= 0.88;
      out.pComp *= 1.04;
      out.debug.push("shell:cover2");
    } else if (call.shell === "COVER_3") {
      out.pExpl *= 0.93;
      out.pComp *= 1.03;
      out.debug.push("shell:cover3");
    }
  }

  if (call.kind === "PRESSURE") {
    if (call.pressure === "SIM") {
      out.sackProb *= 1.11;
      out.pExpl *= 1.04;
      out.debug.push("pressure:sim");
    } else if (call.pressure === "BLITZ") {
      out.sackProb *= 1.22;
      out.pExpl *= 1.08;
      out.pInt *= 1.05;
      out.debug.push("pressure:blitz");
    }
  }

  if (call.kind === "RUN_FIT") {
    if (call.box === "HEAVY") {
      out.runStuff *= 1.14;
      out.runExpl *= 0.88;
      out.pExpl *= 1.08;
      out.debug.push("runfit:heavy-box");
    } else if (call.box === "LIGHT") {
      out.runStuff *= 0.92;
      out.runExpl *= 1.08;
      out.debug.push("runfit:light-box");
    }
    if (call.containEdge) {
      out.scrambleSuppression *= 0.82;
      out.passRushWin *= 0.96;
      out.debug.push("runfit:contain-edge");
    }
  }

  if (call.kind === "SPECIAL") {
    if (call.tag === "PREVENT") {
      out.pExpl *= 0.8;
      out.pComp *= 1.08;
      out.debug.push("special:prevent");
    } else if (call.tag === "SPY_QB") {
      out.scrambleSuppression *= 0.7;
      out.passRushWin *= 0.97;
      out.debug.push("special:spy-qb");
    } else if (call.tag === "BRACKET_STAR") {
      out.pComp *= 0.97;
      out.pExpl *= 0.94;
      out.debug.push("special:bracket-star");
    }
  }

  return out;
}
