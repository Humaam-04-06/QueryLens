import React, { useState } from 'react';
import { QueryDialect } from '../../types';
import { DialectSelector } from './DialectSelector';
import { SampleQueriesModal } from './SampleQueriesModal';
import { SampleQuery } from '../../engine/ast/sampleQueries';
import { formatSql } from '../../utils/formatSql';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faWandMagicSparkles, 
  faBolt, 
  faRotateRight,
  faCode
} from '@fortawesome/free-solid-svg-icons';

interface SqlEditorProps {
  sql: string;
  dialect: QueryDialect;
  isAnalyzing: boolean;
  onSqlChange: (sql: string) => void;
  onDialectChange: (dialect: QueryDialect) => void;
  onAnalyze: () => void;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  sql,
  dialect,
  isAnalyzing,
  onSqlChange,
  onDialectChange,
  onAnalyze,
}) => {
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  const handleFormat = () => {
    const formatted = formatSql(sql, dialect);
    onSqlChange(formatted);
  };

  const handleSelectSample = (sample: SampleQuery) => {
    onSqlChange(sample.sql);
    onDialectChange(sample.dialect);
  };

  // Compute line numbers
  const lines = sql.split('\n').length;

  return (
    <div className="flex flex-col h-full bg-dark-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-dark-850/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs tracking-wider uppercase">
            <FontAwesomeIcon icon={faCode} className="text-sky-400" />
            <span>SQL Input Console</span>
          </div>
          <DialectSelector dialect={dialect} onChange={onDialectChange} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSampleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-slate-700/60 rounded-lg transition"
            title="Load Pre-configured Anti-pattern Queries"
          >
            <FontAwesomeIcon icon={faBolt} className="text-amber-400" />
            <span>Sample Queries</span>
          </button>

          <button
            type="button"
            onClick={handleFormat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-700 border border-slate-700/60 rounded-lg transition"
            title="Prettify & Format SQL"
          >
            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-indigo-400" />
            <span>Format</span>
          </button>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !sql.trim()}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-glow-cyan transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FontAwesomeIcon icon={isAnalyzing ? faRotateRight : faPlay} className={isAnalyzing ? 'animate-spin' : ''} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Query'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex-1 flex min-h-[220px] font-mono text-sm bg-dark-950">
        {/* Line Numbers */}
        <div className="w-12 py-3 bg-dark-950/80 border-r border-slate-800/80 text-right pr-3 select-none text-slate-600 font-mono text-xs">
          {Array.from({ length: Math.max(lines, 8) }).map((_, idx) => (
            <div key={idx} className="leading-6">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={sql}
          onChange={(e) => onSqlChange(e.target.value)}
          placeholder="Enter or paste your SQL query here (e.g. SELECT * FROM Orders JOIN Customers...)"
          spellCheck={false}
          className="flex-1 w-full p-3 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none resize-none font-mono text-xs md:text-sm leading-6 selection:bg-sky-500/30"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              onAnalyze();
            }
          }}
        />
      </div>

      {/* Footer shortcut bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-dark-900 border-t border-slate-800/80 text-[11px] text-slate-500">
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-dark-800 border border-slate-700 text-slate-300 font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-dark-800 border border-slate-700 text-slate-300 font-mono">Enter</kbd> to analyze</span>
        <span>{sql.trim().length} chars • {lines} lines</span>
      </div>

      {/* Sample Modal */}
      <SampleQueriesModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectQuery={handleSelectSample}
      />
    </div>
  );
};
