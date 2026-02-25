import { describe, expect, it } from "vitest";
import draftClass from "@/data/draftClass.json";
import { normalizeProspectPosition } from "@/lib/prospectPosition";

describe("normalizeProspectPosition", () => {
  it("maps edge and interior variants for scouting taxonomy", () => {
    expect(normalizeProspectPosition("DE", "SCOUTING")).toBe("EDGE");
    expect(normalizeProspectPosition("OLB/EDGE", "SCOUTING")).toBe("EDGE");
    expect(normalizeProspectPosition("IDL", "SCOUTING")).toBe("DT");
    expect(normalizeProspectPosition("NT", "SCOUTING")).toBe("DT");
    // Regression: single-letter token false positives
    expect(normalizeProspectPosition("CB", "SCOUTING")).toBe("CB");
    expect(normalizeProspectPosition("DT", "SCOUTING")).toBe("DT");
  });

  it("maps OL variants for draft taxonomy", () => {
    expect(normalizeProspectPosition("OT", "DRAFT")).toBe("OL");
    expect(normalizeProspectPosition("OG", "DRAFT")).toBe("OL");
    expect(normalizeProspectPosition("C", "DRAFT")).toBe("OL");
    expect(normalizeProspectPosition("HB", "DRAFT")).toBe("RB");
  });

  it("keeps counts non-zero for existing normalized draft class positions", () => {
    const counts = draftClass.reduce<Record<string, number>>((acc, prospect) => {
      const pos = normalizeProspectPosition(String((prospect as Record<string, unknown>).pos ?? (prospect as Record<string, unknown>).POS ?? "ATH"), "SCOUTING");
      acc[pos] = (acc[pos] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts.RB).toBeGreaterThan(0);
    expect(counts.IOL).toBeGreaterThan(0);
    expect(counts.DT).toBeGreaterThan(0);
    expect(counts.EDGE).toBeGreaterThan(0);
    // Regression: positions should not be miscategorized into others
    expect(counts.CB).toBeGreaterThan(0);
    expect(counts.CB).not.toEqual(counts.IOL);
    expect(counts.DT).not.toEqual(counts.OT);
  });
});
