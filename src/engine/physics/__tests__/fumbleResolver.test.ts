import { describe, expect, it } from "vitest";
import { rng } from "@/engine/rng";
import { resolveFumble } from "@/engine/physics/fumbleResolver";

const base = {
  carrier: { balanceZ: 0.4, strengthZ: 0.35, fatigue01: 0.2 },
  hitter: { hitPowerZ: 0.62, tackleZ: 0.58 },
  context: { impulseProxy: 1.05, surface: "DRY" as const, contactType: "RUN" as const },
};

describe("resolveFumble", () => {
  it("is deterministic", () => {
    expect(resolveFumble(base, rng(909, "fum"))).toEqual(resolveFumble(base, rng(909, "fum")));
  });

  it("wet surface increases fumble and weird bounce frequency", () => {
    let dryFumbles = 0;
    let wetFumbles = 0;
    let dryWeird = 0;
    let wetWeird = 0;
    for (let i = 0; i < 1200; i += 1) {
      const dry = resolveFumble({ ...base, context: { ...base.context, surface: "DRY" } }, rng(10000 + i, "surf"));
      const wet = resolveFumble({ ...base, context: { ...base.context, surface: "WET" } }, rng(10000 + i, "surf"));
      if (dry.fumble) {
        dryFumbles += 1;
        if (dry.bounce?.weird) dryWeird += 1;
      }
      if (wet.fumble) {
        wetFumbles += 1;
        if (wet.bounce?.weird) wetWeird += 1;
      }
    }
    expect(wetFumbles).toBeGreaterThan(dryFumbles);
    expect(wetWeird).toBeGreaterThan(dryWeird);
  });
});
