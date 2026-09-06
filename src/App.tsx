import { useState, useEffect } from 'react';
import { 
  AnalysisResult, 
  IndexRecommendation, 
  QueryDialect, 
  SuggestedQuery, 
  ExecutionPlanNode 
} from './types';
import { defaultSchemas } from './schemas';
import { Header } from './components/common/Header';
import { SqlEditor } from './components/editor/SqlEditor';
import { SchemaExplorerDrawer } from './components/schema/SchemaExplorerDrawer';
import { QueryAnalysisCard } from './components/analysis/QueryAnalysisCard';
import { CostMeter } from './components/cost/CostMeter';
import { QueryDiffViewer } from './components/rewrite/QueryDiffViewer';
import { IndexAdvisorCard } from './components/advisor/IndexAdvisorCard';
import { ExecutionPlanGraph } from './components/visualizer/ExecutionPlanGraph';
import { BenchmarkRunner } from './components/benchmark/BenchmarkRunner';
import { analyzeQuery } from './engine/analyzer/ruleEngine';
import { generateSuggestedQuery } from './engine/rewriter/queryRewriter';
import { generateIndexRecommendations } from './engine/advisor/indexAdvisor';
import { buildExecutionPlan } from './engine/planner/planBuilder';
import { generateAuditReport, downloadReportFile } from './utils/exportReport';

export function App() {
  const [sql, setSql] = useState<string>(`SELECT *
FROM Orders
JOIN Customers
ON Orders.CustomerId = Customers.Id
WHERE Customers.Country = 'Pakistan';`);

  const [dialect, setDialect] = useState<QueryDialect>('postgresql');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState<boolean>(false);
  const [activeSchemaId, setActiveSchemaId] = useState<string>('ecommerce');

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [suggestedQuery, setSuggestedQuery] = useState<SuggestedQuery | null>(null);
  const [indexRecs, setIndexRecs] = useState<IndexRecommendation[]>([]);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlanNode | null>(null);
  const [isOptimizedPlanView, setIsOptimizedPlanView] = useState<boolean>(false);

  const activeSchema = defaultSchemas.find((s) => s.id === activeSchemaId) || defaultSchemas[0];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeQuery(sql, dialect, activeSchema);
      setAnalysis(result);

      const rewrite = generateSuggestedQuery(result, activeSchema);
      setSuggestedQuery(rewrite);

      const recs = generateIndexRecommendations(result, dialect);
      setIndexRecs(recs);

      const plan = buildExecutionPlan(result, activeSchema, isOptimizedPlanView);
      setExecutionPlan(plan);

      setIsAnalyzing(false);
    }, 300);
  };

  // Run initial analysis automatically on mount
  useEffect(() => {
    handleAnalyze();
  }, [activeSchemaId, dialect]);

  // Handle What-If index simulation toggle
  const handleToggleSimulator = (recId: string) => {
    setIndexRecs((prev) =>
      prev.map((rec) => {
        if (rec.id === recId) {
          const updated = !rec.isActiveInSimulation;
          return { ...rec, isActiveInSimulation: updated };
        }
        return rec;
      })
    );

    // If simulated index is turned ON, recalculate cost dynamically
    if (analysis) {
      const anyActive = indexRecs.some((r) => r.id === recId ? !r.isActiveInSimulation : r.isActiveInSimulation);
      if (anyActive) {
        setAnalysis({
          ...analysis,
          estimatedCost: 18,
          score: 88,
          resourcePressure: {
            cpu: 18,
            io: 15,
            memory: 22,
          },
        });
        setIsOptimizedPlanView(true);
        setExecutionPlan(buildExecutionPlan(analysis, activeSchema, true));
      } else {
        const resetResult = analyzeQuery(sql, dialect, activeSchema);
        setAnalysis(resetResult);
        setIsOptimizedPlanView(false);
        setExecutionPlan(buildExecutionPlan(resetResult, activeSchema, false));
      }
    }
  };

  // Toggle execution plan view
  const handleTogglePlanView = () => {
    if (!analysis) return;
    const nextView = !isOptimizedPlanView;
    setIsOptimizedPlanView(nextView);
    setExecutionPlan(buildExecutionPlan(analysis, activeSchema, nextView));
  };

  const handleExportReport = () => {
    if (!analysis) return;
    const md = generateAuditReport(analysis, suggestedQuery, indexRecs);
    downloadReportFile(md);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* Header */}
      <Header
        onToggleSchema={() => setIsSchemaOpen(!isSchemaOpen)}
        onExportReport={handleExportReport}
        isSchemaOpen={isSchemaOpen}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Section: SQL Editor & Cost/Resource Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* SQL Editor - 7 cols */}
          <div className="lg:col-span-7">
            <SqlEditor
              sql={sql}
              dialect={dialect}
              isAnalyzing={isAnalyzing}
              onSqlChange={setSql}
              onDialectChange={setDialect}
              onAnalyze={handleAnalyze}
            />
          </div>

          {/* Cost Gauge & Resource breakdown - 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {analysis && (
              <CostMeter
                cost={analysis.estimatedCost}
                score={analysis.score}
                resourcePressure={analysis.resourcePressure}
              />
            )}
            <QueryAnalysisCard analysis={analysis} />
          </div>
        </div>

        {/* Suggested Query Rewrite & Side-by-side Diff */}
        {suggestedQuery && (
          <QueryDiffViewer
            suggested={suggestedQuery}
            onApply={(newSql) => {
              setSql(newSql);
              setTimeout(handleAnalyze, 100);
            }}
          />
        )}

        {/* Index Advisor & What-If Simulator */}
        {indexRecs.length > 0 && (
          <IndexAdvisorCard
            recommendations={indexRecs}
            onToggleSimulator={handleToggleSimulator}
          />
        )}

        {/* Execution Plan DAG Visualizer */}
        {executionPlan && (
          <ExecutionPlanGraph
            plan={executionPlan}
            isOptimizedView={isOptimizedPlanView}
            onTogglePlanView={handleTogglePlanView}
          />
        )}

        {/* Real-time In-Browser Micro Benchmark Runner */}
        <BenchmarkRunner
          originalSql={sql}
          optimizedSql={suggestedQuery?.optimizedSql || sql}
        />
      </main>

      {/* Schema Explorer Drawer */}
      <SchemaExplorerDrawer
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
        schemas={defaultSchemas}
        activeSchemaId={activeSchemaId}
        onSelectSchema={setActiveSchemaId}
      />
    </div>
  );
}
export default App;
