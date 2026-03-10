import { describe, expect, it } from "vitest";
import { getDefaultConfigRegistry } from "@/engine/config/configRegistry";
import { validateConfigPins, validateConfigRegistry } from "@/engine/config/validateConfig";

describe("validateConfig", () => {
  it("accepts the default registry", () => {
    const registry = getDefaultConfigRegistry();
    expect(validateConfigRegistry(registry)).toEqual({ ok: true });
  });

  it("fails when pinned configVersion mismatches", () => {
    const registry = getDefaultConfigRegistry();
    const result = validateConfigPins(registry, { configVersion: "9.9.9", calibrationPackId: registry.calibrationPackId });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("PIN_MISMATCH");
    }
  });

  it("fails when pinned calibrationPackId mismatches", () => {
    const registry = getDefaultConfigRegistry();
    const result = validateConfigPins(registry, { configVersion: registry.configVersion, calibrationPackId: "unknown-pack" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("PIN_MISMATCH");
    }
  });
});
