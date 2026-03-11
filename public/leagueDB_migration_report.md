# leagueDB migration report

## Output files
- `leagueDB.migrated.clean.json`
- `leagueDB.migrated.legacy-title-sheets.json`
- `migrate_leagueDB_from_xlsx.py`

## High-level deltas
- Teams removed: 11
- Teams added: 11
- Total players: 2340 (was 1697)
- Net players added: 643
- Free agents in Players: 644
- PlayerMorale rows after synthesis: 2340
- Contracts: 2144
- Draft class rows: 352

## Team IDs removed
- BIRMINGHAM_VULCANS
- CHARLOTTE_CROWN
- CHICAGO_UNION
- DENVER_SUMMIT
- LOS_ANGELES_STARS
- NASHVILLE_SOUND
- PHILADELPHIA_FOUNDERS
- PHOENIX_SCORCH
- SAN_DIEGO_ARMADA
- ST._PETERSBURG_PELICANS
- WASHINGTON_SENTINELS

## Team IDs added
- ARIZONA_OUTRIDERS
- AUGUSTA_MEAN_GREEN
- IOWA_OXEN
- LOS_ANGELES_BLITZ
- LOUISVILLE_LOCOMOTIVES
- NEW_JERSEY_JURASSICS
- OMAHA_STAMPEDE
- SAN_ANTONIO_CENTURIONS
- SAN_DIEGO_STEALTH
- SILICON_VALLEY_SENTIENTS
- VIRGINIA_VENOM

## Notes
- The workbook `Divisions` tab still carried the old eight division IDs, but the `Teams` tab uses a newer set of division IDs. The JSON export regenerates `Divisions` from the team assignments so the file is internally consistent.
- The workbook adds 644 free-agent players (`teamId = "N/A"`, `status = "FREE_AGENT"`). Those players did not have `PlayerMorale` rows, so the export synthesizes default week-0 morale rows from the player sheet.
- Five `Personnel.scheme` cells were Excel-autoformatted as dates; those were normalized back to `4-2-5`.
- The workbook omits `Mental_Core`, `Athleticism`, and `Tech_Core` from the `Players` sheet. `Tech_Core` was reconstructed exactly as the average of populated technical attributes. `Mental_Core` and `Athleticism` were reconstructed from the existing schema using coefficient-based formulas.
- The draft class sheet lacks `DraftTier` and includes `overall`; the export restores `DraftTier` from rank buckets and preserves `overall`.

### Validation — clean export

- No validation issues detected.

### Validation — legacy-title export

- No validation issues detected.

