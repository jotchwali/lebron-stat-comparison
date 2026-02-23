import { Player, StatType, Filters, CombinationResult } from "./types";
import { CANDIDATE_PLAYERS } from "./players";

/**
 * Find a group of 2-6 players whose combined stat approximates `target`.
 *
 * Algorithm: Randomized greedy with retry.
 *   1. Shuffle the filtered candidate pool.
 *   2. Greedily pick the player whose stat value gets closest to the remaining
 *      target without overshooting by more than tolerance.
 *   3. Stop when within tolerance or when we hit 6 players.
 *   4. If the result isn't within tolerance, retry up to `maxAttempts` times
 *      (each with a fresh shuffle) and return the best attempt.
 *
 * Why greedy instead of knapsack/subset-sum:
 *   - The candidate pool is ~130 players; brute-forcing all 2-6 combos is
 *     O(n^6) which is way too slow.
 *   - Greedy with randomization gives good-enough results instantly and
 *     produces different outputs each call — more fun for the user.
 */
export function findPlayerCombination(
  target: number,
  statType: StatType,
  filters: Filters,
  maxPlayers = 6,
  tolerancePct = 0.03, // ±3%
  maxAttempts = 50
): CombinationResult {
  const pool = applyFilters(CANDIDATE_PLAYERS, statType, filters);

  if (pool.length === 0) {
    return { players: [], combinedTotal: 0, target, difference: target, percentOff: 100 };
  }

  let bestResult: CombinationResult | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = shuffleArray(pool);
    const result = greedyPick(shuffled, target, statType, maxPlayers, tolerancePct);

    if (!bestResult || Math.abs(result.difference) < Math.abs(bestResult.difference)) {
      bestResult = result;
    }

    // Good enough — stop early
    if (bestResult.percentOff <= tolerancePct * 100) {
      break;
    }
  }

  return bestResult!;
}

function greedyPick(
  candidates: Player[],
  target: number,
  statType: StatType,
  maxPlayers: number,
  tolerancePct: number
): CombinationResult {
  const selected: Player[] = [];
  let remaining = target;
  const used = new Set<string>();

  while (selected.length < maxPlayers && remaining > 0) {
    let bestCandidate: Player | null = null;
    let bestDistance = Infinity;

    for (const player of candidates) {
      if (used.has(player.id)) continue;
      const val = player.stats[statType];
      if (val <= 0) continue;

      const distance = Math.abs(remaining - val);

      // Prefer players that don't overshoot by too much
      if (val > remaining * 1.3) continue;

      if (distance < bestDistance) {
        bestDistance = distance;
        bestCandidate = player;
      }
    }

    if (!bestCandidate) break;

    selected.push(bestCandidate);
    used.add(bestCandidate.id);
    remaining -= bestCandidate.stats[statType];

    // If we're within tolerance, stop
    if (Math.abs(remaining) <= target * tolerancePct) break;
  }

  // If still over/under, try swapping the last pick for a closer match
  if (selected.length >= 2 && Math.abs(remaining) > target * tolerancePct) {
    const withoutLast = selected.slice(0, -1);
    const totalWithoutLast = withoutLast.reduce((s, p) => s + p.stats[statType], 0);
    const needed = target - totalWithoutLast;

    let bestSwap: Player | null = null;
    let bestSwapDist = Math.abs(remaining);

    for (const player of candidates) {
      if (used.has(player.id) && player.id !== selected[selected.length - 1].id) continue;
      if (player.id === selected[selected.length - 1].id) continue;
      const val = player.stats[statType];
      const dist = Math.abs(needed - val);
      if (dist < bestSwapDist) {
        bestSwapDist = dist;
        bestSwap = player;
      }
    }

    if (bestSwap) {
      selected[selected.length - 1] = bestSwap;
    }
  }

  const combinedTotal = selected.reduce((s, p) => s + p.stats[statType], 0);
  const difference = combinedTotal - target;
  const percentOff = target > 0 ? Math.abs((difference / target) * 100) : 0;

  return { players: selected, combinedTotal, target, difference, percentOff };
}

function applyFilters(players: Player[], statType: StatType, filters: Filters): Player[] {
  return players.filter((p) => {
    if (filters.minStat > 0 && p.stats[statType] < filters.minStat) return false;
    if (filters.team && p.team !== filters.team) return false;
    if (filters.activeOnly && !p.active) return false;
    if (filters.minGames > 0 && p.stats.games < filters.minGames) return false;
    if (filters.minMinutes > 0 && p.stats.minutes < filters.minMinutes) return false;
    return true;
  });
}

/** Fisher-Yates shuffle (returns new array) */
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
