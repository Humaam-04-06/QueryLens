export type QueryDialect = 'postgresql' | 'mysql' | 'sqlite';

export type IssueSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AnalysisIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  description: string;
  table?: string;
  column?: string;
  remediation?: string;
}

export interface ResourcePressure {
  cpu: number; // 0 - 100
  io: number;  // 0 - 100
  memory: number; // 0 - 100
}

export interface AnalysisResult {
  rawSql: string;
  dialect: QueryDialect;
  estimatedCost: number; // e.g. 82%
  score: number; // e.g. 18 / 100
  issues: AnalysisIssue[];
  resourcePressure: ResourcePressure;
  scannedTables: string[];
  projectedColumns: string[];
  hasCartesianProduct: boolean;
  hasSelectStar: boolean;
}

export interface IndexRecommendation {
  id: string;
  table: string;
  columns: string[];
  type: 'B-TREE' | 'COMPOSITE' | 'COVERING';
  ddl: string;
  reason: string;
  estimatedImprovementPct: number;
  isActiveInSimulation: boolean;
}

export interface SuggestedQuery {
  originalSql: string;
  optimizedSql: string;
  explanation: string;
  changes: string[];
}

export interface ExecutionPlanNode {
  id: string;
  label: string;
  operator: 'Seq Scan' | 'Index Scan' | 'Index Seek' | 'Hash Join' | 'Nested Loop' | 'Sort' | 'Aggregate' | 'Filter' | 'Limit' | 'Output';
  cost: number;
  estimatedRows: number;
  table?: string;
  filter?: string;
  isBottleneck?: boolean;
  children?: ExecutionPlanNode[];
}

export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
}

export interface TableCatalog {
  name: string;
  rowCount: number;
  columns: ColumnDefinition[];
  existingIndexes: string[];
}

export interface SchemaCatalog {
  id: string;
  name: string;
  description: string;
  tables: TableCatalog[];
}

export interface BenchmarkMetrics {
  originalTimeMs: number;
  optimizedTimeMs: number;
  speedupMultiplier: number;
  rowsExaminedOriginal: number;
  rowsExaminedOptimized: number;
  rowsReturned: number;
}
