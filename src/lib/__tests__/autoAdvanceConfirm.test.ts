import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { confirmAutoAdvance, shouldConfirmAutoAdvance } from "@/lib/autoAdvanceConfirm";

describe("shouldConfirmAutoAdvance", () => {
  it("defaults to true when setting is undefined", () => {
    expect(shouldConfirmAutoAdvance(undefined)).toBe(true);
    expect(shouldConfirmAutoAdvance({})).toBe(true);
  });

  it("returns false only when confirmAutoAdvance is explicitly false", () => {
    expect(shouldConfirmAutoAdvance({ confirmAutoAdvance: false })).toBe(false);
    expect(shouldConfirmAutoAdvance({ confirmAutoAdvance: true })).toBe(true);
  });
});

describe("confirmAutoAdvance", () => {
  beforeEach(() => {
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("calls confirm when confirmAutoAdvance is enabled", () => {
    const confirmMock = globalThis.confirm as unknown as ReturnType<typeof vi.fn>;

    expect(confirmAutoAdvance({ confirmAutoAdvance: true }, "Advance?")).toBe(true);
    expect(confirmMock).toHaveBeenCalledWith("Advance?");
  });

  it("does not call confirm when confirmAutoAdvance is disabled", () => {
    const confirmMock = globalThis.confirm as unknown as ReturnType<typeof vi.fn>;

    expect(confirmAutoAdvance({ confirmAutoAdvance: false }, "Advance?")).toBe(true);
    expect(confirmMock).not.toHaveBeenCalled();
  });
});
