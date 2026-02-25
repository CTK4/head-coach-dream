# Hub Responsive Audit Checklist

## Scope
- `src/pages/hub/**`
- `src/pages/hub/offseason/**`

## UI hardening checklist
- [x] Normalize primary interactive controls to minimum 44px touch height.
- [x] Move position/filter pill rows into horizontal scroll containers for narrow screens.
- [x] Wrap dense table content with horizontal overflow containers.
- [x] Prune low-priority columns in standings on mobile breakpoints.
- [x] Convert prospect and staff detail modals to bottom-sheet behavior on mobile.
- [x] Convert player offer/detail modal to bottom-sheet presentation on mobile classes.

## Manual responsive verification log
Responsive manual verification target matrix: 390x844 (mobile) and 768x1024 (tablet).

### Core flows
- [ ] Offseason Combine: filter pills scroll horizontally, prospect actions remain readable and tappable.
- [ ] Pre-Draft board: view mode controls and position pills scroll; visit/workout controls stay at touch size.
- [ ] Offseason Free Agency: sign/reject actions maintain minimum target size in stacked rows.
- [ ] Offseason Draft: position chips scroll horizontally; action buttons keep touch-safe sizing.
- [ ] Standings + Stats: dense table content can scroll horizontally; mobile hides PF/PA columns in standings.
- [ ] Staff Management profile: profile details open as bottom sheet on mobile and dialog on desktop.
- [ ] Prospect profile: opens as bottom sheet on mobile and dialog on desktop.
- [ ] Player offer modal: mobile breakpoint uses bottom-sheet style layout.
