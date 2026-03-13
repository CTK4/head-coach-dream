import { describe, expect, it } from "vitest";
import { resolveOffenseRoles } from "@/engine/assignments/offenseRoleResolver";

describe("resolveOffenseRoles", () => {
  it("maps all supported personnel groups deterministically", () => {
    expect(resolveOffenseRoles("10").eligibleRoleAssignments).toEqual({ QB: "QB1", RB: "RB1", X: "WR1", Z: "WR2", H: "WR3", Y: "WR4" });
    expect(resolveOffenseRoles("11").eligibleRoleAssignments).toEqual({ QB: "QB1", RB: "RB1", X: "WR1", Z: "WR2", H: "WR3", Y: "TE1" });
    expect(resolveOffenseRoles("12").eligibleRoleAssignments).toEqual({ QB: "QB1", RB: "RB1", X: "WR1", Z: "WR2", H: "TE2", Y: "TE1" });
    expect(resolveOffenseRoles("21").eligibleRoleAssignments).toEqual({ QB: "QB1", RB: "RB1", X: "WR1", Z: "WR2", H: "FB1", Y: "TE1" });
    expect(resolveOffenseRoles("22").eligibleRoleAssignments).toEqual({ QB: "QB1", RB: "RB1", X: "WR1", Z: "TE2", H: "FB1", Y: "TE1" });
  });

  it("always maps the OL to LT1/LG1/C1/RG1/RT1", () => {
    expect(resolveOffenseRoles("11").olAssignments).toEqual({ LT: "LT1", LG: "LG1", C: "C1", RG: "RG1", RT: "RT1" });
  });
});
