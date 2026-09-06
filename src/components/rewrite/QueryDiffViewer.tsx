import React, { useState } from 'react';
import { SuggestedQuery } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCopy, 
  faCheck, 
  faArrowRight, 
  faWandMagicSparkles
} from '@fortawesome/free-solid-svg-icons';

interface QueryDiffViewerProps {
  suggested: SuggestedQuery | null;
  onApply: (sql: string) => void;
}

export const QueryDiffViewer: React.FC<QueryDiffViewerProps> = ({ suggested, onApply }) => {
  const [copied, setCopied] = useState(false);

  if (!suggested) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(suggested.optimizedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Suggested Query Rewrite</h3>
            <p className="text-[11px] text-slate-400">Optimized projection and sargable predicates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-800 hover:bg-dark-700 text-slate-300 border border-slate-700 transition"
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={copied ? 'text-emerald-400' : ''} />
            <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
          </button>

          <button
            onClick={() => onApply(suggested.optimizedSql)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald transition"
          >
            <FontAwesomeIcon icon={faArrowRight} />
            <span>Apply to Editor</span>
          </button>
        </div>
      </div>

      {/* Changes list */}
      <div className="space-y-1.5">
        {suggested.changes.map((change, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>{change}</span>
          </div>
        ))}
      </div>

      {/* Code comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>ORIGINAL (INEFFICIENT)</span>
            <span className="text-rose-400 font-bold">High Cost</span>
          </div>
          <pre className="p-3 rounded-xl bg-dark-950 font-mono text-xs text-rose-300/80 border border-rose-950/80 overflow-x-auto min-h-[100px]">
            {suggested.originalSql}
          </pre>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
            <span>REWRITTEN (OPTIMIZED)</span>
            <span className="text-emerald-400 font-bold">Recommended</span>
          </div>
          <pre className="p-3 rounded-xl bg-dark-950 font-mono text-xs text-emerald-300 border border-emerald-500/30 overflow-x-auto min-h-[100px] shadow-glow-emerald">
            {suggested.optimizedSql}
          </pre>
        </div>
      </div>
    </div>
  );
};
