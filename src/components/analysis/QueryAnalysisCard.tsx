import React, { useState } from 'react';
import { AnalysisResult } from '../../types';
import { Badge } from '../common/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTriangleExclamation, 
  faCircleExclamation, 
  faCircleCheck,
  faWandMagicSparkles,
  faChevronDown,
  faChevronUp,
  faLightbulb,
  faCode
} from '@fortawesome/free-solid-svg-icons';

interface QueryAnalysisCardProps {
  analysis: AnalysisResult | null;
}

export const QueryAnalysisCard: React.FC<QueryAnalysisCardProps> = ({ analysis }) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

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

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      {/* Header matching exact user spec */}
      <div className="border-b border-slate-800/80 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm tracking-wider uppercase text-slate-100 font-mono flex items-center gap-2">
            <span>QUERY ANALYSIS</span>
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-950 text-slate-400 border border-slate-800">
            {issues.length} {issues.length === 1 ? 'diagnostic' : 'diagnostics'}
          </span>
        </div>
        <div className="text-xs text-slate-600 font-mono tracking-tighter select-none mt-1">
          ────────────────────────────────────────────
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 shadow-glow-emerald">
            <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-lg" />
            <div>
              <div className="font-semibold text-xs">Clean Query Execution Profile</div>
              <p className="text-[11px] text-emerald-400/80 mt-0.5">
                No high-risk anti-patterns or sequential scan bottlenecks detected in this statement.
              </p>
            </div>
          </div>
        ) : (
          issues.map((issue) => {
            const isExpanded = !!expandedIds[issue.id];
            const isCritical = issue.severity === 'critical';

            return (
              <div
                key={issue.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                    : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                {/* Header item */}
                <div
                  onClick={() => toggleExpand(issue.id)}
                  className="p-3.5 flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-2.5">
                    <FontAwesomeIcon
                      icon={isCritical ? faCircleExclamation : faTriangleExclamation}
                      className={`text-sm mt-0.5 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}
                    />
                    <div>
                      <div className={`font-mono text-xs font-bold leading-relaxed whitespace-pre-line ${
                        isCritical ? 'text-rose-200' : 'text-amber-200'
                      }`}>
                        {issue.title}
                      </div>

                      {issue.impactCategory && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-dark-900/80 text-slate-400 border border-slate-800">
                            {issue.impactCategory}
                          </span>
                          {issue.lineReference && (
                            <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                              <FontAwesomeIcon icon={faCode} className="text-[8px]" />
                              {issue.lineReference}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge severity={issue.severity}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                    <FontAwesomeIcon
                      icon={isExpanded ? faChevronUp : faChevronDown}
                      className="text-xs text-slate-500"
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-3.5 pt-1 space-y-2 text-xs border-t border-slate-800/60 bg-dark-950/40">
                    <p className="text-slate-300 leading-relaxed pl-6">{issue.description}</p>
                    {issue.remediation && (
                      <div className="pl-6 pt-1 flex items-start gap-2 text-sky-400 text-[11px] font-mono">
                        <FontAwesomeIcon icon={faLightbulb} className="text-amber-400 text-xs mt-0.5" />
                        <span className="text-slate-300 font-sans">{issue.remediation}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
