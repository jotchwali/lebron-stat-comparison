"use client";

import { CombinationResult, StatType, STAT_LABELS } from "@/lib/types";

interface MatchPanelProps {
  result: CombinationResult | null;
  statType: StatType;
  loading: boolean;
  onGenerate: () => void;
  onToggleFilters: () => void;
}

export default function MatchPanel({
  result,
  statType,
  loading,
  onGenerate,
  onToggleFilters,
}: MatchPanelProps) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/20">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Combined Match
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Filters
          </button>
          <button
            onClick={onGenerate}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? "Generating..." : "Generate New"}
          </button>
        </div>
      </div>

      {!result && !loading && (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white/40 dark:bg-black/10">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Click &quot;Generate New&quot; to find a player combination
          </p>
        </div>
      )}

      {loading && (
        <div className="flex h-48 items-center justify-center rounded-xl bg-white/40 dark:bg-black/10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}

      {result && !loading && (
        <>
          {/* Summary equation */}
          <div className="mb-4 rounded-xl bg-white/60 p-4 dark:bg-black/20">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              LeBron&apos;s {STAT_LABELS[statType]} =
            </p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {result.players.map((p) => p.name).join(" + ")}
            </p>
          </div>

          {/* Player list */}
          <div className="mb-4 space-y-2">
            {result.players.map((player, i) => (
              <div
                key={player.id + i}
                className="flex items-center justify-between rounded-lg bg-white/50 px-4 py-3 dark:bg-black/10"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {player.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {player.team} &middot; {player.active ? "Active" : "Retired"}
                  </p>
                </div>
                <p className="text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {player.stats[statType].toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/60 p-3 dark:bg-black/20">
            <div className="text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Combined</p>
              <p className="text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
                {result.combinedTotal.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Target</p>
              <p className="text-lg font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
                {result.target.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Difference</p>
              <p
                className={`text-lg font-bold tabular-nums ${
                  Math.abs(result.percentOff) <= 3
                    ? "text-green-600 dark:text-green-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {result.difference >= 0 ? "+" : ""}
                {result.difference.toLocaleString()}{" "}
                <span className="text-xs font-normal">({result.percentOff.toFixed(1)}%)</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
