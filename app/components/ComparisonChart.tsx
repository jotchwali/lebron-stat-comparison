"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { CombinationResult, StatType, STAT_LABELS } from "@/lib/types";

interface ComparisonChartProps {
  result: CombinationResult | null;
  statType: StatType;
  /** Change this key to force re-mount and replay animation */
  animationKey?: number;
}

export default function ComparisonChart({ result, statType, animationKey }: ComparisonChartProps) {
  if (!result || result.players.length === 0) {
    return null;
  }

  const data = [
    {
      name: "LeBron James",
      value: result.target,
      fill: "#f59e0b",
    },
    ...result.players.map((p) => ({
      name: p.name.split(" ").pop() || p.name,
      value: p.stats[statType],
      fill: "#3b82f6",
    })),
  ];

  const COLORS = ["#f59e0b", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444"];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Career {STAT_LABELS[statType]} Comparison
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" key={animationKey}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40, top: 5, bottom: 5 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [Number(value).toLocaleString(), STAT_LABELS[statType]]}
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#e4e4e7",
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              barSize={24}
              animationDuration={600}
              animationBegin={0}
              animationEasing="ease-out"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: unknown) => Number(v).toLocaleString()}
                style={{ fontSize: 11, fill: "#a1a1aa" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
