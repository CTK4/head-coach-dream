
import json
import random
from collections import defaultdict
import math

# Configuration for realism targets (from the benchmark brief)
REALISM_TARGETS = {
    "team_ppg": {"avg": (22, 23), "range_pct": (17, 28), "range_coverage": 0.90},
    "yards_per_play": {"avg": (5.3, 5.5), "range": (4.5, 6.5), "range_coverage": 0.70},
    "run_pass_rate": {"avg_pass_pct": 0.58, "identity_shift": 0.10},
    "sack_rate_per_game": {"range": (2.0, 4.0)}, # Sacks per game per team
    "turnover_rate_per_game": {"avg_total": 2.5}, # Total turnovers per game (both teams)
    "qb_passing_yards": {"top5_min": 4500, "median": 3500, "bottom_starter_min": 2800},
    "qb_passing_tds": {"top5_min": 30, "median": (20, 22)},
    "qb_interceptions": {"top5_max": 8, "median": (10, 12), "high_max": 18},
    "rb_carries": {"top3_min": 300, "workhorse_min": 250, "committee_lead_min": 150},
    "rb_yards": {"top5_min": 1300, "1000_yard_count": (10, 12)},
    "win_distribution": {"top_max": 14, "bottom_min": 2, "mid_range_pct": (7, 10), "mid_range_coverage": 0.60},
    "playoff_win_floor": {"wildcard_min": (9, 10), "elite_min": 12},
    "stat_leader_plausibility": {"pass_yards_ceiling": 5000, "rush_yards_generational": 2000, "sacks_elite": 20}
}

class Team:
    def __init__(self, name, offensive_rating, defensive_rating, run_pass_tendency):
        self.name = name
        self.offensive_rating = offensive_rating  # 70-99
        self.defensive_rating = defensive_rating  # 70-99
        self.run_pass_tendency = run_pass_tendency  # 0.0 (all run) to 1.0 (all pass)
        self.points_scored = 0
        self.points_allowed = 0
        self.total_yards_gained = 0
        self.total_yards_allowed = 0
        self.total_plays_offense = 0
        self.total_plays_defense = 0
        self.sacks_allowed = 0
        self.sacks_generated = 0
        self.turnovers_committed = 0
        self.turnovers_forced = 0
        self.wins = 0
        self.losses = 0
        self.ties = 0
        self.stats = defaultdict(int)  # For run/pass plays, etc.
        self.games_played = 0
        self.players = [] # To store player objects associated with the team

class Player:
    def __init__(self, name, position, team):
        self.name = name
        self.position = position
        self.team = team
        self.stats = defaultdict(int)

