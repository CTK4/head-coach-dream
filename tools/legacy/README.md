# Legacy Python Calibration Harness (Archived)

## Ownership and purpose

- Original author/maintainer in git history: **CTK4** (commit `7d5cbe5`, 2026-03-11).
- Purpose: an offline Python-only realism calibration harness used to evaluate simulation metric targets.
- Status: **archived / legacy reference**. It is not part of the current TypeScript/React production path.

## Files

- `main.py`: calibration simulator + evaluation helpers.
- `test_calibration_harness.py`: `unittest` suite for calibration evaluation and red-flag detection logic.

## Invocation and constraints

Run from this directory so local imports resolve:

```bash
cd tools/legacy
python3 test_calibration_harness.py
```

Constraints:

- Uses Python standard library only.
- Not wired into npm scripts or CI verification gates.
- No compatibility promise with application runtime behavior; treat outputs as historical reference.
