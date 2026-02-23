import { StatType, RosterComparisonResult } from "./types";
import { CANDIDATE_PLAYERS, LEBRON } from "./players";

/** Full team names keyed by abbreviation */
const TEAM_NAMES: Record<string, string> = {
  ATL: "Atlanta Hawks", BOS: "Boston Celtics", BKN: "Brooklyn Nets",
  CHA: "Charlotte Hornets", CHI: "Chicago Bulls", CIN: "Cincinnati Royals",
  CLE: "Cleveland Cavaliers", DAL: "Dallas Mavericks", DEN: "Denver Nuggets",
  DET: "Detroit Pistons", GSW: "Golden State Warriors", HOU: "Houston Rockets",
  IND: "Indiana Pacers", LAC: "LA Clippers", LAL: "Los Angeles Lakers",
  MEM: "Memphis Grizzlies", MIA: "Miami Heat", MIL: "Milwaukee Bucks",
  MIN: "Minnesota Timberwolves", NOP: "New Orleans Pelicans", NYK: "New York Knicks",
  OKC: "Oklahoma City Thunder", ORL: "Orlando Magic", PHI: "Philadelphia 76ers",
  PHX: "Phoenix Suns", POR: "Portland Trail Blazers", SAC: "Sacramento Kings",
  SAS: "San Antonio Spurs", SEA: "Seattle SuperSonics", TOR: "Toronto Raptors",
  UTA: "Utah Jazz", WAS: "Washington Wizards",
};

/**
 * Compare LeBron's career stat to every team's combined roster total.
 * Returns results sorted by closest match first.
 */
export function compareToAllTeams(statType: StatType): RosterComparisonResult[] {
  const lebronTotal = LEBRON.stats[statType];

  // Group candidates by team
  const teamMap = new Map<string, typeof CANDIDATE_PLAYERS>();
  for (const player of CANDIDATE_PLAYERS) {
    const existing = teamMap.get(player.team) ?? [];
    existing.push(player);
    teamMap.set(player.team, existing);
  }

  const results: RosterComparisonResult[] = [];

  for (const [team, players] of teamMap) {
    const combinedTotal = players.reduce((sum, p) => sum + p.stats[statType], 0);
    const difference = combinedTotal - lebronTotal;
    const percentOff = lebronTotal > 0 ? Math.abs((difference / lebronTotal) * 100) : 0;

    results.push({
      team,
      teamName: TEAM_NAMES[team] ?? team,
      players: players.sort((a, b) => b.stats[statType] - a.stats[statType]),
      combinedTotal,
      lebronTotal,
      difference,
      percentOff,
    });
  }

  // Sort by closest match
  return results.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference));
}

/**
 * Compare LeBron to a specific team's roster.
 */
export function compareToTeam(team: string, statType: StatType): RosterComparisonResult | null {
  const results = compareToAllTeams(statType);
  return results.find((r) => r.team === team) ?? null;
}