class Game:
    def __init__(self, team1, team2, game_seed):
        self.team1 = team1
        self.team2 = team2
        self.game_seed = game_seed
        self.random = random.Random(game_seed)
        self.score_t1 = 0
        self.score_t2 = 0

    def simulate_drive(self, offense_team, defense_team):
        drive_yards = 0
        drive_plays = 0
        has_turnover = False
        has_score = False

        qb_offense = next((p for p in offense_team.players if p.position == 'QB'), None)
        rb_offense = next((p for p in offense_team.players if p.position == 'RB'), None)

        for _ in range(self.random.randint(3, 10)):  # 3-10 plays per drive
            drive_plays += 1
            offense_team.total_plays_offense += 1
            defense_team.total_plays_defense += 1

            play_type_roll = self.random.random()
            if play_type_roll < offense_team.run_pass_tendency: # Pass play
                offense_team.stats['total_pass_plays'] += 1
                # Simulate sack chance (influenced by offense_team OL and defense_team DL)
                sack_chance = (100 - offense_team.offensive_rating) / 250 + (defense_team.defensive_rating / 250 - 0.3)
                if self.random.random() < sack_chance:
                    offense_team.sacks_allowed += 1
                    defense_team.sacks_generated += 1
                    yards_gained = self.random.randint(-10, -1) # Sack results in negative yards
                else:
                    yards_gained = max(self.random.gauss(offense_team.offensive_rating / 12, 4), -5) # Yards gained on pass

                # Simulate interception chance
                int_chance = (100 - offense_team.offensive_rating) / 350 + (defense_team.defensive_rating / 350 - 0.2)
                if self.random.random() < int_chance:
                    offense_team.turnovers_committed += 1
                    defense_team.turnovers_forced += 1
                    if qb_offense: qb_offense.stats['interceptions'] += 1
                    has_turnover = True
                    break

                if qb_offense: qb_offense.stats['passing_yards'] += yards_gained
                if yards_gained > 20 and self.random.random() < 0.15: # TD chance on long pass
                    if qb_offense: qb_offense.stats['passing_tds'] += 1
                    offense_team.points_scored += 7
                    defense_team.points_allowed += 7
                    has_score = True
                    break

            else:  # Run play
                offense_team.stats['total_run_plays'] += 1
                yards_gained = max(self.random.gauss(offense_team.offensive_rating / 15, 3), -2) # Yards gained on run

                # Simulate fumble chance
                fumble_chance = (100 - offense_team.offensive_rating) / 450 + (defense_team.defensive_rating / 450 - 0.2)
                if self.random.random() < fumble_chance:
                    offense_team.turnovers_committed += 1
                    defense_team.turnovers_forced += 1
                    has_turnover = True
                    break

                if rb_offense:
                    rb_offense.stats['rushing_attempts'] += 1
                    rb_offense.stats['rushing_yards'] += yards_gained
                if yards_gained > 10 and self.random.random() < 0.1: # TD chance on long run
                    offense_team.points_scored += 7
                    defense_team.points_allowed += 7
                    has_score = True
                    break

            drive_yards += yards_gained

        offense_team.total_yards_gained += drive_yards
        defense_team.total_yards_allowed += drive_yards

        if not has_turnover and not has_score and drive_yards > 30 and self.random.random() < 0.6: # Field Goal chance
            offense_team.points_scored += 3
            defense_team.points_allowed += 3
            has_score = True

        return has_score

    def simulate_game_logic(self):
        num_drives_per_team = self.random.randint(10, 14)

        for _ in range(num_drives_per_team):
            self.simulate_drive(self.team1, self.team2)
            self.simulate_drive(self.team2, self.team1)

        # Ensure a minimum score for realism, and avoid ties for now (sudden death OT)
        if self.team1.points_scored == self.team2.points_scored:
            if self.random.random() < 0.5:
                self.team1.points_scored += 3
            else:
                self.team2.points_scored += 3

        self.team1.points_scored = max(self.team1.points_scored, 3)
        self.team2.points_scored = max(self.team2.points_scored, 3)

        if self.team1.points_scored > self.team2.points_scored:
            self.team1.wins += 1
            self.team2.losses += 1
        else:
            self.team2.wins += 1
            self.team1.losses += 1

        self.team1.games_played += 1
        self.team2.games_played += 1

        self.score_t1 = self.team1.points_scored
        self.score_t2 = self.team2.points_scored

        return {self.team1.name: self.score_t1, self.team2.name: self.score_t2}

def simulate_season(season_seed, teams, players, games_per_team):
    random.seed(season_seed)
    season_results = []

    for team in teams:
        team.players = [p for p in players if p.team == team]

    # Generate a simplified schedule: each team plays games_per_team games
    # This is not a true NFL schedule, but ensures each team plays enough games
    all_possible_matchups = []
    for i in range(len(teams)):
        for j in range(len(teams)):
            if i != j:
                all_possible_matchups.append((teams[i], teams[j]))

    # Assign games to each team until they reach games_per_team
    team_game_counts = defaultdict(int)
    scheduled_games = []

    while any(team_game_counts[team.name] < games_per_team for team in teams):
        team1 = random.choice(teams)
        team2 = random.choice([t for t in teams if t != team1])

        if team_game_counts[team1.name] < games_per_team and team_game_counts[team2.name] < games_per_team:
            scheduled_games.append((team1, team2))
            team_game_counts[team1.name] += 1
            team_game_counts[team2.name] += 1

    random.shuffle(scheduled_games)

    for team1, team2 in scheduled_games:
        game_seed = hash(f'{season_seed}-{team1.name}-{team2.name}-{team1.games_played}-{team2.games_played}') % (2**32 - 1)
        game = Game(team1, team2, game_seed)
        game_result = game.simulate_game_logic()
        season_results.append(game_result)

    return season_results

