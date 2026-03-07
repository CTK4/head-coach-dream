import { describe, expect, it } from "vitest";
import { shouldRenderRecoveryMode } from "@/App";

describe("shouldRenderRecoveryMode", () => {
  it("returns true when recoveryNeeded is true", () => {
    expect(shouldRenderRecoveryMode({ recoveryNeeded: true })).toBe(true);
  });

  it("returns false when recoveryNeeded is false or missing", () => {
    expect(shouldRenderRecoveryMode({ recoveryNeeded: false })).toBe(false);
    expect(shouldRenderRecoveryMode({ recoveryNeeded: undefined })).toBe(false);
  });
});
