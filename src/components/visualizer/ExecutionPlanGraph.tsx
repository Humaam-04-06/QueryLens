import React, { useState } from 'react';
import { ExecutionPlanNode } from '../../types';
import { NodeInspector } from './NodeInspector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDiagramProject, 
  faCircleExclamation, 
  faRotateRight,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faArrowsRotate,
  faCircleInfo
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
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!plan) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  const renderNode = (node: ExecutionPlanNode) => {
    const isBottleneck = node.isBottleneck;
    const isSelected = selectedNode?.id === node.id;

    let nodeColor = 'bg-dark-850 border-slate-700 text-slate-200';
    if (isBottleneck) {
      nodeColor = 'bg-rose-950/50 border-rose-500 text-rose-200 shadow-glow-rose ring-1 ring-rose-500/60 animate-pulse-slow';
    } else if (node.cost < 20) {
      nodeColor = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
    } else if (node.cost < 60) {
      nodeColor = 'bg-amber-950/40 border-amber-500/50 text-amber-200';
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Operator Node Card */}
        <div
          onClick={() => setSelectedNode(node)}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-105 select-none w-64 flex flex-col gap-1.5 ${nodeColor} ${
            isSelected ? 'ring-2 ring-sky-400 scale-105' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-extrabold">{node.operator}</span>
            <div className="flex items-center gap-1.5">
              {node.complexity && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-dark-900/80 text-sky-400 border border-slate-700">
                  {node.complexity}
                </span>
              )}
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-dark-950/80 border border-slate-700">
                cost: {node.cost}
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold truncate text-slate-100">{node.label}</div>

          {node.estimatedRows && (
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Rows: ~{node.estimatedRows.toLocaleString()}</span>
              {node.table && <span className="text-slate-500">{node.table}</span>}
            </div>
          )}

          {isBottleneck && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-300 pt-1 border-t border-rose-500/30">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-rose-400" />
              <span>Critical Bottleneck (Seq Scan)</span>
            </div>
          )}
        </div>

        {/* Child Node Connectors */}
        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center">
            {/* Vertical stem line */}
            <div className="w-0.5 h-6 bg-slate-700 my-0.5" />

            {/* Horizontal branch line if multiple children */}
            {node.children.length > 1 && (
              <div className="w-full h-0.5 bg-slate-700 mb-2" />
            )}

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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faDiagramProject} className="text-xs" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Execution Plan DAG Visualizer</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                Heatmap Graph
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Interactive execution tree & operator cost bottlenecks</p>
          </div>
        </div>

        {/* Controls: Zoom & Plan Switcher */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-dark-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={handleZoomIn}
              className="px-2 py-1 text-slate-400 hover:text-slate-200 transition"
              title="Zoom In"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-slate-500">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={handleZoomOut}
              className="px-2 py-1 text-slate-400 hover:text-slate-200 transition"
              title="Zoom Out"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-1 text-slate-400 hover:text-slate-200 transition text-[10px]"
              title="Reset Zoom"
            >
              <FontAwesomeIcon icon={faArrowsRotate} />
            </button>
          </div>

          {/* Plan view toggle */}
          <button
            onClick={onTogglePlanView}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              isOptimizedView
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-glow-emerald'
                : 'bg-dark-800 border-slate-700 text-slate-300 hover:bg-dark-750'
            }`}
          >
            <FontAwesomeIcon icon={faRotateRight} className="text-xs" />
            <span>{isOptimizedView ? 'Optimized Plan (Index Seek)' : 'Original Plan (Seq Scan)'}</span>
          </button>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-dark-950/60 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="text-slate-500 font-sans font-medium">Cost Heatmap:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-glow-emerald" />
            <span>Low Cost (&lt;20)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-glow-amber" />
            <span>Moderate (20-50)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-rose" />
            <span>Critical Bottleneck (&gt;50)</span>
          </span>
        </div>

        <span className="text-[10px] text-slate-500 hidden md:flex items-center gap-1">
          <FontAwesomeIcon icon={faCircleInfo} className="text-slate-400" />
          Click any operator node to inspect latency & I/O
        </span>
      </div>

      {/* Execution Graph Viewport */}
      <div className="p-8 rounded-xl bg-dark-950 border border-slate-800/80 min-h-[320px] flex items-center justify-center overflow-x-auto">
        <div
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}
          className="w-full flex justify-center"
        >
          {renderNode(plan)}
        </div>
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <NodeInspector
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};
