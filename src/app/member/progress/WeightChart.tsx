"use client";

import { useMemo } from "react";
import type { ProgressEntry } from "@/lib/db/queries/progress";

export function WeightChart({ history }: { history: ProgressEntry[] }) {
  const chartData = useMemo(() => {
    // We want chronologically for the chart
    const data = [...history].reverse();
    if (data.length < 2) return null;
    return data;
  }, [history]);

  if (!chartData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-stone-800 border-dashed rounded-lg">
        <svg className="w-8 h-8 text-stone-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
        <p className="text-sm font-medium text-stone-300">Not enough data</p>
        <p className="text-xs text-stone-500 mt-1">Record your weight at least twice to see your trend.</p>
      </div>
    );
  }

  // Very simple SVG charting logic
  const minWeight = Math.min(...chartData.map(d => d.weight)) - 2;
  const maxWeight = Math.max(...chartData.map(d => d.weight)) + 2;
  const range = maxWeight - minWeight;
  
  const width = 100; // viewbox 0 to 100
  const height = 40; // viewbox 0 to 40

  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * width;
    const y = height - ((d.weight - minWeight) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[5/2] sm:aspect-[3/1] bg-stone-900 rounded-lg overflow-hidden border border-stone-800 p-4">
        {/* Simple SVG Chart */}
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="0" x2={width} y2="0" stroke="currentColor" strokeWidth="0.5" className="text-stone-800" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeWidth="0.5" className="text-stone-800" />
          <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" strokeWidth="0.5" className="text-stone-800" />
          
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500"
          />
          {chartData.map((d, i) => {
            const x = (i / (chartData.length - 1)) * width;
            const y = height - ((d.weight - minWeight) / range) * height;
            return (
              <circle key={d.id} cx={x} cy={y} r="1.5" className="fill-stone-950 stroke-amber-500" strokeWidth="0.5" />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-[10px] uppercase tracking-wider font-medium text-stone-500">
        <span>{new Date(chartData[0].recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(chartData[chartData.length - 1].recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}
