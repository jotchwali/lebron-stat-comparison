export type StatType = "points" | "rebounds" | "assists" | "games" | "minutes";

export interface Player {
  id: string;
  name: string;
  team: string; // Last/primary team
  active: boolean;
  stats: PlayerStats;
}

export interface PlayerStats {
  points: number;
  rebounds: number;
  assists: number;
  games: number;
  minutes: number;
}

export interface Filters {
  minStat: number; // Minimum value for the selected stat type
  team: string; // Empty string = all teams
  activeOnly: boolean;
  minGames: number;
  minMinutes: number;
}

export interface CombinationResult {
  players: Player[];
  combinedTotal: number;
  target: number;
  difference: number;
  percentOff: number;
}

export const DEFAULT_FILTERS: Filters = {
  minStat: 0,
  team: "",
  activeOnly: false,
  minGames: 0,
  minMinutes: 0,
};

export interface RosterComparisonResult {
  team: string;
  teamName: string;
  players: Player[];
  combinedTotal: number;
  lebronTotal: number;
  difference: number;
  percentOff: number;
}

export interface LebronSeason {
  season: string;
  team: string;
  games: number;
  points: number;
  rebounds: number;
  assists: number;
  minutes: number;
}

export type AppMode = "combination" | "roster" | "seasons";

export const STAT_LABELS: Record<StatType, string> = {
  points: "Points",
  rebounds: "Rebounds",
  assists: "Assists",
  games: "Games Played",
  minutes: "Minutes",
};
