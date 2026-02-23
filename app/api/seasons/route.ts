import { NextResponse } from "next/server";
import { LEBRON_SEASONS } from "@/lib/seasons";

export async function GET() {
  return NextResponse.json({ seasons: LEBRON_SEASONS });
}
