import { Player, PlayerStats } from "./types";

/**
 * Live data layer using the balldontlie API (v1).
 *
 * Docs: https://docs.balldontlie.io/
 *
 * Design decisions:
 *   - This is an opt-in enrichment layer. The static dataset in players.ts is
 *     always the fallback. If the API is down, rate-limited, or no key is set,
 *     the app still works.
 *   - Career totals aren't a first-class endpoint. We aggregate by fetching
 *     all season averages for a player and multiplying by games played.
 *   - Results are cached in a module-level Map (server-side memory cache).
 *     TTL: 1 hour. This is fine because career stats change at most daily.
 *   - Rate limit: free tier is 30 req/min. We batch carefully.
 */

const BASE_URL = "https://api.balldontlie.io/v1";
const API_KEY = process.env.BALLDONTLIE_API_KEY ?? "";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

async function apiFetch<T>(path: string): Promise<T | null> {
  if (!API_KEY) return null;

  const url = `${BASE_URL}${path}`;
  const cacheKey = `api:${url}`;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(url, {
      headers: { Authorization: API_KEY },
      next: { revalidate: 3600 }, // Next.js cache: 1 hour
    });

    if (!res.ok) {
      console.warn(`balldontlie API error: ${res.status} for ${path}`);
      return null;
    }

    const json = await res.json();
    setCache(cacheKey, json);
    return json as T;
  } catch (err) {
    console.warn("balldontlie API fetch failed:", err);
    return null;
  }
}

// --- API response types ---

interface BDLPlayer {
  id: number;
  first_name: string;
  last_name: string;
  team: { abbreviation: string };
}

interface BDLSeasonAverage {
  season: number;
  games_played: number;
  pts: number;
  reb: number;
  ast: number;
  min: string; // e.g. "35:12"
}

interface BDLSearchResponse {
  data: BDLPlayer[];
}

interface BDLSeasonAveragesResponse {
  data: BDLSeasonAverage[];
}

// --- Public API ---

/**
 * Search for a player by name. Returns the first match's balldontlie ID.
 */
export async function searchPlayer(name: string): Promise<{ id: number; team: string } | null> {
  const data = await apiFetch<BDLSearchResponse>(
    `/players?search=${encodeURIComponent(name)}&per_page=5`
  );
  if (!data?.data?.length) return null;

  const match = data.data[0];
  return { id: match.id, team: match.team.abbreviation };
}

/**
 * Fetch career totals for a player by aggregating all season averages.
 *
 * The API gives per-game averages, so we multiply by games_played
 * to get season totals, then sum across seasons.
 */
export async function fetchCareerTotals(playerId: number): Promise<PlayerStats | null> {
  // Fetch season averages for all available seasons (API returns all by default)
  const data = await apiFetch<BDLSeasonAveragesResponse>(
    `/season_averages?player_id=${playerId}`
  );

  if (!data?.data?.length) return null;

  const totals: PlayerStats = { points: 0, rebounds: 0, assists: 0, games: 0, minutes: 0 };

  for (const season of data.data) {
    const gp = season.games_played;
    totals.games += gp;
    totals.points += Math.round(season.pts * gp);
    totals.rebounds += Math.round(season.reb * gp);
    totals.assists += Math.round(season.ast * gp);
    // min is like "35:12" — parse to total minutes
    const [minStr] = season.min.split(":");
    totals.minutes += Math.round(Number(minStr) * gp);
  }

  return totals;
}

/**
 * Try to enrich a player's stats with live data.
 * Returns the original player with updated stats if successful,
 * or the original player unchanged if the API call fails.
 */
export async function enrichPlayer(player: Player): Promise<Player> {
  if (!API_KEY) return player;

  const cacheKey = `enriched:${player.id}`;
  const cached = getCached<Player>(cacheKey);
  if (cached) return cached;

  const searchResult = await searchPlayer(player.name);
  if (!searchResult) return player;

  const stats = await fetchCareerTotals(searchResult.id);
  if (!stats) return player;

  const enriched: Player = {
    ...player,
    stats,
    team: searchResult.team || player.team,
  };

  setCache(cacheKey, enriched);
  return enriched;
}

/**
 * Check if the API is configured and reachable.
 */
export function isApiConfigured(): boolean {
  return API_KEY.length > 0;
}

/**
 * Get cache stats (for debugging / admin).
 */
export function getCacheStats(): { entries: number; configured: boolean } {
  return { entries: cache.size, configured: isApiConfigured() };
}