def calculate_metrics(teams, players, num_teams, total_games_per_team):
    # League Averages
    total_points_scored_league = sum(t.points_scored for t in teams)
    league_avg_ppg = total_points_scored_league / (num_teams * total_games_per_team) if num_teams * total_games_per_team > 0 else 0

    total_yards_gained_league = sum(t.total_yards_gained for t in teams)
    total_plays_offense_league = sum(t.total_plays_offense for t in teams)
    league_avg_ypp = total_yards_gained_league / total_plays_offense_league if total_plays_offense_league > 0 else 0

    # Distributions
    team_ppg_distribution = {t.name: t.points_scored / t.games_played if t.games_played > 0 else 0 for t in teams}
    team_run_pass_rate_distribution = {}
    for t in teams:
        total_plays = t.stats['total_run_plays'] + t.stats['total_pass_plays']
        team_run_pass_rate_distribution[t.name] = {
            'run_rate': t.stats['total_run_plays'] / total_plays if total_plays > 0 else 0,
            'pass_rate': t.stats['total_pass_plays'] / total_plays if total_plays > 0 else 0
        }

    # Sack and Turnover Rates
    total_pass_plays_league = sum(t.stats['total_pass_plays'] for t in teams)
    total_sacks_allowed_league = sum(t.sacks_allowed for t in teams)
    sack_rate_per_dropback = total_sacks_allowed_league / total_pass_plays_league if total_pass_plays_league > 0 else 0

    total_turnovers_committed_league = sum(t.turnovers_committed for t in teams)
    # Each game has two teams, so total games is (num_teams * total_games_per_team) / 2
    total_games_in_season = (num_teams * total_games_per_team) / 2
    turnover_rate_per_game = total_turnovers_committed_league / total_games_in_season if total_games_in_season > 0 else 0

    # QB Leaderboards
    qb_leaderboards = []
    for p in players:
        if p.position == 'QB':
            qb_leaderboards.append({
                'name': p.name,
                'team': p.team.name,
                'passing_yards': p.stats['passing_yards'],
                'passing_tds': p.stats['passing_tds'],
                'interceptions': p.stats['interceptions']
            })
    qb_leaderboards = sorted(qb_leaderboards, key=lambda x: x['passing_yards'], reverse=True)

    # RB Leaderboards
    rb_leaderboards = []
    for p in players:
        if p.position == 'RB':
            rb_leaderboards.append({
                'name': p.name,
                'team': p.team.name,
                'rushing_attempts': p.stats['rushing_attempts'],
                'rushing_yards': p.stats['rushing_yards']
            })
    rb_leaderboards = sorted(rb_leaderboards, key=lambda x: x['rushing_yards'], reverse=True)

    # Win Distribution
    win_distribution_histogram = {wins: sum(1 for team in teams if team.wins == wins) for wins in sorted(list(set(t.wins for t in teams)))}

    # Playoff Team Win Totals (simplified: top N teams make playoffs)
    sorted_teams_by_wins = sorted(teams, key=lambda x: x.wins, reverse=True)
    # For an 8-team league, let's say top 4 make playoffs
    num_playoff_teams = min(4, num_teams) # Ensure we don't try to get more playoff teams than exist
    playoff_teams = sorted_teams_by_wins[:num_playoff_teams]
    playoff_team_win_totals = {t.name: t.wins for t in playoff_teams}

    return {
        'league_average_ppg': league_avg_ppg,
        'team_ppg_distribution': team_ppg_distribution,
        'league_average_yards_per_play': league_avg_ypp,
        'team_run_pass_rate_distribution': team_run_pass_rate_distribution,
        'sack_rate_per_dropback': sack_rate_per_dropback,
        'turnover_rate_per_game': turnover_rate_per_game,
        'qb_leaderboards': qb_leaderboards,
        'rb_leaderboards': rb_leaderboards,
        'win_distribution_histogram': win_distribution_histogram,
        'playoff_team_win_totals': playoff_team_win_totals,
    }

