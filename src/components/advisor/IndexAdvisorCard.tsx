import React, { useState } from 'react';
import { IndexRecommendation } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCopy, 
  faCheck, 
  faArrowTrendUp,
  faSliders,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';

interface IndexAdvisorCardProps {
  recommendations: IndexRecommendation[];
  onToggleSimulator: (id: string) => void;
}

export const IndexAdvisorCard: React.FC<IndexAdvisorCardProps> = ({
  recommendations,
  onToggleSimulator,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (recommendations.length === 0) return null;

  const handleCopy = (id: string, ddl: string) => {
    navigator.clipboard.writeText(ddl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-dark-900/90 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FontAwesomeIcon icon={faLightbulb} className="text-xs" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Index Advisor & DDL Generator</h3>
            <p className="text-[11px] text-slate-400">Targeted B-Tree indexes to eliminate sequential scans</p>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
          <FontAwesomeIcon icon={faArrowTrendUp} />
          <span>Expected Improvement: ~75-85%</span>
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-2.5 hover:border-sky-500/40 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200">
                  {rec.table} ({rec.columns.join(', ')})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  {rec.type}
                </span>
              </div>

              {/* What-If Simulator Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rec.isActiveInSimulation}
                    onChange={() => onToggleSimulator(rec.id)}
                    className="w-4 h-4 rounded text-sky-500 bg-dark-800 border-slate-700 focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <FontAwesomeIcon icon={faSliders} className="text-sky-400" />
                    What-If Simulator
                  </span>
                </label>

                <button
                  onClick={() => handleCopy(rec.id, rec.ddl)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-dark-800 hover:bg-dark-700 text-slate-300 border border-slate-700 transition"
                >
                  <FontAwesomeIcon icon={copiedId === rec.id ? faCheck : faCopy} className={copiedId === rec.id ? 'text-emerald-400' : ''} />
                  <span>{copiedId === rec.id ? 'Copied' : 'Copy DDL'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">{rec.reason}</p>

            <pre className="p-3 rounded-lg bg-dark-950 font-mono text-xs text-sky-300 border border-slate-800 overflow-x-auto">
              {rec.ddl}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
