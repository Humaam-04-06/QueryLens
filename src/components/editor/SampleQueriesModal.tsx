import React from 'react';
import { SampleQuery, sampleQueries } from '../../engine/ast/sampleQueries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowRight, faBolt } from '@fortawesome/free-solid-svg-icons';

interface SampleQueriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: SampleQuery) => void;
}

export const SampleQueriesModal: React.FC<SampleQueriesModalProps> = ({
  isOpen,
  onClose,
  onSelectQuery,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Sample Query Benchmarks</h3>
              <p className="text-xs text-slate-400">Select an anti-pattern or real-world query scenario</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-dark-800 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {sampleQueries.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectQuery(item);
                onClose();
              }}
              className="group p-4 rounded-xl border border-slate-800/80 bg-dark-850 hover:bg-dark-800 hover:border-sky-500/40 cursor-pointer transition-all flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-200 group-hover:text-sky-300 transition">
                    {item.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-dark-900 text-slate-400 border border-slate-800">
                    {item.category}
                  </span>
                </div>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-xs text-slate-500 group-hover:text-sky-400 transition transform group-hover:translate-x-1"
                />
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>

              <pre className="p-2.5 rounded-lg bg-dark-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800/50">
                {item.sql}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
