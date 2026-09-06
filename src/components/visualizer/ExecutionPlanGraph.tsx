import React, { useState } from 'react';
import { ExecutionPlanNode } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDiagramProject, 
  faCircleExclamation, 
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';

interface ExecutionPlanGraphProps {
  plan: ExecutionPlanNode | null;
  isOptimizedView: boolean;
  onTogglePlanView: () => void;
}

export const ExecutionPlanGraph: React.FC<ExecutionPlanGraphProps> = ({
  plan,
  isOptimizedView,
  onTogglePlanView,
}) => {
  const [selectedNode, setSelectedNode] = useState<ExecutionPlanNode | null>(null);

  if (!plan) return null;

  const renderNode = (node: ExecutionPlanNode) => {
    const isBottleneck = node.isBottleneck;
    const isSelected = selectedNode?.id === node.id;

    let nodeColor = 'bg-dark-850 border-slate-700 text-slate-200';
    if (isBottleneck) {
      nodeColor = 'bg-rose-950/40 border-rose-500 text-rose-200 shadow-glow-rose ring-1 ring-rose-500/50';
    } else if (node.cost < 20) {
      nodeColor = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200';
    } else if (node.cost < 60) {
      nodeColor = 'bg-amber-950/30 border-amber-500/40 text-amber-200';
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* The Node Box */}
        <div
          onClick={() => setSelectedNode(node)}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-105 select-none w-56 flex flex-col gap-1.5 ${nodeColor} ${
            isSelected ? 'ring-2 ring-sky-400' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold">{node.operator}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-900/80 border border-slate-700">
              cost: {node.cost}
            </span>
          </div>

          <div className="text-xs font-medium truncate">{node.label}</div>

          {node.estimatedRows && (
            <div className="text-[10px] text-slate-400 font-mono">
              ~{node.estimatedRows.toLocaleString()} rows
            </div>
          )}

          {isBottleneck && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-400 pt-1 border-t border-rose-500/30">
              <FontAwesomeIcon icon={faCircleExclamation} />
              <span>Critical Bottleneck</span>
            </div>
          )}
        </div>

        {/* Children Connection Lines */}
        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center">
            {/* Down arrow line */}
            <div className="w-0.5 h-6 bg-slate-700 my-1" />

            <div className="flex gap-6 items-start">
              {node.children.map((child) => renderNode(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FontAwesomeIcon icon={faDiagramProject} className="text-xs" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Query Execution Plan (DAG)</h3>
            <p className="text-[11px] text-slate-400">Interactive operator graph & cost bottleneck heatmaps</p>
          </div>
        </div>

        {/* Plan toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlanView}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              isOptimizedView
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
                : 'bg-dark-800 border-slate-700 text-slate-300'
            }`}
          >
            <FontAwesomeIcon icon={faRotateRight} className="text-xs" />
            <span>{isOptimizedView ? 'Optimized Plan (Index Scan)' : 'Original Plan (Seq Scan)'}</span>
          </button>
        </div>
      </div>

      {/* Execution Graph Viewport */}
      <div className="p-6 rounded-xl bg-dark-950 border border-slate-800/80 min-h-[280px] flex items-center justify-center overflow-x-auto">
        {renderNode(plan)}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-200">{selectedNode.label}</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {selectedNode.filter || 'Operator executed as part of query pipeline.'}
            </p>
          </div>
          <div className="font-mono text-slate-300 text-right">
            <div>Cost: {selectedNode.cost}</div>
            <div className="text-[11px] text-slate-500">Rows: ~{selectedNode.estimatedRows?.toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};
