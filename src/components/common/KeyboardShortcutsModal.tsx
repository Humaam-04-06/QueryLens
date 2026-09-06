import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKeyboard, faXmark, faBolt, faCode, faClockRotateLeft, faTableList, faLayerGroup, faFileArrowDown } from '@fortawesome/free-solid-svg-icons';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  icon: any;
  title: string;
  description: string;
  keys: string[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts: ShortcutItem[] = [
    {
      icon: faBolt,
      title: 'Analyze & Optimize Query',
      description: 'Run full static AST rule engine and cost estimation',
      keys: ['Ctrl', 'Enter'],
    },
    {
      icon: faCode,
      title: 'Beautify / Format SQL',
      description: 'Format SQL query with standard indentation',
      keys: ['Ctrl', 'Shift', 'F'],
    },
    {
      icon: faClockRotateLeft,
      title: 'Query History & Bookmarks',
      description: 'Toggle persistent history drawer',
      keys: ['Ctrl', 'Shift', 'H'],
    },
    {
      icon: faTableList,
      title: 'Database Schema Catalog',
      description: 'Open schema explorer & table inspector',
      keys: ['Ctrl', 'Shift', 'S'],
    },
    {
      icon: faLayerGroup,
      title: 'Batch Workload Profiler',
      description: 'Analyze multi-query workloads and files',
      keys: ['Ctrl', 'Shift', 'B'],
    },
    {
      icon: faFileArrowDown,
      title: 'Export Audit Report',
      description: 'Download executive Markdown audit report',
      keys: ['Ctrl', 'Shift', 'E'],
    },
    {
      icon: faKeyboard,
      title: 'Keyboard Shortcuts Help',
      description: 'Open this hotkey reference dialog',
      keys: ['?'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-dark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-dark-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FontAwesomeIcon icon={faKeyboard} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">Power user keybindings for QueryLens Workbench</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-800 rounded-lg transition"
            title="Close (Esc)"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-3 overflow-y-auto">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-dark-950/50 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-dark-850 flex items-center justify-center text-slate-400 text-xs">
                  <FontAwesomeIcon icon={sc.icon} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">{sc.title}</div>
                  <div className="text-[11px] text-slate-500">{sc.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {sc.keys.map((key, kIdx) => (
                  <React.Fragment key={kIdx}>
                    <kbd className="px-2 py-0.5 text-xs font-mono font-medium text-sky-300 bg-dark-850 border border-slate-700 rounded-md shadow-sm">
                      {key}
                    </kbd>
                    {kIdx < sc.keys.length - 1 && (
                      <span className="text-slate-600 text-xs font-bold">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-dark-950/80 border-t border-slate-800 text-center text-xs text-slate-500">
          Tip: Press <kbd className="px-1.5 py-0.2 bg-dark-850 border border-slate-700 rounded font-mono text-[11px] text-slate-400">Esc</kbd> anytime to dismiss active modals or drawers.
        </div>
      </div>
    </div>
  );
};
