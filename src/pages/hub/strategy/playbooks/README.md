# Strategy → Playbooks

## MVP behavior

- Accessible from **Franchise Strategy → Team Identity → Playbooks**.
- Toggle **Offense / Defense**.
- Displayed playbook is based on coordinator system:
  - `state.staff.ocSystem` / `state.staff.dcSystem` if present
  - else falls back to `state.scheme.offense.style` / `state.scheme.defense.style`

## Scheme placeholders created

### Offense
- `SHANAHAN_WIDE_ZONE`
- `AIR_RAID`
- `WEST_COAST`
- `POWER_GAP`
- `SPREAD_RPO`

### Defense
- `FANGIO_TWO_HIGH`
- `COVER_3_CARROLL`
- `TAMPA_2`
- `THREE_FOUR_TWO_GAP`

## Wiring your playbooks

### Copy/paste flow (matches your pasted playbook code)

Two placeholder files already exist and are wired:

- `AirRaidPlaybook.tsx`
- `ShanahanWideZonePlaybook.tsx`

Paste your provided playbook code into the matching file and keep the default export.

Other schemes remain placeholders until you add their components:

Offense placeholders:
- `WEST_COAST`
- `POWER_GAP`
- `SPREAD_RPO`

Defense placeholders:
- `FANGIO_TWO_HIGH`
- `COVER_3_CARROLL`
- `TAMPA_2`
- `THREE_FOUR_TWO_GAP`

## Canonical ID normalization

The Playbooks screen normalizes coordinator/scheme strings into canonical IDs:

### Offense
- `AIR_RAID`
- `SHANAHAN_WIDE_ZONE`
- `WEST_COAST`
- `POWER_GAP`
- `SPREAD_RPO`

### Defense
- `FANGIO_TWO_HIGH`
- `COVER_3_CARROLL`
- `TAMPA_2`
- `THREE_FOUR_TWO_GAP`

Examples accepted (mapped):
- `"Air Raid"`, `"AIRRAID"` → `AIR_RAID`
- `"Shanahan"`, `"Wide Zone"`, `"Outside Zone"` → `SHANAHAN_WIDE_ZONE`
- `"Cover 3"`, `"Carroll"` → `COVER_3_CARROLL`
- `"3-4"`, `"Two Gap"` → `THREE_FOUR_TWO_GAP`

## Coordinator system detection

The screen attempts to read the hired coordinator record first. It checks multiple shapes:

- `staff.coordinators.OC.system` / `.scheme` / `.systemId`
- `staff.hires.OC.system` / `.scheme`
- `staff.staffByRole.OC.system`
- `staff.oc.system`
- `staff.ocSystem`

If none exist, it falls back to:
- `scheme.offense.style` / `scheme.defense.style`

The UI shows the resolved **Source path** for debugging.
