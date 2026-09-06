import React, { useState } from 'react';
import { BenchmarkMetrics } from '../../types';
import { runQueryBenchmark } from '../../engine/benchmark/sqliteRunner';
import confetti from 'canvas-confetti';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faRotateRight, 
  faBolt, 
  faArrowTrendUp,
  faClock,
  faHardDrive,
  faMemory,
  faCircleCheck
} from '@fortawesome/free-solid-svg-icons';

interface BenchmarkRunnerProps {
  originalSql: string;
  optimizedSql: string;
}

export const BenchmarkRunner: React.FC<BenchmarkRunnerProps> = ({
  originalSql,
  optimizedSql,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<BenchmarkMetrics | null>(null);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      const res = await runQueryBenchmark(originalSql, optimizedSql);
      setMetrics(res);
      // Trigger celebratory confetti on high speedup (>10x)
      if (res.speedupMultiplier >= 10) {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#10b981', '#38bdf8', '#fbbf24'],
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faBolt} className="text-xs" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Live In-Browser Micro-Benchmark</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                Simulation Engine
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Run queries against synthetic datasets (60k+ records) & measure wall-clock latency</p>
          </div>
        </div>

        <button
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 shadow-glow-amber transition disabled:opacity-50 cursor-pointer"
        >
          <FontAwesomeIcon icon={isRunning ? faRotateRight : faPlay} className={isRunning ? 'animate-spin' : ''} />
          <span>{isRunning ? 'Executing Benchmarks...' : 'Run Live Benchmark'}</span>
        </button>
      </div>

      {metrics ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Top Speedup Highlight Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-sky-950/30 border border-emerald-500/40 shadow-glow-emerald flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg">
                <FontAwesomeIcon icon={faArrowTrendUp} />
              </div>
              <div>
                <div className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                  Performance Speedup Factor
                </div>
                <div className="text-2xl lg:text-3xl font-mono font-extrabold text-slate-100">
                  {metrics.speedupMultiplier}x <span className="text-emerald-400 text-xl font-bold">Faster</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
              <div className="px-3 py-1.5 rounded-lg bg-dark-900/80 border border-slate-800 text-right">
                <span className="text-slate-500 text-[10px] block">Latency Reduction</span>
                <span className="font-bold text-emerald-400 text-sm">{metrics.latencyReductionPct}%</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-dark-900/80 border border-slate-800 text-right">
                <span className="text-slate-500 text-[10px] block">Rows Saved</span>
                <span className="font-bold text-sky-400 text-sm">
                  {(metrics.rowsExaminedOriginal - metrics.rowsExaminedOptimized).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Latency Bar Comparison */}
          <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-slate-400 font-sans text-xs font-semibold flex items-center justify-between">
              <span>Execution Time Comparison:</span>
              <span className="text-slate-500 text-[11px]">Wall Clock Time (Lower is Better)</span>
            </div>

            {/* Original Query Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-rose-400 font-semibold">Original (Unindexed): {metrics.originalTimeMs} ms</span>
                <span className="text-slate-500">{metrics.rowsExaminedOriginal.toLocaleString()} rows scanned</span>
              </div>
              <div className="h-3 w-full bg-dark-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-700 w-full" />
              </div>
            </div>

            {/* Optimized Query Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-emerald-400 font-bold">Optimized (With Index): {metrics.optimizedTimeMs} ms</span>
                <span className="text-slate-500">{metrics.rowsExaminedOptimized.toLocaleString()} rows scanned</span>
              </div>
              <div className="h-3 w-full bg-dark-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-glow-emerald"
                  style={{ width: `${Math.max(3, (metrics.optimizedTimeMs / metrics.originalTimeMs) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Performance Metrics Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800/80 flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] flex items-center gap-1">
                <FontAwesomeIcon icon={faClock} className="text-sky-400 text-[9px]" />
                Original Runtime
              </span>
              <span className="text-base font-bold text-rose-400">{metrics.originalTimeMs} ms</span>
              <span className="text-[10px] text-slate-500">Plan: {metrics.originalPlanningTimeMs} ms</span>
            </div>

            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800/80 flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] flex items-center gap-1">
                <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-[9px]" />
                Indexed Runtime
              </span>
              <span className="text-base font-bold text-emerald-400">{metrics.optimizedTimeMs} ms</span>
              <span className="text-[10px] text-slate-500">Plan: {metrics.optimizedPlanningTimeMs} ms</span>
            </div>

            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800/80 flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] flex items-center gap-1">
                <FontAwesomeIcon icon={faHardDrive} className="text-indigo-400 text-[9px]" />
                Buffer Hit Ratio
              </span>
              <span className="text-base font-bold text-indigo-300">{metrics.bufferHitRatioOptimized}%</span>
              <span className="text-[10px] text-slate-500">Orig: {metrics.bufferHitRatioOriginal}%</span>
            </div>

            <div className="p-3 rounded-xl bg-dark-950 border border-slate-800/80 flex flex-col gap-1">
              <span className="text-slate-500 text-[10px] flex items-center gap-1">
                <FontAwesomeIcon icon={faMemory} className="text-purple-400 text-[9px]" />
                Memory Footprint
              </span>
              <span className="text-base font-bold text-purple-300">{metrics.memoryUsageKb?.optimized} KB</span>
              <span className="text-[10px] text-slate-500">Orig: {metrics.memoryUsageKb?.original} KB</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-dark-950/60 border border-slate-800/60 text-center space-y-2">
          <div className="text-xs text-slate-400 font-medium">
            Run an in-browser execution benchmark to evaluate true wall-clock performance improvements.
          </div>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Measures query latency, buffer cache hit ratios, memory high-watermark, and rows examined against pre-populated synthetic datasets.
          </p>
        </div>
      )}
    </div>
  );
};
