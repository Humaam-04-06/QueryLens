import React from 'react';
import { ResourcePressure } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGaugeHigh, 
  faMicrochip, 
  faHardDrive, 
  faMemory, 
  faChartSimple,
  faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';

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
    if (val >= 70) return 'from-rose-600 via-rose-500 to-amber-500 shadow-glow-rose';
    if (val >= 40) return 'from-amber-500 to-yellow-400 shadow-glow-amber';
    return 'from-emerald-500 to-teal-400 shadow-glow-emerald';
  };

  return (
    <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faGaugeHigh} className="text-xs" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Estimated Execution Cost
            </span>
            <p className="text-[11px] text-slate-400">Relative hardware pressure & latency risk</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getCostColor(cost)} flex items-center gap-1.5`}>
          {cost >= 70 && <FontAwesomeIcon icon={faCircleExclamation} className="text-[10px]" />}
          <span>{cost}% Relative Cost</span>
        </div>
      </div>

      {/* Exact User Format Block: Estimated Cost: ████████░░ 82% */}
      <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800/80 space-y-2">
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Estimated Cost:</span>
          <span className="text-[11px] text-slate-500">
            Health Score: <strong className="text-slate-200 font-mono">{score}/100</strong>
          </span>
        </div>

        <div className="flex items-center justify-between text-base font-mono tracking-widest text-sky-400 select-all">
          <span className="text-rose-400 font-extrabold">{blockBar}</span>
          <span className="text-sm font-bold text-slate-200 ml-2">{cost}%</span>
        </div>

        {/* Glowing Progress Bar */}
        <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(cost)} transition-all duration-700`}
            style={{ width: `${Math.min(cost, 100)}%` }}
          />
        </div>
      </div>

      {/* Resource Breakdown: CPU, I/O Read, Buffer Memory, Scanned Rows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
        <div className="p-2.5 rounded-xl bg-dark-950/60 border border-slate-800/80 flex flex-col gap-1">
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

        <div className="p-2.5 rounded-xl bg-dark-950/60 border border-slate-800/80 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faHardDrive} className="text-[10px] text-rose-400" />
              Disk I/O
            </span>
            <span className="font-semibold text-slate-200">{resourcePressure.io}%</span>
          </div>
          <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${resourcePressure.io}%` }} />
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-dark-950/60 border border-slate-800/80 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faMemory} className="text-[10px] text-purple-400" />
              Buffer
            </span>
            <span className="font-semibold text-slate-200">{resourcePressure.memory}%</span>
          </div>
          <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${resourcePressure.memory}%` }} />
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-dark-950/60 border border-slate-800/80 flex flex-col gap-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faChartSimple} className="text-[10px] text-emerald-400" />
              Rows
            </span>
            <span className="font-semibold text-slate-200">
              {resourcePressure.estimatedScannedRows > 0 ? `${(resourcePressure.estimatedScannedRows / 1000).toFixed(0)}k` : '0'}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 truncate">Est. Scan Volume</span>
        </div>
      </div>
    </div>
  );
};
