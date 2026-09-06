import React, { useState } from 'react';
import { SampleQuery, sampleQueries } from '../../engine/ast/sampleQueries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faArrowRight, 
  faBolt,
  faSearch,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(sampleQueries.map((q) => q.category)))];

  const filteredQueries = sampleQueries.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sql.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-dark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Anti-Pattern Benchmark Library</h3>
              <p className="text-xs text-slate-400">Select real-world query bottlenecks to test AST diagnosis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-dark-800 transition"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-dark-950/50 flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium transition capitalize ${
                  selectedCategory === cat
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-56">
            <FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-2 text-xs text-slate-500" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-3 py-1 text-xs rounded-lg bg-dark-850 border border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
          {filteredQueries.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No sample queries match your search filter.
            </div>
          ) : (
            filteredQueries.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectQuery(item);
                  onClose();
                }}
                className="group p-4 rounded-xl border border-slate-800/80 bg-dark-850 hover:bg-dark-800 hover:border-sky-500/40 cursor-pointer transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-200 group-hover:text-sky-300 transition">
                      {item.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-dark-900 text-slate-400 border border-slate-800">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                      <FontAwesomeIcon icon={faDatabase} className="text-[8px]" />
                      {item.dialect.toUpperCase()}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};