def evaluate_metrics(summary, num_teams, games_per_team):
    results = {}

    # 1. Team Points Per Game (PPG)
    ppg_avg = summary['league_average_ppg']
    ppg_dist = list(summary['team_ppg_distribution'].values())
    ppg_pass = 'FAIL'
    if REALISM_TARGETS['team_ppg']['avg'][0] <= ppg_avg <= REALISM_TARGETS['team_ppg']['avg'][1]:
        in_range_count = sum(1 for ppg in ppg_dist if REALISM_TARGETS['team_ppg']['range_pct'][0] <= ppg <= REALISM_TARGETS['team_ppg']['range_pct'][1])
        if in_range_count / len(ppg_dist) >= REALISM_TARGETS['team_ppg']['range_coverage']:
            ppg_pass = 'PASS'
        else:
            ppg_pass = 'WARN' # Avg is good, but distribution range is off
    results['team_ppg_eval'] = ppg_pass

    # 2. Yards Per Play (YPP)
    ypp_avg = summary['league_average_yards_per_play']
    ypp_pass = 'FAIL'
    if REALISM_TARGETS['yards_per_play']['avg'][0] <= ypp_avg <= REALISM_TARGETS['yards_per_play']['avg'][1]:
        ypp_pass = 'PASS'
    elif REALISM_TARGETS['yards_per_play']['range'][0] <= ypp_avg <= REALISM_TARGETS['yards_per_play']['range'][1]:
        ypp_pass = 'WARN'
    else:
        ypp_pass = 'FAIL'
    results['yards_per_play_eval'] = ypp_pass

    # 3. Run/Pass Rate Spread (simplified check for now)
    # This is harder to evaluate without team identities. For now, check league average.
    total_pass_plays = sum(t['pass_rate'] for t in summary['team_run_pass_rate_distribution'].values())
    total_run_plays = sum(t['run_rate'] for t in summary['team_run_pass_rate_distribution'].values())
    league_pass_rate = total_pass_plays / (total_pass_plays + total_run_plays) if (total_pass_plays + total_run_plays) > 0 else 0
    run_pass_pass = 'FAIL'
    if abs(league_pass_rate - REALISM_TARGETS['run_pass_rate']['avg_pass_pct']) < REALISM_TARGETS['run_pass_rate']['identity_shift']:
        run_pass_pass = 'PASS'
    else:
        run_pass_pass = 'WARN'
    results['run_pass_rate_eval'] = run_pass_pass

    # 4. Sack Rate (per game per team)
    # Convert sack_rate_per_dropback to sacks per game per team
    # Assuming ~60 plays per game, and 58% pass rate -> ~35 dropbacks per game
    avg_dropbacks_per_game = 60 * REALISM_TARGETS['run_pass_rate']['avg_pass_pct']
    sacks_per_game_per_team = summary['sack_rate_per_dropback'] * avg_dropbacks_per_game
    sack_rate_pass = 'FAIL'
    if REALISM_TARGETS['sack_rate_per_game']['range'][0] <= sacks_per_game_per_team <= REALISM_TARGETS['sack_rate_per_game']['range'][1]:
        sack_rate_pass = 'PASS'
    else:
        sack_rate_pass = 'WARN'
    results['sack_rate_eval'] = sack_rate_pass

    # 5. Turnover Rate (total per game)
    turnover_rate_pass = 'FAIL'
    if abs(summary['turnover_rate_per_game'] - REALISM_TARGETS['turnover_rate_per_game']['avg_total']) < 0.5: # Allow some deviation
        turnover_rate_pass = 'PASS'
    else:
        turnover_rate_pass = 'WARN'
    results['turnover_rate_eval'] = turnover_rate_pass

    # 6. QB Passing Yards / TD / INT distribution
    qb_eval = 'PASS'
    if not summary['qb_leaderboards']:
        qb_eval = 'FAIL'
    else:
        top_qb_yards = summary['qb_leaderboards'][0]['passing_yards'] if summary['qb_leaderboards'] else 0
        if top_qb_yards < REALISM_TARGETS['qb_passing_yards']['top5_min'] * (games_per_team/17): # Scale for games played
            qb_eval = 'WARN'
        # More detailed checks for median, bottom starter, TDs, INTs would go here
    results['qb_stats_eval'] = qb_eval

    # 7. RB Rushing Volume distribution
    rb_eval = 'PASS'
    if not summary['rb_leaderboards']:
        rb_eval = 'FAIL'
    else:
        top_rb_yards = summary['rb_leaderboards'][0]['rushing_yards'] if summary['rb_leaderboards'] else 0
        if top_rb_yards < REALISM_TARGETS['rb_yards']['top5_min'] * (games_per_team/17):
            rb_eval = 'WARN'
        # Check for 1000-yard rushers count
        thousand_yard_rushers = sum(1 for rb in summary['rb_leaderboards'] if rb['rushing_yards'] >= 1000)
        if not (REALISM_TARGETS['rb_yards']['1000_yard_count'][0] <= thousand_yard_rushers <= REALISM_TARGETS['rb_yards']['1000_yard_count'][1]):
            rb_eval = 'WARN'
    results['rb_stats_eval'] = rb_eval

    # 8. Win Distribution / Parity
    win_dist_eval = 'PASS'
    max_wins = max(summary['win_distribution_histogram'].keys()) if summary['win_distribution_histogram'] else 0
    min_wins = min(summary['win_distribution_histogram'].keys()) if summary['win_distribution_histogram'] else 0

    if max_wins > REALISM_TARGETS['win_distribution']['top_max'] * (games_per_team/17) or min_wins < REALISM_TARGETS['win_distribution']['bottom_min'] * (games_per_team/17):
        win_dist_eval = 'WARN'
    # More complex check for mid-range coverage needed
    results['win_distribution_eval'] = win_dist_eval

    # 9. Playoff Team Quality bands
    playoff_eval = 'PASS'
    if summary['playoff_team_win_totals']:
        min_playoff_wins = min(summary['playoff_team_win_totals'].values())
        if min_playoff_wins < REALISM_TARGETS['playoff_win_floor']['wildcard_min'][0] * (games_per_team/17):
            playoff_eval = 'WARN'
    results['playoff_quality_eval'] = playoff_eval

    # 10. Season Stat-Leader Plausibility
    leader_plausibility_eval = 'PASS'
    if summary['qb_leaderboards'] and summary['qb_leaderboards'][0]['passing_yards'] > REALISM_TARGETS['stat_leader_plausibility']['pass_yards_ceiling'] * (games_per_team/17):
        leader_plausibility_eval = 'WARN' # Too high for a typical season
    if summary['rb_leaderboards'] and summary['rb_leaderboards'][0]['rushing_yards'] > REALISM_TARGETS['stat_leader_plausibility']['rush_yards_generational'] * (games_per_team/17):
        leader_plausibility_eval = 'WARN' # Too high for a typical season
    results['stat_leader_plausibility_eval'] = leader_plausibility_eval

    return results

