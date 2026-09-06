import { AnalysisResult, IndexRecommendation, QueryDialect } from './index';

export interface BatchQueryItem {
  id: string;
  index: number;
  rawSql: string;
  dialect: QueryDialect;
  costScore: number;
  healthScore: number;
  criticalIssuesCount: number;
  warningIssuesCount: number;
  scannedTables: string[];
  analysis: AnalysisResult;
  recommendedIndexes: IndexRecommendation[];
}

export interface ConsolidatedIndex {
  id: string;
  table: string;
  columns: string[];
  ddl: string;
  benefittingQueryIndexes: number[];
  expectedImprovementPct: number;
  type: 'B-TREE' | 'COMPOSITE' | 'COVERING';
}

export interface BatchWorkloadReport {
  id: string;
  filename?: string;
  timestamp: number;
  totalQueries: number;
  avgCostScore: number;
  workloadHealthScore: number;
  totalIssuesCount: number;
  criticalQueriesCount: number;
  queries: BatchQueryItem[];
  consolidatedIndexes: ConsolidatedIndex[];
  estimatedTotalScannedRows: number;
}
