import React, { useState, useEffect } from 'react';
import { HistoryItem, HistoryFilterMode, QueryDialect } from '../../types';
import { 
  getHistory, 
  toggleBookmark, 
  deleteHistoryItem, 
  clearHistory, 
  subscribeToHistory 
} from '../../services/historyStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClockRotateLeft, 
  faXmark, 
  faSearch, 
  faTrashCan, 
  faPlay, 
  faCopy, 
  faCheck, 
  faStar as faStarSolid,
  faFire,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

interface QueryHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadQuery: (query: string, dialect: QueryDialect, catalogId?: string) => void;
}

export const QueryHistoryDrawer: React.FC<QueryHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onLoadQuery,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filterMode, setFilterMode] = useState<HistoryFilterMode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Load history and subscribe to changes
  useEffect(() => {
    setHistoryItems(getHistory());
    const unsubscribe = subscribeToHistory((items) => {
      setHistoryItems(items);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  // Filter items based on active tab and search text
  const filteredItems = historyItems.filter((item) => {
    if (filterMode === 'bookmarked' && !item.isBookmarked) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchQuery = item.query.toLowerCase().includes(term);
      const matchDialect = item.dialect.toLowerCase().includes(term);
      const matchTitle = item.title?.toLowerCase().includes(term) ?? false;
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(term)) ?? false;
      return matchQuery || matchDialect || matchTitle || matchTags;
    }
    return true;
  });

  const bookmarkedCount = historyItems.filter((i) => i.isBookmarked).length;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleToggleBookmark = (id: string) => {
    toggleBookmark(id);
  };

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
  };

  const handleClear = () => {
    if (confirmClear) {
      clearHistory(filterMode === 'bookmarked' ? false : true);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3500);
    }
  };

  const formatRelativeTime = (timestamp: number): string => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 45) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-dark-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <FontAwesomeIcon icon={faClockRotateLeft} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">Query History & Bookmarks</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                  {historyItems.length} Saved
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Past optimizations, execution stats & starred queries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Close Drawer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-dark-950/40 space-y-3">
          <div className="flex items-center justify-between gap-2">
            {/* Tab toggles */}
            <div className="flex items-center gap-1.5 bg-dark-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                  filterMode === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FontAwesomeIcon icon={faClockRotateLeft} className="text-[11px]" />
                All ({historyItems.length})
              </button>
              <button
                onClick={() => setFilterMode('bookmarked')}
                className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                  filterMode === 'bookmarked'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FontAwesomeIcon icon={faStarSolid} className="text-[11px] text-amber-400" />
                Bookmarked ({bookmarkedCount})
              </button>
            </div>

            {/* Clear button */}
            {historyItems.length > 0 && (
              <button
                onClick={handleClear}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition flex items-center gap-1.5 ${
                  confirmClear
                    ? 'bg-rose-500 text-white border-rose-600 font-bold animate-pulse'
                    : 'bg-slate-800/60 text-slate-400 hover:text-rose-400 border-slate-700/60 hover:border-rose-500/40'
                }`}
                title={confirmClear ? 'Click again to permanently delete' : 'Clear history'}
              >
                <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                {confirmClear ? 'Confirm Delete?' : 'Clear'}
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SQL, table name, or dialect..."
              className="w-full bg-dark-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition"
            />
          </div>
        </div>

        {/* Query List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-3 border border-slate-700/60">
                <FontAwesomeIcon 
                  icon={filterMode === 'bookmarked' ? faStarRegular : faClockRotateLeft} 
                  className="text-lg" 
                />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">
                {filterMode === 'bookmarked' ? 'No Bookmarked Queries' : 'No Query History Found'}
              </h4>
              <p className="text-xs text-slate-500 max-w-[260px] mx-auto mt-1">
                {filterMode === 'bookmarked'
                  ? 'Star important queries to save them for quick benchmarking and re-analysis.'
                  : searchTerm
                  ? 'No past queries matched your search filter.'
                  : 'Run an analysis on any query in the editor and it will be recorded here.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isRose = item.costScore >= 65;
              const isAmber = item.costScore >= 35 && item.costScore < 65;

              return (
                <div
                  key={item.id}
                  className="group p-3.5 rounded-xl bg-dark-850/80 border border-slate-800 hover:border-slate-700/80 hover:bg-dark-850 transition duration-150 shadow-sm"
                >
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Dialect badge */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/80 uppercase font-semibold">
                        {item.dialect === 'postgresql' ? 'PostgreSQL' : item.dialect === 'mysql' ? 'MySQL' : 'SQLite'}
                      </span>

                      {/* Cost pill */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isRose
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : isAmber
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <FontAwesomeIcon icon={faFire} className="text-[8px]" />
                        {item.costScore}% Cost
                      </span>

                      {/* Issue count */}
                      {item.criticalIssueCount > 0 && (
                        <span className="text-[10px] font-semibold text-rose-400">
                          {item.criticalIssueCount} Critical
                        </span>
                      )}
                    </div>

                    {/* Bookmark star */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      <button
                        onClick={() => handleToggleBookmark(item.id)}
                        className={`p-1 rounded transition ${
                          item.isBookmarked
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                        title={item.isBookmarked ? 'Remove bookmark' : 'Bookmark query'}
                      >
                        <FontAwesomeIcon 
                          icon={item.isBookmarked ? faStarSolid : faStarRegular} 
                          className="text-xs" 
                        />
                      </button>
                    </div>
                  </div>

                  {/* SQL Snippet Preview */}
                  <div className="relative font-mono text-[11px] text-slate-300 bg-dark-950/70 p-2.5 rounded-lg border border-slate-800/80 line-clamp-3 overflow-hidden leading-relaxed">
                    {item.query}
                  </div>

                  {/* Action Bar */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <FontAwesomeIcon icon={faDatabase} className="text-[9px]" />
                      <span>{item.catalogId || 'Default'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Copy SQL */}
                      <button
                        onClick={() => handleCopy(item.id, item.query)}
                        className="px-2 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1"
                        title="Copy query to clipboard"
                      >
                        <FontAwesomeIcon 
                          icon={copiedId === item.id ? faCheck : faCopy} 
                          className={copiedId === item.id ? 'text-emerald-400' : ''} 
                        />
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {/* Load into Editor */}
                      <button
                        onClick={() => {
                          onLoadQuery(item.query, item.dialect, item.catalogId);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded text-[11px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 hover:border-cyan-500/50 transition flex items-center gap-1.5 shadow-sm"
                        title="Load query into SQL Editor & run analysis"
                      >
                        <FontAwesomeIcon icon={faPlay} className="text-[9px]" />
                        <span>Load Query</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete from history"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
};