def detect_red_flags(summary, teams_data, games_per_team):
    flags = []
    num_teams = len(teams_data)

    # 1. "Flat" Win Totals
    win_counts = list(summary['win_distribution_histogram'].keys())
    if len(win_counts) < num_teams / 2: # Arbitrary threshold for lack of variance
        flags.append("Red Flag: 'Flat' Win Totals - Insufficient variance in team wins.")

    # 2. Zero 1,000-yard Rushers
    thousand_yard_rushers = sum(1 for rb in summary["rb_leaderboards"] if rb["rushing_yards"] >= 1000)
    if thousand_yard_rushers == 0:
        flags.append("Red Flag: Zero 1,000-yard Rushers - Indicates broken volume or YPC.")

    # 3. Sack/INT "Clumping"
    # This is hard to detect without individual player ratings and more detailed game logs.
    # For a simplified check, we can look at the variance of INTs among QBs.
    qb_ints = [qb["interceptions"] for qb in summary["qb_leaderboards"] if qb["interceptions"] > 0]
    if len(qb_ints) > 2 and max(qb_ints) - min(qb_ints) < 5: # If range is too small for multiple QBs
        flags.append("Red Flag: Sack/INT 'Clumping' - QBs have very similar interception totals.")

    # 4. Identity Inversion
    for team_name, rates in summary["team_run_pass_rate_distribution"].items():
        team_obj = next((t for t in teams_data if t.name == team_name), None)
        if team_obj:
            # If a team with low run_pass_tendency (more run-heavy) has a high pass_rate
            if team_obj.run_pass_tendency < 0.45 and rates["pass_rate"] > 0.60: # Example thresholds
                flags.append(f"Red Flag: Identity Inversion for {team_name} - Run-heavy team has high pass rate.")
            # If a team with high run_pass_tendency (more pass-heavy) has a low pass_rate
            elif team_obj.run_pass_tendency > 0.55 and rates["pass_rate"] < 0.40:
                flags.append(f"Red Flag: Identity Inversion for {team_name} - Pass-heavy team has low pass rate.")

    # 5. Unrealistic Scoring Floor (This needs game-level data, which we don't store in summary)
    # For now, we can check if the minimum PPG for any team is too high.
    min_ppg = min(summary["team_ppg_distribution"].values()) if summary["team_ppg_distribution"] else 0
    if min_ppg > 15: # If even the worst team scores too much on average (adjusted threshold for test)
        flags.append("Red Flag: Unrealistic Scoring Floor - Even lowest scoring teams average too many points.")

    return flags


