# Interactive Playoffs

## Flow
1. End of regular season now initializes playoffs bracket (no instant season rollover).
2. Career stage transitions to `PLAYOFFS` and routes to `/hub/playoffs`.
3. CPU playoff games for each round are deterministic and auto-simmed.
4. User playoff game becomes a pending playable game via `START_GAME` with `weekType="PLAYOFFS"`.
5. After Super Bowl, postseason results are written, season awards are shown, and the next season schedule is generated.

## Reducer Actions
- `PLAYOFFS_INIT_BRACKET`
- `PLAYOFFS_SIM_CPU_GAMES_FOR_ROUND`
- `PLAYOFFS_MARK_GAME_FINAL`
- `PLAYOFFS_ADVANCE_ROUND`
- `PLAYOFFS_COMPLETE_SEASON`
