import React, { useState } from 'react';
import { QueryDialect, SchemaCatalog, BatchWorkloadReport } from '../../types';
import { analyzeBatchWorkload } from '../../engine/batch/batchAnalyzer';
import { SqlFileUploadZone } from '../common/SqlFileUploadZone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLayerGroup, 
  faXmark, 
  faBolt, 
  faListOl, 
  faLightbulb, 
  faFire, 
  faCopy, 
  faCheck, 
  faArrowRightToBracket, 
  faDatabase, 
  faRotateRight,
  faTrashCan
} from '@fortawesome/free-solid-svg-icons';

interface BatchWorkloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSchema: SchemaCatalog;
  dialect: QueryDialect;
  onInspectQueryInWorkbench: (query: string, dialect: QueryDialect) => void;
}

const SAMPLE_BATCH_SQL = `-- 1. Unindexed Customer filter with full row projection
SELECT *
FROM Orders
JOIN Customers
ON Orders.CustomerId = Customers.Id
WHERE Customers.Country = 'Pakistan';

-- 2. Heavy group-by aggregation on OrderItems
SELECT ProductId, SUM(Quantity) AS TotalSold, AVG(UnitPrice) AS AvgPrice
FROM OrderItems
GROUP BY ProductId
HAVING SUM(Quantity) > 50;

-- 3. Non-sargable date function wrapping column
SELECT Id, CustomerId, TotalAmount
FROM Orders
WHERE EXTRACT(YEAR FROM OrderDate) = 2024;

-- 4. Fast point-lookup on indexed primary key
SELECT Id, Name, Email
FROM Customers
WHERE Id = 1042;`;