if __name__ == '__main__':
    num_seasons_to_simulate = 3
    initial_seed = 42
    num_teams_in_league = 8 # For a simplified league
    games_per_team_in_season = 14 # Each team plays every other team twice (7 opponents * 2 games)

    all_results = []
    for i in range(num_seasons_to_simulate):
        season_seed = initial_seed + i
        print(f"Simulating Season {i+1} with seed {season_seed}...")

        # Define teams and players for this season
        teams = []
        players = []
        team_names = [f'Team {chr(65 + j)}' for j in range(num_teams_in_league)]
        for name in team_names:
            off_rating = random.randint(70, 99)
            def_rating = random.randint(70, 99)
            run_pass_tendency = random.uniform(0.35, 0.65)
            team = Team(name, off_rating, def_rating, run_pass_tendency)
            teams.append(team)
            players.append(Player(f'QB {name}', 'QB', team))
            players.append(Player(f'RB {name}', 'RB', team))

        simulate_season(season_seed, teams, players, games_per_team_in_season)
        season_summary = calculate_metrics(teams, players, num_teams_in_league, games_per_team_in_season)
        season_summary['season_number'] = i + 1

        evaluation = evaluate_metrics(season_summary, num_teams_in_league, games_per_team_in_season)
        red_flags = detect_red_flags(season_summary, teams, games_per_team_in_season)

        all_results.append({
            'season_summary': season_summary,
            'evaluation': evaluation,
            'red_flags': red_flags
        })

    with open('calibration_results.json', 'w') as f:
        json.dump(all_results, f, indent=4)
    print(f"Calibration results saved to calibration_results.json")
