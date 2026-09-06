import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDatabase, 
  faTableList, 
  faFileArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

interface HeaderProps {
  onToggleSchema: () => void;
  onExportReport: () => void;
  isSchemaOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSchema,
  onExportReport,
  isSchemaOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-950/80 backdrop-blur-md px-4 lg:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-cyan">
          <FontAwesomeIcon icon={faDatabase} className="text-base" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              QueryLens
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded uppercase tracking-wider">
              Optimizer
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            SQL Static Analyzer, Cost Estimator & Execution Plan Visualizer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={onToggleSchema}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            isSchemaOpen 
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-glow-cyan' 
              : 'bg-dark-850 border-slate-700/60 text-slate-300 hover:bg-dark-800'
          }`}
          title="Toggle Database Schema Explorer"
        >
          <FontAwesomeIcon icon={faTableList} />
          <span className="hidden md:inline">Schema Catalog</span>
        </button>

        <button
          onClick={onExportReport}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700/60 text-slate-300 transition-all"
          title="Export Optimization Audit Report"
        >
          <FontAwesomeIcon icon={faFileArrowDown} />
          <span className="hidden sm:inline">Export Audit</span>
        </button>

        <a
          href="https://github.com/Humaam-04-06/QueryLens"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
          title="GitHub Repository"
        >
          <FontAwesomeIcon icon={faGithub} className="text-sm" />
          <span className="hidden lg:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
};
