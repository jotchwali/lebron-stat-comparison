"use client";

import { useState } from "react";
import { RosterComparisonResult, StatType, STAT_LABELS } from "@/lib/types";

interface RosterPanelProps {
  statType: StatType;
}

export default function RosterPanel({ statType }: RosterPanelProps) {
  const [results, setResults] = useState<RosterComparisonResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchRosters = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statType }),
      });
      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      console.error("Failed to fetch roster comparisons:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 shadow-sm dark:border-purple-900 dark:from-purple-950/30 dark:to-fuchsia-950/20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            LeBron vs Full Rosters
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Which team&apos;s combined {STAT_LABELS[statType].toLowerCase()} match LeBron&apos;s career?
          </p>
        </div>
        <button
          onClick={fetchRosters}
          disabled={loading}
          className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Compare All Teams"}
        </button>
      </div>

      {!results && !loading && (
        <div className="flex h-32 items-center justify-center rounded-xl bg-white/40 dark:bg-black/10">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Click &quot;Compare All Teams&quot; to see how LeBron stacks up against entire rosters
          </p>
        </div>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center rounded-xl bg-white/40 dark:bg-black/10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      )}

      {results && !loading && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {results.map((r) => (
            <div key={r.team} className="rounded-lg bg-white/50 dark:bg-black/10">
              <button
                onClick={() => setExpanded(expanded === r.team ? null : r.team)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/30 dark:hover:bg-black/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 w-10">
                    {r.team}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {r.teamName}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {r.players.length} players in dataset
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums text-purple-600 dark:text-purple-400">
                    {r.combinedTotal.toLocaleString()}
                  </p>
                  <p
                    className={`text-xs tabular-nums ${
                      Math.abs(r.percentOff) <= 10
                        ? "text-green-600 dark:text-green-400"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {r.difference >= 0 ? "+" : ""}
                    {r.difference.toLocaleString()} ({r.percentOff.toFixed(1)}%)
                  </p>
                </div>
              </button>

              {expanded === r.team && (
                <div className="border-t border-purple-100 px-4 py-3 dark:border-purple-900/50">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>LeBron&apos;s {STAT_LABELS[statType]}</span>
                    <span className="font-bold text-amber-500">
                      {r.lebronTotal.toLocaleString()}
                    </span>
                  </div>
                  {/* Stacked progress bar */}
                  <div className="mb-3 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (r.combinedTotal / r.lebronTotal) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    {r.players.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-700 dark:text-zinc-300">{p.name}</span>
                        <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                          {p.stats[statType].toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
