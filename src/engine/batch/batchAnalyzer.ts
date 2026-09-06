import { 
  QueryDialect, 
  SchemaCatalog, 
  BatchWorkloadReport, 
  BatchQueryItem, 
  ConsolidatedIndex,
  IndexRecommendation 
} from '../../types';
import { analyzeQuery } from '../analyzer/ruleEngine';
import { generateIndexRecommendations } from '../advisor/indexAdvisor';

/**
 * Robustly splits a SQL script into individual statements by semicolon,
 * ignoring semicolons enclosed in string literals, block comments, or line comments.
 */
export function splitBatchSql(script: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < script.length; i++) {
    const char = script[i];
    const nextChar = script[i + 1] || '';

    // Handle line comments (-- or //)
    if (!inSingleQuote && !inDoubleQuote && !inBacktick && !inBlockComment) {
      if ((char === '-' && nextChar === '-') || (char === '/' && nextChar === '/')) {
        inLineComment = true;
        current += char;
        continue;
      }
    }

    if (inLineComment) {
      current += char;
      if (char === '\n' || char === '\r') {
        inLineComment = false;
      }
      continue;
    }

    // Handle block comments (/* ... */)
    if (!inSingleQuote && !inDoubleQuote && !inBacktick && !inLineComment) {
      if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        current += char + nextChar;
        i++;
        continue;
      }
    }

    if (inBlockComment) {
      current += char;
      if (char === '*' && nextChar === '/') {
        current += nextChar;
        i++;
        inBlockComment = false;
      }
      continue;
    }

    // Handle quotes
    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }

    if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      continue;
    }

    if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      current += char;
      continue;
    }

    // Semicolon delimiter outside of strings and comments
    if (char === ';' && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      const trimmed = current.trim();
      if (isValidSqlStatement(trimmed)) {
        statements.push(trimmed);
      }
      current = '';
      continue;
    }

    current += char;
  }

  // Trailing query without semicolon
  const trailing = current.trim();
  if (isValidSqlStatement(trailing)) {
    statements.push(trailing);
  }

  return statements;
}

/**
 * Checks if a string contains actual SQL code rather than just whitespace or comments
 */
function isValidSqlStatement(sql: string): boolean {
  if (!sql) return false;
  // Strip comments
  const stripped = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();
  return stripped.length > 5;
}

/**
 * Analyzes a multi-query batch script, calculates aggregate workload statistics,
 * and consolidates deduplicated index recommendations across all queries.
 */
export function analyzeBatchWorkload(
  batchSql: string,
  dialect: QueryDialect,
  schema: SchemaCatalog,
  filename?: string
): BatchWorkloadReport {
  const statements = splitBatchSql(batchSql);
  const queries: BatchQueryItem[] = [];
  const rawIndexRecsMap = new Map<string, {
    rec: IndexRecommendation;
    queryIndexes: Set<number>;
  }>();

  statements.forEach((sqlStatement, idx) => {
    const queryNum = idx + 1;
    const analysis = analyzeQuery(sqlStatement, dialect, schema);
    const recs = generateIndexRecommendations(analysis, dialect, schema);

    const criticalCount = analysis.issues.filter((i) => i.severity === 'critical').length;
    const warningCount = analysis.issues.filter((i) => i.severity === 'warning').length;

    queries.push({
      id: `batch_q_${idx}_${Date.now()}`,
      index: queryNum,
      rawSql: sqlStatement,
      dialect,
      costScore: analysis.estimatedCost,
      healthScore: analysis.score,
      criticalIssuesCount: criticalCount,
      warningIssuesCount: warningCount,
      scannedTables: analysis.scannedTables,
      analysis,
      recommendedIndexes: recs,
    });

    // Group recommendations by table and column keys
    recs.forEach((rec) => {
      const key = `${rec.table.toLowerCase()}:${rec.columns.map((c) => c.toLowerCase()).sort().join(',')}`;
      if (!rawIndexRecsMap.has(key)) {
        rawIndexRecsMap.set(key, {
          rec,
          queryIndexes: new Set([queryNum]),
        });
      } else {
        const existing = rawIndexRecsMap.get(key)!;
        existing.queryIndexes.add(queryNum);
      }
    });
  });

  // Consolidate indexes into unified list
  const consolidatedIndexes: ConsolidatedIndex[] = Array.from(rawIndexRecsMap.values()).map(
    ({ rec, queryIndexes }, idx) => ({
      id: `cons_idx_${idx}`,
      table: rec.table,
      columns: rec.columns,
      ddl: rec.ddl,
      benefittingQueryIndexes: Array.from(queryIndexes).sort((a, b) => a - b),
      expectedImprovementPct: rec.estimatedImprovementPct,
      type: rec.type,
    })
  );

  // Sort consolidated indexes by number of queries impacted descending
  consolidatedIndexes.sort(
    (a, b) => b.benefittingQueryIndexes.length - a.benefittingQueryIndexes.length
  );

  // Calculate aggregates
  const totalQueries = queries.length;
  const avgCostScore = totalQueries > 0 
    ? Math.round(queries.reduce((acc, q) => acc + q.costScore, 0) / totalQueries) 
    : 0;
  const workloadHealthScore = totalQueries > 0
    ? Math.round(queries.reduce((acc, q) => acc + q.healthScore, 0) / totalQueries)
    : 100;
  const totalIssuesCount = queries.reduce((acc, q) => acc + q.analysis.issues.length, 0);
  const criticalQueriesCount = queries.filter((q) => q.criticalIssuesCount > 0).length;
  const estimatedTotalScannedRows = queries.reduce(
    (acc, q) => acc + (q.analysis.resourcePressure?.estimatedScannedRows || 0),
    0
  );

  return {
    id: `workload_${Date.now()}`,
    filename,
    timestamp: Date.now(),
    totalQueries,
    avgCostScore,
    workloadHealthScore,
    totalIssuesCount,
    criticalQueriesCount,
    queries,
    consolidatedIndexes,
    estimatedTotalScannedRows,
  };
}
