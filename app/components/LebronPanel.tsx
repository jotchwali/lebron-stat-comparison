"use client";

import { LEBRON } from "@/lib/players";
import { StatType, STAT_LABELS } from "@/lib/types";

interface LebronPanelProps {
  selectedStat: StatType;
  onStatChange: (stat: StatType) => void;
}

export default function LebronPanel({ selectedStat, onStatChange }: LebronPanelProps) {
  const statValue = LEBRON.stats[selectedStat];

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 shadow-sm dark:border-amber-900 dark:from-amber-950/30 dark:to-yellow-950/20">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-xl font-bold text-white">
          23
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">LeBron James</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Los Angeles Lakers</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Select Stat
        </label>
        <select
          value={selectedStat}
          onChange={(e) => onStatChange(e.target.value as StatType)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {(Object.entries(STAT_LABELS) as [StatType, string][]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl bg-white/60 p-4 dark:bg-black/20">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Career {STAT_LABELS[selectedStat]}
        </p>
        <p className="text-4xl font-black tabular-nums text-amber-600 dark:text-amber-400">
          {statValue.toLocaleString()}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(Object.entries(STAT_LABELS) as [StatType, string][])
          .filter(([key]) => key !== selectedStat)
          .map(([key, label]) => (
            <div key={key} className="rounded-lg bg-white/40 px-3 py-2 dark:bg-black/10">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
              <p className="text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                {LEBRON.stats[key].toLocaleString()}
              </p>
            </div>
          ))}
      </div>

      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
        {LEBRON.stats.games.toLocaleString()} games played &middot; Career totals as of 2024-25
      </p>
    </div>
  );
}
