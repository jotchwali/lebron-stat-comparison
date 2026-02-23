"use client";

import { Filters } from "@/lib/types";
import { ALL_TEAMS } from "@/lib/players";

interface FiltersPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  visible: boolean;
  onClose: () => void;
}

export default function FiltersPanel({ filters, onChange, visible, onClose }: FiltersPanelProps) {
  if (!visible) return null;

  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Player Pool Filters
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Minimum stat value */}
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
            Min Stat Value
          </label>
          <input
            type="number"
            min={0}
            value={filters.minStat}
            onChange={(e) => update({ minStat: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Team */}
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">Team</label>
          <select
            value={filters.team}
            onChange={(e) => update({ team: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="">All Teams</option>
            {ALL_TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Active only */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={filters.activeOnly}
              onChange={(e) => update({ activeOnly: e.target.checked })}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
            />
            Active Only
          </label>
        </div>

        {/* Min games */}
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
            Min Games
          </label>
          <input
            type="number"
            min={0}
            value={filters.minGames}
            onChange={(e) => update({ minGames: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        {/* Min minutes */}
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
            Min Minutes
          </label>
          <input
            type="number"
            min={0}
            value={filters.minMinutes}
            onChange={(e) => update({ minMinutes: Number(e.target.value) || 0 })}
            className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm tabular-nums text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>
    </div>
  );
}
