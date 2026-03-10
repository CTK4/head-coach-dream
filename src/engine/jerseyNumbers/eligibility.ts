import { ELIGIBLE_RECEIVER_RANGES } from "@/engine/jerseyNumbers/rules";
import { inRanges } from "@/engine/jerseyNumbers/utils";

export function isEligibleReceiverNumber(n: number): boolean {
  return Number.isInteger(n) && inRanges(n, ELIGIBLE_RECEIVER_RANGES);
}
