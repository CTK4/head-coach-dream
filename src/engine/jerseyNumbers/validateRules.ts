export type NumberRange = readonly [number, number];

export type PositionGroupRules<TGroup extends string> = {
  allowedRangesByGroup: Record<TGroup, NumberRange[]>;
  preferredOrderByGroup: Record<TGroup, number[]>;
  eligibleReceiverRanges: NumberRange[];
};

export function expandAllowedNumbers(ranges: NumberRange[]): number[] {
  const out: number[] = [];
  for (const [min, max] of ranges) {
    for (let n = min; n <= max; n++) out.push(n);
  }
  return out;
}

export function validatePreferredOrder(group: string, preferredOrder: number[], allowedRanges: NumberRange[]): void {
  const allowed = new Set(expandAllowedNumbers(allowedRanges));
  for (const n of preferredOrder) {
    if (!allowed.has(n)) throw new Error(`Invalid preferredOrder for ${group}: number ${n} not allowed`);
  }

  const allowedList = [...allowed].sort((a, b) => a - b);
  const preferredUnique = [...new Set(preferredOrder)].sort((a, b) => a - b);
  if (preferredOrder.length !== preferredUnique.length) throw new Error(`Invalid preferredOrder for ${group}: duplicate numbers`);
  if (allowedList.length !== preferredUnique.length) throw new Error(`Invalid preferredOrder for ${group}: missing numbers`);
  for (let i = 0; i < allowedList.length; i++) {
    if (allowedList[i] !== preferredUnique[i]) throw new Error(`Invalid preferredOrder for ${group}: gaps or invalid values`);
  }
}

export function validateEligibilityRanges(ranges: NumberRange[]): void {
  for (const [min, max] of ranges) {
    if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
      throw new Error(`Invalid eligibility range: [${min}, ${max}]`);
    }
  }
}

export function assertValidJerseyRules<TGroup extends string>(rules: PositionGroupRules<TGroup>): void {
  (Object.keys(rules.allowedRangesByGroup) as TGroup[]).forEach((group) => {
    validatePreferredOrder(group, rules.preferredOrderByGroup[group], rules.allowedRangesByGroup[group]);
  });
  validateEligibilityRanges(rules.eligibleReceiverRanges);
}
