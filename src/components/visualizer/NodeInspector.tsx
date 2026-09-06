import React from 'react';
import { ExecutionPlanNode } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faCircleExclamation, 
  faHardDrive, 
  faMicrochip, 
  faTable, 
  faFilter, 
  faLightbulb,
  faChartLine,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

interface NodeInspectorProps {
  node: ExecutionPlanNode;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ node, onClose }) => {
  const isBottleneck = node.isBottleneck;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isBottleneck
        ? 'bg-rose-950/20 border-rose-500/50 shadow-glow-rose'
        : 'bg-dark-850 border-slate-700/80 shadow-xl'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-100">{node.label}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            isBottleneck
              ? 'bg-rose-950 text-rose-300 border-rose-500/40'
              : node.cost < 20
              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950 text-amber-300 border-amber-500/40'
          }`}>
            cost: {node.cost}
          </span>
          {node.complexity && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-900 text-sky-400 border border-slate-700">
              {node.complexity}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-dark-800 transition"
          aria-label="Close Inspector"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      </div>

      {/* Critical Bottleneck Alert if applicable */}
      {isBottleneck && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
          <FontAwesomeIcon icon={faCircleExclamation} className="text-rose-400 text-sm mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-bold">Primary Performance Bottleneck</div>
            <p className="text-[11px] text-rose-300/90 leading-relaxed">
              {node.details || 'This operator accounts for the majority of execution latency and disk I/O.'}
            </p>
            {node.recommendation && (
              <div className="pt-1 text-[11px] text-sky-300 flex items-center gap-1 font-mono">
                <FontAwesomeIcon icon={faLightbulb} className="text-amber-400" />
                <span>{node.recommendation}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-3">
        <div className="p-2 rounded-lg bg-dark-950 border border-slate-800">
          <div className="text-slate-500 text-[10px]">Estimated Rows</div>
          <div className="text-slate-200 font-bold mt-0.5">
            {node.estimatedRows?.toLocaleString()}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-dark-950 border border-slate-800">
          <div className="text-slate-500 text-[10px]">Output Rows</div>
          <div className="text-slate-200 font-bold mt-0.5">
            {node.outputRows?.toLocaleString() || node.estimatedRows?.toLocaleString()}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-dark-950 border border-slate-800">
          <div className="text-slate-500 text-[10px] flex items-center gap-1">
            <FontAwesomeIcon icon={faHardDrive} className="text-rose-400 text-[9px]" />
            <span>I/O Cost</span>
          </div>
          <div className="text-rose-300 font-bold mt-0.5">
            {node.ioCost ? `${node.ioCost} units` : `${Math.round(node.cost * 0.6)} units`}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-dark-950 border border-slate-800">
          <div className="text-slate-500 text-[10px] flex items-center gap-1">
            <FontAwesomeIcon icon={faMicrochip} className="text-sky-400 text-[9px]" />
            <span>CPU Cost</span>
          </div>
          <div className="text-sky-300 font-bold mt-0.5">
            {node.cpuCost ? `${node.cpuCost} units` : `${Math.round(node.cost * 0.4)} units`}
          </div>
        </div>
      </div>

      {/* Additional Operator Context */}
      <div className="space-y-1.5 text-xs">
        {node.table && (
          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
            <FontAwesomeIcon icon={faTable} className="text-sky-400 text-xs" />
            <span className="text-slate-500">Target Table:</span>
            <span className="font-semibold text-slate-200">{node.table}</span>
          </div>
        )}

        {node.filter && (
          <div className="flex items-start gap-1.5 text-slate-300 font-mono text-[11px]">
            <FontAwesomeIcon icon={faFilter} className="text-amber-400 text-xs mt-0.5" />
            <span className="text-slate-500 shrink-0">Predicate Filter:</span>
            <span className="text-slate-200 break-all">{node.filter}</span>
          </div>
        )}

        {!isBottleneck && node.details && (
          <p className="text-slate-400 text-[11px] leading-relaxed pt-1 border-t border-slate-800/60">
            {node.details}
          </p>
        )}
      </div>
    </div>
  );
};