export const BatchWorkloadModal: React.FC<BatchWorkloadModalProps> = ({
  isOpen,
  onClose,
  activeSchema,
  dialect,
  onInspectQueryInWorkbench,
}) => {
  const [batchSql, setBatchSql] = useState<string>(SAMPLE_BATCH_SQL);
  const [uploadedFilename, setUploadedFilename] = useState<string | undefined>(undefined);
  const [report, setReport] = useState<BatchWorkloadReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ranking' | 'indexes'>('ranking');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAllDdl, setCopiedAllDdl] = useState(false);

  if (!isOpen) return null;

  const handleRunBatchAnalysis = () => {
    if (!batchSql.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const generatedReport = analyzeBatchWorkload(
        batchSql, 
        dialect, 
        activeSchema, 
        uploadedFilename
      );
      setReport(generatedReport);
      setIsAnalyzing(false);
    }, 400);
  };

  const handleFileLoaded = (content: string, filename: string) => {
    setBatchSql(content);
    setUploadedFilename(filename);
    setReport(null);
  };

  const handleClearFile = () => {
    setUploadedFilename(undefined);
    setBatchSql('');
    setReport(null);
  };

  const handleLoadSample = () => {
    setBatchSql(SAMPLE_BATCH_SQL);
    setUploadedFilename(undefined);
    setReport(null);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAllDdl = () => {
    if (!report || report.consolidatedIndexes.length === 0) return;
    const allDdl = report.consolidatedIndexes.map((idx) => idx.ddl).join('\n\n');
    navigator.clipboard.writeText(allDdl);
    setCopiedAllDdl(true);
    setTimeout(() => setCopiedAllDdl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-dark-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-5xl bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-dark-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <FontAwesomeIcon icon={faLayerGroup} className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-100">Multi-Query Batch & Workload Profiler</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-purple-500/30 font-semibold">
                  Workload Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload a <span className="text-purple-300 font-mono">.sql</span> migration script or paste batch statements to identify workload bottlenecks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Close modal"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* File Upload Zone + SQL Text Input */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Upload Zone: 5 cols */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  1. Upload SQL File
                </span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 font-medium"
                >
                  <FontAwesomeIcon icon={faRotateRight} className="text-[10px]" />
                  <span>Load Sample Batch</span>
                </button>
              </div>

              <SqlFileUploadZone
                onFileLoaded={handleFileLoaded}
                loadedFilename={uploadedFilename}
                onClear={handleClearFile}
              />

              <div className="p-3 rounded-xl bg-dark-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <FontAwesomeIcon icon={faDatabase} className="text-purple-400 text-xs" />
                  <span>Active Catalog: {activeSchema.name}</span>
                </div>
                <p>Dialect: <span className="font-mono text-purple-300 uppercase">{dialect}</span></p>
                <p className="text-slate-500">Statements must be separated by semicolons (<code className="text-slate-400">;</code>).</p>
              </div>
            </div>

            {/* Right Text Area: 7 cols */}
            <div className="lg:col-span-7 space-y-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  2. Review or Edit Batch Script
                </span>
                {batchSql && (
                  <button
                    onClick={() => setBatchSql('')}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <textarea
                value={batchSql}
                onChange={(e) => {
                  setBatchSql(e.target.value);
                  setReport(null);
                }}
                placeholder="Paste multi-statement SQL script here (e.g. SELECT ...; SELECT ...;)..."
                rows={7}
                className="w-full flex-1 min-h-[160px] bg-dark-950/80 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/60 transition resize-none leading-relaxed"
              />

              {/* Action Button */}
              <button
                onClick={handleRunBatchAnalysis}
                disabled={isAnalyzing || !batchSql.trim()}
                className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-lg ${
                  isAnalyzing || !batchSql.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-glow-cyan'
                }`}
              >
                <FontAwesomeIcon icon={faBolt} className={isAnalyzing ? 'animate-spin' : ''} />
                <span>{isAnalyzing ? 'Analyzing Entire Workload...' : 'Profile Workload & Consolidate Indexes'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Report Dashboard */}
          {report && (
            <div className="space-y-6 pt-4 border-t border-slate-800/80">
              
              {/* Executive Summary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                
                {/* Workload Health */}
                <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Workload Health</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-2xl font-black font-mono ${
                      report.workloadHealthScore >= 70 ? 'text-emerald-400' : report.workloadHealthScore >= 40 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {report.workloadHealthScore}
                    </span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>

                {/* Avg Query Cost */}
                <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Avg Query Cost</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-2xl font-black font-mono ${
                      report.avgCostScore >= 65 ? 'text-rose-400' : report.avgCostScore >= 35 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {report.avgCostScore}%
                    </span>
                  </div>
                </div>

                {/* Total Queries */}
                <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Statements</span>
                  <div className="text-2xl font-black font-mono text-purple-400 mt-1">
                    {report.totalQueries}
                  </div>
                </div>

                {/* Critical Queries */}
                <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Critical Queries</span>
                  <div className={`text-2xl font-black font-mono mt-1 ${
                    report.criticalQueriesCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {report.criticalQueriesCount}
                  </div>
                </div>

                {/* Est. Scanned Rows */}
                <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 font-medium">Est. Scan Volume</span>
                  <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                    {report.estimatedTotalScannedRows > 1000 
                      ? `${Math.round(report.estimatedTotalScannedRows / 1000)}k rows` 
                      : `${report.estimatedTotalScannedRows} rows`}
                  </div>
                </div>
              </div>

              {/* View Switcher: Query Ranking vs Consolidated Indexes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('ranking')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                        activeTab === 'ranking'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FontAwesomeIcon icon={faListOl} />
                      <span>Bottleneck Rankings ({report.queries.length})</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('indexes')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                        activeTab === 'indexes'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FontAwesomeIcon icon={faLightbulb} />
                      <span>Consolidated Index Advisor ({report.consolidatedIndexes.length})</span>
                    </button>
                  </div>

                  {activeTab === 'indexes' && report.consolidatedIndexes.length > 0 && (
                    <button
                      onClick={handleCopyAllDdl}
                      className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={copiedAllDdl ? faCheck : faCopy} />
                      <span>{copiedAllDdl ? 'All DDL Copied!' : 'Copy All Batch DDL'}</span>
                    </button>
                  )}
                </div>

                {/* Tab Content 1: Query Rankings */}
                {activeTab === 'ranking' && (
                  <div className="space-y-3">
                    {report.queries
                      .slice()
                      .sort((a, b) => b.costScore - a.costScore)
                      .map((q, rankIdx) => {
                        const isWorst = q.costScore >= 65;
                        const isModerate = q.costScore >= 35 && q.costScore < 65;

                        return (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl bg-dark-850 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center ${
                                  rankIdx === 0 && isWorst
                                    ? 'bg-rose-500 text-white shadow-sm'
                                    : 'bg-dark-800 text-slate-400'
                                }`}>
                                  #{rankIdx + 1}
                                </span>

                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                  isWorst
                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    : isModerate
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                }`}>
                                  <FontAwesomeIcon icon={faFire} className="text-[10px]" />
                                  {q.costScore}% Cost
                                </span>

                                {q.criticalIssuesCount > 0 && (
                                  <span className="text-xs font-semibold text-rose-400">
                                    {q.criticalIssuesCount} Critical Issues
                                  </span>
                                )}

                                {q.scannedTables.length > 0 && (
                                  <span className="text-[11px] font-mono text-slate-500">
                                    Tables: {q.scannedTables.join(', ')}
                                  </span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopyText(q.id, q.rawSql)}
                                  className="px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1"
                                >
                                  <FontAwesomeIcon icon={copiedId === q.id ? faCheck : faCopy} />
                                  <span>{copiedId === q.id ? 'Copied' : 'Copy'}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    onInspectQueryInWorkbench(q.rawSql, q.dialect);
                                    onClose();
                                  }}
                                  className="px-2.5 py-1 rounded text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition flex items-center gap-1.5"
                                  title="Load this query into the main workbench for full execution plan and live benchmark"
                                >
                                  <FontAwesomeIcon icon={faArrowRightToBracket} className="text-[10px]" />
                                  <span>Inspect in Workbench</span>
                                </button>
                              </div>
                            </div>

                            {/* SQL Snippet Preview */}
                            <pre className="p-2.5 rounded-lg bg-dark-950 font-mono text-[11px] text-slate-300 border border-slate-800/80 overflow-x-auto whitespace-pre-wrap">
                              {q.rawSql}
                            </pre>

                            {/* Issues summary tags */}
                            {q.analysis.issues.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {q.analysis.issues.map((iss) => (
                                  <span
                                    key={iss.id}
                                    className={`text-[10px] px-2 py-0.5 rounded border ${
                                      iss.severity === 'critical'
                                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                        : iss.severity === 'warning'
                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                        : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                                    }`}
                                  >
                                    {iss.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Tab Content 2: Consolidated Index Advisor */}
                {activeTab === 'indexes' && (
                  <div className="space-y-3">
                    {report.consolidatedIndexes.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <FontAwesomeIcon icon={faLightbulb} className="text-2xl text-emerald-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-200">No New Indexes Required</p>
                        <p className="text-xs text-slate-500">All queries in this batch utilize existing schema keys efficiently.</p>
                      </div>
                    ) : (
                      report.consolidatedIndexes.map((consIdx) => (
                        <div
                          key={consIdx.id}
                          className="p-4 rounded-xl bg-dark-850 border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                                {consIdx.type}
                              </span>
                              <span className="text-xs font-semibold text-slate-200">
                                Table: <code className="text-purple-300">{consIdx.table}</code> ({consIdx.columns.join(', ')})
                              </span>
                              <span className="text-xs text-emerald-400 font-semibold">
                                ~{consIdx.expectedImprovementPct}% Est. Boost
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 bg-dark-900 px-2 py-0.5 rounded border border-slate-800">
                                Accelerates Queries: {consIdx.benefittingQueryIndexes.map((i) => `#${i}`).join(', ')}
                              </span>
                              <button
                                onClick={() => handleCopyText(consIdx.id, consIdx.ddl)}
                                className="px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1"
                              >
                                <FontAwesomeIcon icon={copiedId === consIdx.id ? faCheck : faCopy} />
                                <span>{copiedId === consIdx.id ? 'Copied' : 'Copy DDL'}</span>
                              </button>
                            </div>
                          </div>

                          <pre className="p-2.5 rounded-lg bg-dark-950 font-mono text-[11px] text-emerald-300 border border-slate-800/80 overflow-x-auto">
                            {consIdx.ddl}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-dark-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Powered by QueryLens Workload Analyzer & Rule Consolidation Engine
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
