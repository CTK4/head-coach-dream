import { describe, expect, it } from "vitest";
import { OffseasonStepEnum, StateMachine } from "@/lib/stateMachine";

describe("offseason sequence", () => {
  it("does not include tampering", () => {
    const steps = StateMachine.getOffseasonSequence({ enableTamperingStep: true });
    expect(steps).not.toContain(OffseasonStepEnum.TAMPERING as any);
  });
});
