# Toolchain Version Matrix

This repository supports a single Node/npm matrix across root and mobile workspaces, with workspace-specific toolchain pins where applicable.

## Supported Matrix

| Component | Supported version / range | Applies to |
|---|---|---|
| Node.js | `>=22.17.0 <23` | root + mobile |
| npm CLI | `>=10.9.2 <11` | root + mobile |
| package manager pin | `npm@10.9.2` | root |
| TypeScript (root) | `5.8.3` | root |
| TypeScript (mobile) | `^5.8.3` | mobile |
| ESLint core (`eslint`) | `9.32.0` | root |
| ESLint base config (`@eslint/js`) | `9.32.0` | root |
| TypeScript ESLint (`typescript-eslint`) | `8.38.0` | root |

## Drift Policy

Workspace toolchain drift is **blocking**. Any mismatch to the matrix above fails verification.

## Drift Check Commands

- Root: `npm run toolchain:check`
- Mobile: `npm --prefix mobile run toolchain:check`

Both commands execute `scripts/checkToolchainDrift.mjs`, which validates root and mobile package metadata against policy.
