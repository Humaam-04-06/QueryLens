import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCircleCheck, 
  faBolt, 
  faMicrochip, 
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { QueryLensLogo } from './QueryLensLogo';

interface FooterProps {
  onOpenShortcuts?: () => void;
  onOpenBatchModal?: () => void;
  onToggleSchema?: () => void;
  onToggleHistory?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenShortcuts,
  onOpenBatchModal,
  onToggleSchema,
  onToggleHistory,
}) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-dark-950/90 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Subtitle */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <QueryLensLogo size="sm" animate={true} />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                QueryLens
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Intelligent SQL Query Static Analysis, Cost Estimation &amp; Execution Plan Visualizer
            </p>
          </div>
        </div>

        {/* Live System Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            <FontAwesomeIcon icon={faCircleCheck} className="text-[10px] text-emerald-400" />
            <span>AST Engine: Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/40 border border-sky-500/30 text-sky-300">
            <FontAwesomeIcon icon={faMicrochip} className="text-[10px] text-sky-400" />
            <span>SQLite WASM: Ready</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300">
            <FontAwesomeIcon icon={faBolt} className="text-[10px] text-purple-400" />
            <span>Multi-Dialect: PG / MySQL / SQLite</span>
          </div>
        </div>

        {/* Quick Links & Author Credits */}
        <div className="flex flex-col items-center md:items-end gap-2 text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            {onOpenShortcuts && (
              <button 
                onClick={onOpenShortcuts}
                className="hover:text-sky-400 transition"
              >
                Shortcuts (?)
              </button>
            )}
            {onToggleSchema && (
              <button 
                onClick={onToggleSchema}
                className="hover:text-sky-400 transition"
              >
                Schemas
              </button>
            )}
            {onOpenBatchModal && (
              <button 
                onClick={onOpenBatchModal}
                className="hover:text-purple-400 transition"
              >
                Batch Profiler
              </button>
            )}
            {onToggleHistory && (
              <button 
                onClick={onToggleHistory}
                className="hover:text-cyan-400 transition"
              >
                History
              </button>
            )}
            <a
              href="https://github.com/Humaam-04-06/QueryLens"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition"
              title="GitHub Repository"
            >
              <FontAwesomeIcon icon={faGithub} className="text-sm" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Crafted with</span>
            <FontAwesomeIcon icon={faHeart} className="text-[10px] text-rose-500" />
            <span>by</span>
            <a
              href="https://github.com/Humaam-04-06"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 hover:text-sky-400 transition underline underline-offset-2"
            >
              Humaam-04-06
            </a>
            <span>• MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
