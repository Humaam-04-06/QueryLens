import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faDatabase, 
  faTableList, 
  faFileArrowDown,
  faCircleCheck,
  faKeyboard,
  faClockRotateLeft,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

interface HeaderProps {
  onToggleSchema: () => void;
  onToggleHistory: () => void;
  onOpenBatchModal: () => void;
  onExportReport: () => void;
  isSchemaOpen: boolean;
  isHistoryOpen: boolean;
  activeSchemaName: string;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSchema,
  onToggleHistory,
  onOpenBatchModal,
  onExportReport,
  isSchemaOpen,
  isHistoryOpen,
  activeSchemaName,
  historyCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-950/85 backdrop-blur-md px-4 lg:px-6 py-3 flex items-center justify-between transition-all">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-glow-cyan">
          <FontAwesomeIcon icon={faDatabase} className="text-sm" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              QueryLens
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded uppercase tracking-wider">
              Optimizer
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300">
              <FontAwesomeIcon icon={faCircleCheck} className="text-[10px] text-emerald-400" />
              <span>AST Engine: Active</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            SQL Static Analysis, Execution Plan Visualizer & Index Advisor
          </p>
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Keyboard shortcut hint */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-slate-400 bg-dark-900 border border-slate-800 rounded-lg">
          <FontAwesomeIcon icon={faKeyboard} className="text-slate-500 text-xs" />
          <span>Execute:</span>
          <kbd className="px-1 py-0.2 bg-dark-800 rounded border border-slate-700 font-mono text-[10px] text-slate-300">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1 py-0.2 bg-dark-800 rounded border border-slate-700 font-mono text-[10px] text-slate-300">Enter</kbd>
        </div>

        {/* Active Catalog Button */}
        <button
          onClick={onToggleSchema}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            isSchemaOpen 
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-glow-cyan' 
              : 'bg-dark-850 border-slate-700/60 text-slate-300 hover:bg-dark-800'
          }`}
          title="Open Database Schema Inspector"
        >
          <FontAwesomeIcon icon={faTableList} className={isSchemaOpen ? 'text-sky-400' : 'text-slate-400'} />
          <span className="hidden sm:inline font-mono">{activeSchemaName.split(' ')[0]}</span>
          <span className="text-[10px] text-slate-500 hidden md:inline">Catalog</span>
        </button>

        {/* Query History & Bookmarks Button */}
        <button
          onClick={onToggleHistory}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            isHistoryOpen 
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-glow-cyan' 
              : 'bg-dark-850 border-slate-700/60 text-slate-300 hover:bg-dark-800'
          }`}
          title="Open Query History & Starred Bookmarks"
        >
          <FontAwesomeIcon icon={faClockRotateLeft} className={isHistoryOpen ? 'text-cyan-400' : 'text-slate-400'} />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
              {historyCount}
            </span>
          )}
        </button>

        {/* Multi-Query Batch Profiler Button */}
        <button
          onClick={onOpenBatchModal}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-850 hover:bg-purple-950/40 border border-slate-700/60 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 transition-all shadow-sm"
          title="Open Multi-Query Batch & Workload Profiler"
        >
          <FontAwesomeIcon icon={faLayerGroup} className="text-purple-400" />
          <span className="hidden sm:inline">Batch Profiler</span>
        </button>

        {/* Export Audit Report */}
        <button
          onClick={onExportReport}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
          title="Export Optimization Audit Report (Markdown)"
        >
          <FontAwesomeIcon icon={faFileArrowDown} className="text-slate-400" />
          <span className="hidden sm:inline">Export Audit</span>
        </button>

        {/* GitHub link */}
        <a
          href="https://github.com/Humaam-04-06/QueryLens"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
          title="GitHub Repository: Humaam-04-06/QueryLens"
        >
          <FontAwesomeIcon icon={faGithub} className="text-sm" />
          <span className="hidden lg:inline">GitHub</span>
        </a>
      </div>
    </header>
  );
};
