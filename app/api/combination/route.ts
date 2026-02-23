import { NextRequest, NextResponse } from "next/server";
import { findPlayerCombination } from "@/lib/combination";
import { LEBRON } from "@/lib/players";
import { StatType, Filters, DEFAULT_FILTERS } from "@/lib/types";
import { isApiConfigured, enrichPlayer } from "@/lib/api";

const VALID_STATS: StatType[] = ["points", "rebounds", "assists", "games", "minutes"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const statType = VALID_STATS.includes(body.statType) ? body.statType : "points";

    const filters: Filters = {
      ...DEFAULT_FILTERS,
      ...(body.filters ?? {}),
    };

    const target = LEBRON.stats[statType as StatType];
    const result = findPlayerCombination(target, statType as StatType, filters);

    // If live API is configured, try to enrich result players with fresh stats
    if (isApiConfigured() && result.players.length > 0) {
      const enriched = await Promise.allSettled(
        result.players.map((p) => enrichPlayer(p))
      );
      result.players = enriched.map((r, i) =>
        r.status === "fulfilled" ? r.value : result.players[i]
      );

      // Recalculate totals after enrichment
      result.combinedTotal = result.players.reduce(
        (sum, p) => sum + p.stats[statType as StatType],
        0
      );
      result.difference = result.combinedTotal - target;
      result.percentOff =
        target > 0 ? Math.abs((result.difference / target) * 100) : 0;
    }

    return NextResponse.json({
      statType,
      lebronTotal: target,
      result,
      dataSource: isApiConfigured() ? "live" : "static",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
