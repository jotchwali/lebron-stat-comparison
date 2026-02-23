import { NextRequest, NextResponse } from "next/server";
import { compareToAllTeams, compareToTeam } from "@/lib/roster";
import { StatType } from "@/lib/types";

const VALID_STATS: StatType[] = ["points", "rebounds", "assists", "games", "minutes"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const statType: StatType = VALID_STATS.includes(body.statType) ? body.statType : "points";
    const team: string | undefined = body.team;

    if (team) {
      const result = compareToTeam(team, statType);
      if (!result) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }
      return NextResponse.json({ statType, result });
    }

    // Return all teams sorted by closest match
    const results = compareToAllTeams(statType);
    return NextResponse.json({ statType, results });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
