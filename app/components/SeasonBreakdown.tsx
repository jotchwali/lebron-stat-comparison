"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { LebronSeason, StatType, STAT_LABELS } from "@/lib/types";

interface SeasonBreakdownProps {
  statType: StatType;
}

export default function SeasonBreakdown({ statType }: SeasonBreakdownProps) {
  const [seasons, setSeasons] = useState<LebronSeason[] | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeasons = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/seasons");
        const data = await res.json();
        setSeasons(data.seasons);
      } catch (err) {
        console.error("Failed to fetch seasons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasons();
  }, []);

  if (loading || !seasons) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const data = seasons.map((s) => ({
    season: s.season.split("-")[0] + "-" + s.season.split("-")[1].slice(-2),
    shortSeason: "'" + s.season.split("-")[0].slice(-2),
    value: s[statType],
    team: s.team,
    games: s.games,
  }));

  const totalCareer = seasons.reduce((sum, s) => sum + s[statType], 0);
  const peakSeason = seasons.reduce((best, s) => (s[statType] > best[statType] ? s : best));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            LeBron&apos;s Season-by-Season {STAT_LABELS[statType]}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {seasons.length} seasons &middot; Career total:{" "}
            <span className="font-semibold text-amber-500">{totalCareer.toLocaleString()}</span>
            {" "}&middot; Peak: {peakSeason.season} ({peakSeason[statType].toLocaleString()})
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
          <button
            onClick={() => setChartType("bar")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              chartType === "bar"
                ? "bg-amber-500 text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              chartType === "line"
                ? "bg-amber-500 text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
            }`}
          >
            Line
          </button>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} />
              <XAxis
                dataKey="shortSeason"
                tick={{ fontSize: 10, fill: "#a1a1aa" }}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#a1a1aa" }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 shadow-lg">
                      <p className="font-semibold">{d.season}</p>
                      <p className="text-amber-400">
                        {Number(d.value).toLocaleString()} {STAT_LABELS[statType].toLowerCase()}
                      </p>
                      <p className="text-zinc-400">
                        {d.team} &middot; {d.games} games
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                fill="#f59e0b"
                animationDuration={800}
                animationBegin={0}
              />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.2} />
              <XAxis
                dataKey="shortSeason"
                tick={{ fontSize: 10, fill: "#a1a1aa" }}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#a1a1aa" }}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
                width={40}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 shadow-lg">
                      <p className="font-semibold">{d.season}</p>
                      <p className="text-amber-400">
                        {Number(d.value).toLocaleString()} {STAT_LABELS[statType].toLowerCase()}
                      </p>
                      <p className="text-zinc-400">
                        {d.team} &middot; {d.games} games
                      </p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={800}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Team timeline */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from(new Set(seasons.map((s) => s.team))).map((team) => {
          const teamSeasons = seasons.filter((s) => s.team === team);
          const first = teamSeasons[0].season.split("-")[0];
          const last = teamSeasons[teamSeasons.length - 1].season.split("-")[0];
          return (
            <span
              key={team + first}
              className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            >
              {team} ({first}-{last})
            </span>
          );
        })}
      </div>
    </div>
  );
}
