import { NextResponse } from "next/server";
import { getCacheStats } from "@/lib/api";
import { CANDIDATE_PLAYERS } from "@/lib/players";

export async function GET() {
  const apiStats = getCacheStats();

  return NextResponse.json({
    status: "ok",
    playerCount: CANDIDATE_PLAYERS.length,
    api: {
      configured: apiStats.configured,
      cacheEntries: apiStats.entries,
    },
    dataSource: apiStats.configured ? "live + static fallback" : "static",
  });
}
