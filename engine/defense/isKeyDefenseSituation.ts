export function isKeyDefenseSituation(ctx: { down: number; distance: number; yardLine: number; quarter: number; clockSec: number }): boolean {
  return ctx.down === 3
    || ctx.down === 4
    || ctx.yardLine <= 20
    || ctx.yardLine <= 5
    || (ctx.quarter >= 4 && ctx.clockSec <= 120);
}
