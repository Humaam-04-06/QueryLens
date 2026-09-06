import React from 'react';
import { ResourcePressure } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGaugeHigh, faMicrochip, faHardDrive, faMemory } from '@fortawesome/free-solid-svg-icons';

interface CostMeterProps {
  cost: number; // 0 - 100
  score: number; // 0 - 100
  resourcePressure: ResourcePressure;
}

export const CostMeter: React.FC<CostMeterProps> = ({ cost, score, resourcePressure }) => {
  // Generate block bar: ████████░░
  const filledBlocks = Math.round((cost / 100) * 10);
  const blockBar = '█'.repeat(filledBlocks) + '░'.repeat(10 - filledBlocks);

  const getCostColor = (val: number) => {
    if (val >= 70) return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
    if (val >= 40) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  };

  const getProgressColor = (val: number) => {
    if (val >= 70) return 'from-rose-600 to-rose-400';
    if (val >= 40) return 'from-amber-500 to-yellow-400';
    return 'from-emerald-500 to-teal-400';
  };

  return (
    <div className="p-4 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FontAwesomeIcon icon={faGaugeHigh} className="text-xs" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Estimated Cost & Resource Pressure
          </span>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${getCostColor(cost)}`}>
          {cost}% Relative Cost
        </div>
      </div>

      {/* Main Meter Bar & ASCII block */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400 text-xs tracking-wider">
            {blockBar} <span className="text-slate-200 font-bold ml-1">{cost}%</span>
          </span>
          <span className="text-slate-400 text-[11px]">
            Health Score: <span className="font-bold text-slate-200">{score}/100</span>
          </span>
        </div>

        <div className="h-2.5 w-full bg-dark-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(cost)} transition-all duration-700`}
            style={{ width: `${Math.min(cost, 100)}%` }}
          />
        </div>
      </div>

      {/* Resource Breakdown: CPU, I/O, Memory */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px]">
        <div className="p-2 rounded-xl bg-dark-950/60 border border-slate-800/80 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faMicrochip} className="text-[10px] text-sky-400" />
              CPU
            </span>
            <span className="font-semibold text-slate-200">{resourcePressure.cpu}%</span>
          </div>
          <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500" style={{ width: `${resourcePressure.cpu}%` }} />
          </div>
        </div>

        <div className="p-2 rounded-xl bg-dark-950/60 border border-slate-800/80 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faHardDrive} className="text-[10px] text-rose-400" />
              I/O Read
            </span>
            <span className="font-semibold text-slate-200">{resourcePressure.io}%</span>
          </div>
          <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${resourcePressure.io}%` }} />
          </div>
        </div>

        <div className="p-2 rounded-xl bg-dark-950/60 border border-slate-800/80 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faMemory} className="text-[10px] text-purple-400" />
              Buffer Mem
            </span>
            <span className="font-semibold text-slate-200">{resourcePressure.memory}%</span>
          </div>
          <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${resourcePressure.memory}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
