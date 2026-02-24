# Franchise Strategy → Playbooks

## Route + entry point

- Open from **Franchise Strategy → Team Identity → Playbooks**.
- Route: `/strategy/playbooks`.
- Screen always renders using coordinator-first system detection with scheme-style fallback.

## Paste-friendly playbook files

Paste full implementations directly into these files (default export only). No registry edits are needed.

### Offense placeholders
- `src/pages/hub/strategy/playbooks/offense/AIR_RAID.tsx`
- `src/pages/hub/strategy/playbooks/offense/SHANAHAN_WIDE_ZONE.tsx`
- `src/pages/hub/strategy/playbooks/offense/VERTICAL_PASSING.tsx`
- `src/pages/hub/strategy/playbooks/offense/PRO_STYLE_BALANCED.tsx`
- `src/pages/hub/strategy/playbooks/offense/POWER_GAP.tsx`
- `src/pages/hub/strategy/playbooks/offense/ERHARDT_PERKINS.tsx`
- `src/pages/hub/strategy/playbooks/offense/RUN_AND_SHOOT.tsx`
- `src/pages/hub/strategy/playbooks/offense/SPREAD_RPO.tsx`
- `src/pages/hub/strategy/playbooks/offense/WEST_COAST.tsx`
- `src/pages/hub/strategy/playbooks/offense/AIR_CORYELL.tsx`
- `src/pages/hub/strategy/playbooks/offense/MODERN_TRIPLE_OPTION.tsx`
- `src/pages/hub/strategy/playbooks/offense/CHIP_KELLY_RPO.tsx`
- `src/pages/hub/strategy/playbooks/offense/TWO_TE_POWER_I.tsx`
- `src/pages/hub/strategy/playbooks/offense/MOTION_BASED_MISDIRECTION.tsx`
- `src/pages/hub/strategy/playbooks/offense/POWER_SPREAD.tsx`

### Defense placeholders
- `src/pages/hub/strategy/playbooks/defense/THREE_FOUR_TWO_GAP.tsx`
- `src/pages/hub/strategy/playbooks/defense/FOUR_TWO_FIVE.tsx`
- `src/pages/hub/strategy/playbooks/defense/SEATTLE_COVER_3.tsx`
- `src/pages/hub/strategy/playbooks/defense/COVER_SIX.tsx`
- `src/pages/hub/strategy/playbooks/defense/FANGIO_TWO_HIGH.tsx`
- `src/pages/hub/strategy/playbooks/defense/TAMPA_2.tsx`
- `src/pages/hub/strategy/playbooks/defense/MULTIPLE_HYBRID.tsx`
- `src/pages/hub/strategy/playbooks/defense/CHAOS_FRONT.tsx`
- `src/pages/hub/strategy/playbooks/defense/PHILLIPS_BASE_THREE_FOUR.tsx`
- `src/pages/hub/strategy/playbooks/defense/LEBEAU_ZONE_BLITZ_THREE_FOUR.tsx`
- `src/pages/hub/strategy/playbooks/defense/BEARS_FOUR_SIX.tsx`
- `src/pages/hub/strategy/playbooks/defense/FOUR_THREE_OVER.tsx`
- `src/pages/hub/strategy/playbooks/defense/SINGLE_HIGH_COVER_3.tsx`
- `src/pages/hub/strategy/playbooks/defense/SABAN_COVER_4_MATCH.tsx`
- `src/pages/hub/strategy/playbooks/defense/RYAN_NICKEL_PRESSURE.tsx`

## Canonical mapping notes

Mapping is done with **ordered if/else precedence** (no Unknown bucket):

- Cover-3 precedence: `SEATTLE/CARROLL` → `SEATTLE_COVER_3`, else `SINGLE/SINGLE_HIGH` → `SINGLE_HIGH_COVER_3`, else generic `COVER_3/COVER3` → `SINGLE_HIGH_COVER_3`.
- Unknown offense defaults to `PRO_STYLE_BALANCED`.
- Unknown defense defaults to `MULTIPLE_HYBRID`.

## Coordinator-first detection

The UI resolves coordinator system (and source path used) by checking:

- `staff.coordinators.OC|DC.system|scheme|systemId`
- `staff.hires.OC|DC.system|scheme|systemId`
- `staff.staffByRole.OC|DC.system|scheme|systemId`
- `staff.ocSystem` / `staff.dcSystem`
- fallback `scheme.offense.style` / `scheme.defense.style`

The Active System panel shows:
- Canonical scheme id
- Coordinator name
- Source path used
- Raw system string
