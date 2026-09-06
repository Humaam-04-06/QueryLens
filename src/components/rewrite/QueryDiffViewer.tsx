import React, { useState } from 'react';
import { SuggestedQuery } from '../../types';
import { computeLineDiff } from '../../utils/diffSql';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCopy, 
  faCheck, 
  faArrowRight, 
  faWandMagicSparkles,
  faColumns,
  faBars,
  faCircleCheck,
  faCodeBranch
} from '@fortawesome/free-solid-svg-icons';

interface QueryDiffViewerProps {
  suggested: SuggestedQuery | null;
  onApply: (sql: string) => void;
}

export const QueryDiffViewer: React.FC<QueryDiffViewerProps> = ({ suggested, onApply }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [appliedNotice, setAppliedNotice] = useState(false);

  if (!suggested) return null;

  const diffLines = computeLineDiff(suggested.originalSql, suggested.optimizedSql);

  const handleCopy = () => {
    navigator.clipboard.writeText(suggested.optimizedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApply(suggested.optimizedSql);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2500);
  };

  return (
    <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Suggested Query Rewrite</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                Optimized
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Side-by-side SQL diff and sargable rewrite comparison</p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2">
          {/* Split / Unified toggle */}
          <div className="flex items-center bg-dark-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-dark-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Side-by-Side Split View"
            >
              <FontAwesomeIcon icon={faColumns} className="text-[11px]" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1.5 ${
                viewMode === 'unified'
                  ? 'bg-dark-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Unified Line-by-Line Diff View"
            >
              <FontAwesomeIcon icon={faBars} className="text-[11px]" />
              <span className="hidden sm:inline">Unified</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-800 hover:bg-dark-700 text-slate-300 border border-slate-700 transition"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? 'text-emerald-400' : ''} />
            <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
          </button>

          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-glow-emerald transition cursor-pointer"
          >
            <FontAwesomeIcon icon={appliedNotice ? faCircleCheck : faArrowRight} />
            <span>{appliedNotice ? 'Applied to Editor!' : 'Apply to Editor'}</span>
          </button>
        </div>
      </div>

      {/* Changes list / Rationale */}
      <div className="p-3.5 rounded-xl bg-dark-950/60 border border-slate-800/80 space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FontAwesomeIcon icon={faCodeBranch} className="text-sky-400 text-xs" />
          <span>Automated Query Transformations:</span>
        </div>
        <div className="space-y-1.5 pl-1">
          {suggested.changes.map((change, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="leading-relaxed">{change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code diff view */}
      {viewMode === 'split' ? (
        /* Side-by-Side Split View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
          {/* Original */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span className="text-rose-400 font-semibold">ORIGINAL QUERY (BEFORE)</span>
              <span className="text-xs text-rose-500/80 font-mono">Inefficient I/O</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-dark-950 font-mono text-xs text-rose-300/80 border border-rose-950/80 overflow-x-auto min-h-[140px] leading-6">
              {suggested.originalSql}
            </pre>
          </div>

          {/* Optimized */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span className="text-emerald-400 font-semibold">SUGGESTED QUERY (OPTIMIZED)</span>
              <span className="text-xs text-emerald-400 font-mono font-bold">Recommended Rewrite</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-dark-950 font-mono text-xs text-emerald-300 border border-emerald-500/40 overflow-x-auto min-h-[140px] leading-6 shadow-glow-emerald">
              {suggested.optimizedSql}
            </pre>
          </div>
        </div>
      ) : (
        /* Unified Line-by-Line Diff View */
        <div className="rounded-xl bg-dark-950 border border-slate-800 overflow-hidden font-mono text-xs">
          <div className="px-4 py-2 bg-dark-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>UNIFIED DIFF (LINE BY LINE)</span>
            <div className="flex items-center gap-3">
              <span className="text-rose-400">- Removed</span>
              <span className="text-emerald-400">+ Added</span>
            </div>
          </div>
          <div className="p-2 overflow-x-auto space-y-0.5">
            {diffLines.map((line, idx) => {
              if (line.type === 'removed') {
                return (
                  <div key={idx} className="flex items-center gap-3 px-2 py-0.5 bg-rose-950/30 text-rose-300 border-l-2 border-rose-500">
                    <span className="w-6 text-right text-rose-500/70 select-none text-[10px]">{line.originalLineNumber}</span>
                    <span className="w-3 text-rose-400 font-bold select-none">-</span>
                    <span className="whitespace-pre">{line.text}</span>
                  </div>
                );
              }
              if (line.type === 'added') {
                return (
                  <div key={idx} className="flex items-center gap-3 px-2 py-0.5 bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500">
                    <span className="w-6 text-right text-emerald-500/70 select-none text-[10px]">{line.rewrittenLineNumber}</span>
                    <span className="w-3 text-emerald-400 font-bold select-none">+</span>
                    <span className="whitespace-pre">{line.text}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className="flex items-center gap-3 px-2 py-0.5 text-slate-400">
                  <span className="w-6 text-right text-slate-600 select-none text-[10px]">{line.rewrittenLineNumber}</span>
                  <span className="w-3 text-slate-600 select-none">&nbsp;</span>
                  <span className="whitespace-pre">{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
