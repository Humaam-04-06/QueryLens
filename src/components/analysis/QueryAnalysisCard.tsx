import React from 'react';
import { AnalysisResult } from '../../types';
import { Badge } from '../common/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTriangleExclamation, 
  faCircleExclamation, 
  faCircleCheck,
  faWandMagicSparkles
} from '@fortawesome/free-solid-svg-icons';

interface QueryAnalysisCardProps {
  analysis: AnalysisResult | null;
}

export const QueryAnalysisCard: React.FC<QueryAnalysisCardProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="p-6 rounded-2xl bg-dark-900/90 border border-slate-800 text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-500">
          <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xl" />
        </div>
        <div className="text-sm font-semibold text-slate-300">Ready to Optimize</div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Enter your SQL query and click "Analyze Query" to diagnose anti-patterns, calculate costs, and view optimizations.
        </p>
      </div>
    );
  }

  const { issues } = analysis;

  return (
    <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-sm tracking-wider uppercase text-slate-200 flex items-center gap-2">
            <span>QUERY ANALYSIS</span>
          </h3>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            ────────────────────────────────────────
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {issues.length} {issues.length === 1 ? 'issue' : 'issues'} detected
        </span>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
            <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-lg" />
            <div>
              <div className="font-semibold text-xs">Clean Query Execution Profile</div>
              <p className="text-[11px] text-emerald-400/80">
                No high-risk anti-patterns or missing index scans detected in this statement.
              </p>
            </div>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3.5 rounded-xl border transition flex flex-col gap-1.5 ${
                issue.severity === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                  : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <FontAwesomeIcon
                    icon={issue.severity === 'critical' ? faCircleExclamation : faTriangleExclamation}
                    className={issue.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}
                  />
                  <span className={issue.severity === 'critical' ? 'text-rose-200' : 'text-amber-200'}>
                    {issue.title}
                  </span>
                </div>
                <Badge severity={issue.severity}>
                  {issue.severity.toUpperCase()}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 pl-5 leading-relaxed">{issue.description}</p>

              {issue.remediation && (
                <div className="pl-5 pt-1 text-[11px] text-sky-400 font-mono">
                  💡 <span className="text-slate-300 font-sans">{issue.remediation}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
