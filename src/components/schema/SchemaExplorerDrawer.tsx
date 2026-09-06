import React, { useState } from 'react';
import { SchemaCatalog, TableCatalog } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTable, 
  faKey, 
  faXmark, 
  faDatabase, 
  faLayerGroup,
  faSearch,
  faChartSimple
} from '@fortawesome/free-solid-svg-icons';

interface SchemaExplorerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schemas: SchemaCatalog[];
  activeSchemaId: string;
  onSelectSchema: (schemaId: string) => void;
}

export const SchemaExplorerDrawer: React.FC<SchemaExplorerDrawerProps> = ({
  isOpen,
  onClose,
  schemas,
  activeSchemaId,
  onSelectSchema,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const currentSchema = schemas.find((s) => s.id === activeSchemaId) || schemas[0];

  if (!isOpen) return null;

  // Filter tables and columns by search term
  const filteredTables = currentSchema?.tables.filter((table: TableCatalog) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesTable = table.name.toLowerCase().includes(term);
    const matchesColumn = table.columns.some(col => col.name.toLowerCase().includes(term));
    return matchesTable || matchesColumn;
  }) || [];

  const totalRows = currentSchema?.tables.reduce((acc, t) => acc + t.rowCount, 0) || 0;
  const totalColumns = currentSchema?.tables.reduce((acc, t) => acc + t.columns.length, 0) || 0;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-dark-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <FontAwesomeIcon icon={faDatabase} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Database Schema Catalog</h3>
            <p className="text-[11px] text-slate-400">Inspected tables, indexes & data types</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-dark-800 transition"
          aria-label="Close Schema Catalog"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      {/* Catalog Selector & Stats */}
      <div className="p-4 border-b border-slate-800/80 bg-dark-950/40 space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Schema Catalog</label>
          <select
            value={activeSchemaId}
            onChange={(e) => onSelectSchema(e.target.value)}
            className="w-full bg-dark-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-sky-500 transition"
          >
            {schemas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Stats Pill */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
          <div className="p-1.5 rounded-lg bg-dark-900/80 border border-slate-800">
            <span className="text-slate-400 block">Tables</span>
            <span className="font-bold text-sky-400">{currentSchema?.tables.length || 0}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-dark-900/80 border border-slate-800">
            <span className="text-slate-400 block">Columns</span>
            <span className="font-bold text-indigo-400">{totalColumns}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-dark-900/80 border border-slate-800">
            <span className="text-slate-400 block">Total Records</span>
            <span className="font-bold text-emerald-400">~{(totalRows / 1000).toFixed(0)}k</span>
          </div>
        </div>

        {/* Search filter input */}
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-xs text-slate-500" />
          <input
            type="text"
            placeholder="Filter tables or columns (e.g. Country, Amount)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-dark-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
          />
        </div>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredTables.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No tables or columns match "{searchTerm}"
          </div>
        ) : (
          filteredTables.map((table: TableCatalog) => (
            <div
              key={table.name}
              className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 space-y-2.5 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faTable} className="text-sky-400 text-xs" />
                  <span className="font-semibold text-xs text-slate-200 font-mono">{table.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-slate-400 border border-slate-800 flex items-center gap-1">
                  <FontAwesomeIcon icon={faChartSimple} className="text-[9px] text-slate-500" />
                  ~{table.rowCount.toLocaleString()} rows
                </span>
              </div>

              {/* Columns list */}
              <div className="space-y-1 pt-1 border-t border-slate-800/60 font-mono text-[11px]">
                {table.columns.map((col) => {
                  const isMatch = searchTerm && col.name.toLowerCase().includes(searchTerm.toLowerCase());
                  return (
                    <div
                      key={col.name}
                      className={`flex items-center justify-between py-0.5 px-1 rounded ${
                        isMatch ? 'bg-sky-500/10 text-sky-300' : 'text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {col.isPrimaryKey && (
                          <FontAwesomeIcon icon={faKey} className="text-amber-400 text-[10px]" title="Primary Key" />
                        )}
                        <span className={col.isPrimaryKey ? 'text-amber-200 font-semibold' : 'text-slate-300'}>
                          {col.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{col.type}</span>
                    </div>
                  );
                })}
              </div>

              {/* Existing Indexes */}
              {table.existingIndexes && table.existingIndexes.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-indigo-400 text-[9px]" />
                    <span>Existing Indexes:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {table.existingIndexes.map((idx, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-dark-900 text-indigo-300 border border-indigo-500/20"
                      >
                        {idx}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
