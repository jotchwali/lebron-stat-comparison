"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  StatType,
  Filters,
  CombinationResult,
  DEFAULT_FILTERS,
  AppMode,
  STAT_LABELS,
} from "@/lib/types";
import LebronPanel from "./components/LebronPanel";
import MatchPanel from "./components/MatchPanel";
import ComparisonChart from "./components/ComparisonChart";
import FiltersPanel from "./components/FiltersPanel";
import RosterPanel from "./components/RosterPanel";
import SeasonBreakdown from "./components/SeasonBreakdown";

const MODE_TABS: { key: AppMode; label: string; description: string }[] = [
  { key: "combination", label: "Player Combo", description: "Find players that add up to LeBron" },
  { key: "roster", label: "vs Full Roster", description: "Compare LeBron to entire team rosters" },
  { key: "seasons", label: "Season Breakdown", description: "LeBron's year-by-year stats" },
];

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const initialStat = (searchParams.get("stat") as StatType) || "points";
  const initialMode = (searchParams.get("mode") as AppMode) || "combination";

  const [statType, setStatType] = useState<StatType>(
    ["points", "rebounds", "assists", "games", "minutes"].includes(initialStat)
      ? initialStat
      : "points"
  );
  const [mode, setMode] = useState<AppMode>(
    ["combination", "roster", "seasons"].includes(initialMode) ? initialMode : "combination"
  );
  const [result, setResult] = useState<CombinationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [shareTooltip, setShareTooltip] = useState(false);
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hydrate combination from URL player IDs
  const initialPlayerIds = searchParams.get("players");
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current || !initialPlayerIds) return;
    hasHydrated.current = true;
    // Auto-generate to hydrate the result
    const hydrate = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/combination", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statType: initialStat, filters: DEFAULT_FILTERS }),
        });
        const data = await res.json();
        setResult(data.result);
        setAnimationKey((k) => k + 1);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [initialPlayerIds, initialStat]);

  // Update URL when state changes (without full page reload)
  const updateURL = useCallback(
    (newStat: StatType, newMode: AppMode, newResult: CombinationResult | null) => {
      const params = new URLSearchParams();
      params.set("stat", newStat);
      params.set("mode", newMode);
      if (newResult && newResult.players.length > 0) {
        params.set("players", newResult.players.map((p) => p.id).join(","));
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/combination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statType, filters }),
      });
      const data = await res.json();
      setResult(data.result);
      setAnimationKey((k) => k + 1);
      updateURL(statType, mode, data.result);
    } catch (err) {
      console.error("Failed to generate combination:", err);
    } finally {
      setLoading(false);
    }
  }, [statType, filters, mode, updateURL]);

  const handleStatChange = (stat: StatType) => {
    setStatType(stat);
    setResult(null);
    updateURL(stat, mode, null);
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    updateURL(statType, newMode, result);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareTooltip(true);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setShareTooltip(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setShareTooltip(true);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setShareTooltip(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              LeBron Stat Comparison
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Which players combined equal the King?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={handleShare}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Share Link
              </button>
              {shareTooltip && (
                <div className="absolute right-0 top-full mt-1 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg dark:bg-zinc-700">
                  Copied to clipboard!
                </div>
              )}
            </div>
            <span className="text-right text-xs text-zinc-400 dark:text-zinc-500">
              Career totals &middot; 2024-25
            </span>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-1 border-t border-zinc-100 pt-2 pb-0 dark:border-zinc-800">
            {MODE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleModeChange(tab.key)}
                className={`rounded-t-lg px-4 py-2 text-xs font-medium transition-colors ${
                  mode === tab.key
                    ? "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Combination mode */}
        {mode === "combination" && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <LebronPanel selectedStat={statType} onStatChange={handleStatChange} />
              <MatchPanel
                result={result}
                statType={statType}
                loading={loading}
                onGenerate={generate}
                onToggleFilters={() => setShowFilters((p) => !p)}
              />
            </div>

            <div className="mt-6">
              <FiltersPanel
                filters={filters}
                onChange={setFilters}
                visible={showFilters}
                onClose={() => setShowFilters(false)}
              />
            </div>

            <div className="mt-6">
              <ComparisonChart
                result={result}
                statType={statType}
                animationKey={animationKey}
              />
            </div>

            {/* Fun equation display */}
            {result && result.players.length > 0 && (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  The equation
                </p>
                <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                  <span className="text-amber-500">LeBron James</span>
                  {" = "}
                  {result.players.map((p, i) => (
                    <span key={p.id + i}>
                      {i > 0 && <span className="text-zinc-400"> + </span>}
                      <span className="text-blue-500">{p.name}</span>
                    </span>
                  ))}
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {STAT_LABELS[statType]}: Combined difference{" "}
                  {result.difference >= 0 ? "+" : ""}
                  {result.difference.toLocaleString()} ({result.percentOff.toFixed(1)}% off)
                </p>
              </div>
            )}
          </>
        )}

        {/* Roster mode */}
        {mode === "roster" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <LebronPanel selectedStat={statType} onStatChange={handleStatChange} />
            <RosterPanel statType={statType} />
          </div>
        )}

        {/* Seasons mode */}
        {mode === "seasons" && (
          <div className="space-y-6">
            <LebronPanel selectedStat={statType} onStatChange={handleStatChange} />
            <SeasonBreakdown statType={statType} />
          </div>
        )}
      </main>
    </div>
  );
}
